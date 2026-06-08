"""
申请接口（成员C 维护）

接口：
    POST   /api/applications                  — 提交申请
    GET    /api/applications/me               — 我的申请列表
    GET    /api/applications/received         — 我收到的申请列表
    GET    /api/posts/{id}/applications       — 需求收到的申请列表
    PUT    /api/applications/{id}             — 审核申请

规则：
    - 同一用户不可重复申请同一需求（数据库唯一约束兜底）
    - 不可申请自己发布的需求
    - 仅需求发布者可查看申请列表和审核申请
    - 审核通过时自动判断是否满员并更新需求状态
    - 申请提交/审核后自动创建通知
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user_id
from app.models.application import Application
from app.models.notification import Notification
from app.models.post import Post
from app.models.user import User
from app.schemas.application import ApplicationCreateRequest, ApplicationReviewRequest
from app.utils.response import err, ok

# ---- 主路由：挂载到 /api/applications ----
router = APIRouter()

# ---- 辅助路由：用于跨模块路径 /api/posts/{id}/applications ----
post_app_router = APIRouter()


# ==================== POST /applications ====================
@router.post("")
def submit_application(
    req: ApplicationCreateRequest,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id),
):
    """
    提交加入申请。

    校验规则：
        1. 需求必须存在
        2. 不可申请自己发布的需求
        3. 同一需求不可重复申请（唯一约束 uk_post_applicant 兜底）
        4. 申请成功后自动通知需求发布者
    """
    # 查询需求是否存在
    post = db.query(Post).filter(Post.id == req.post_id).first()
    if not post:
        return err(404, "需求不存在")

    # 不可申请自己的需求
    if post.user_id == current_user_id:
        return err(400, "不能申请自己发布的需求")

    # 检查是否已申请（在 commit 前提前拦截，给更友好的错误提示）
    existing = (
        db.query(Application)
        .filter(
            Application.post_id == req.post_id,
            Application.applicant_id == current_user_id,
        )
        .first()
    )
    if existing:
        return err(409, "您已申请过该需求，请勿重复申请")

    # 创建申请记录
    application = Application(
        post_id=req.post_id,
        applicant_id=current_user_id,
        message=req.message,
        status=0,  # 0=待审核
    )
    db.add(application)

    # 自动通知需求发布者
    notification = Notification(
        user_id=post.user_id,
        title="新的申请",
        content=f"你的需求「{post.title}」收到新的申请",
        is_read=0,
    )
    db.add(notification)

    db.commit()
    db.refresh(application)

    return ok(
        "申请提交成功",
        {
            "id": application.id,
            "created_at": application.created_at.isoformat()
            if application.created_at
            else None,
        },
    )


# ==================== GET /applications/me ====================
@router.get("/me")
def my_applications(
    status: int = Query(None, description="状态筛选：0=待审核 1=已通过 2=已拒绝"),
    page: int = Query(1, ge=1, description="页码"),
    page_size: int = Query(10, ge=1, le=50, description="每页数量"),
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id),
):
    """
    获取我提交的申请列表（含关联需求信息）。

    支持按状态筛选 + 分页，按申请时间倒序排列。
    """
    # 基础查询：我提交的所有申请
    query = db.query(Application).filter(
        Application.applicant_id == current_user_id
    )

    # 可选的状态筛选
    if status is not None:
        query = query.filter(Application.status == status)

    # 总数
    total = query.count()

    # 分页 + 按创建时间倒序
    applications = (
        query.order_by(Application.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    # 组装返回数据：每条申请附带所属需求摘要
    result_list = []
    for app in applications:
        post = db.query(Post).filter(Post.id == app.post_id).first()
        result_list.append(
            {
                "id": app.id,
                "post_id": app.post_id,
                "status": app.status,
                "message": app.message,
                "created_at": app.created_at.isoformat()
                if app.created_at
                else None,
                "post": {
                    "id": post.id,
                    "title": post.title,
                    "category": post.category,
                    "status": post.status,
                }
                if post
                else None,
            }
        )

    return ok(
        "success",
        {
            "total": total,
            "page": page,
            "list": result_list,
        },
    )


# ==================== GET /applications/received ====================
@router.get("/received")
def received_applications(
    status: int = Query(None, description="状态筛选：0=待审核 1=已通过 2=已拒绝"),
    page: int = Query(1, ge=1, description="页码"),
    page_size: int = Query(10, ge=1, le=50, description="每页数量"),
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id),
):
    """
    获取我收到的申请列表（聚合我发布的所有需求收到的申请）。

    用于「收到的申请」Tab —— 无需前端逐个拉取每个需求的申请。
    返回申请人信息 + 所属需求标题，按申请时间倒序排列。
    """
    # 我发布的所有需求 ID
    my_post_ids = (
        db.query(Post.id).filter(Post.user_id == current_user_id).subquery()
    )

    # 这些需求收到的所有申请
    query = db.query(Application).filter(
        Application.post_id.in_(my_post_ids)
    )

    if status is not None:
        query = query.filter(Application.status == status)

    total = query.count()

    applications = (
        query.order_by(Application.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    # 批量预取关联数据，避免 N+1 查询
    applicant_ids = {app.applicant_id for app in applications}
    post_ids = {app.post_id for app in applications}

    users_map = {}
    if applicant_ids:
        users = (
            db.query(User)
            .filter(User.id.in_(applicant_ids))
            .all()
        )
        users_map = {u.id: u for u in users}

    posts_map = {}
    if post_ids:
        posts = db.query(Post).filter(Post.id.in_(post_ids)).all()
        posts_map = {p.id: p for p in posts}

    result_list = []
    for app in applications:
        applicant = users_map.get(app.applicant_id)
        post = posts_map.get(app.post_id)

        result_list.append(
            {
                "id": app.id,
                "post_id": app.post_id,
                "applicant_id": app.applicant_id,
                "status": app.status,
                "message": app.message,
                "created_at": app.created_at.isoformat()
                if app.created_at
                else None,
                "applicant": {
                    "id": applicant.id,
                    "nickname": applicant.nickname,
                    "avatar_url": applicant.avatar_url,
                    "major": applicant.major,
                    "grade": applicant.grade,
                }
                if applicant
                else None,
                "post": {
                    "id": post.id,
                    "title": post.title,
                }
                if post
                else None,
            }
        )

    return ok(
        "success",
        {
            "total": total,
            "page": page,
            "list": result_list,
        },
    )


# ==================== GET /posts/{id}/applications ====================
@post_app_router.get("/{post_id}/applications")
def post_applications(
    post_id: int,
    status: int = Query(None, description="状态筛选：0=待审核 1=已通过 2=已拒绝"),
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id),
):
    """
    获取单个需求收到的所有申请（仅需求发布者可查看）。

    返回申请人信息 + 申请留言 + 状态。
    """
    # 验证需求存在
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        return err(404, "需求不存在")

    # 仅发布者可查看
    if post.user_id != current_user_id:
        return err(403, "仅需求发布者可查看申请列表")

    # 查询申请
    query = db.query(Application).filter(Application.post_id == post_id)
    if status is not None:
        query = query.filter(Application.status == status)

    applications = query.order_by(Application.created_at.desc()).all()

    # 批量获取申请人信息
    applicant_ids = {app.applicant_id for app in applications}
    users_map = {}
    if applicant_ids:
        users = db.query(User).filter(User.id.in_(applicant_ids)).all()
        users_map = {u.id: u for u in users}

    result_list = []
    for app in applications:
        applicant = users_map.get(app.applicant_id)
        result_list.append(
            {
                "id": app.id,
                "applicant": {
                    "id": applicant.id,
                    "nickname": applicant.nickname,
                    "avatar_url": applicant.avatar_url,
                    "major": applicant.major,
                    "grade": applicant.grade,
                }
                if applicant
                else None,
                "message": app.message,
                "status": app.status,
                "created_at": app.created_at.isoformat()
                if app.created_at
                else None,
            }
        )

    return ok("success", result_list)


# ==================== PUT /applications/{id} ====================
@router.put("/{application_id}")
def review_application(
    application_id: int,
    req: ApplicationReviewRequest,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id),
):
    """
    审核申请（通过 / 拒绝）。

    规则：
        1. 仅需求发布者可操作
        2. 不可重复审核（已审核过的申请直接拒绝）
        3. 审核通过时，若已通过人数 >= 最大人数，自动将需求状态改为「已满」
        4. 审核后自动通知申请人
    """
    # 查找申请
    application = (
        db.query(Application).filter(Application.id == application_id).first()
    )
    if not application:
        return err(404, "申请不存在")

    # 查找关联需求
    post = db.query(Post).filter(Post.id == application.post_id).first()
    if not post:
        return err(404, "关联需求不存在")

    # 权限校验：仅需求发布者可审核
    if post.user_id != current_user_id:
        return err(403, "仅需求发布者可审核申请")

    # 状态值校验
    if req.status not in (1, 2):
        return err(400, "审核状态无效，1=通过 2=拒绝")

    # 防止重复审核
    if application.status != 0:
        return err(400, "该申请已被审核，不可重复操作")

    # 更新申请状态
    application.status = req.status

    # 如果通过，判断是否满员
    if req.status == 1:
        approved_count = (
            db.query(Application)
            .filter(
                Application.post_id == post.id,
                Application.status == 1,
            )
            .count()
        )
        # approved_count 包含本次刚通过的申请（status 已改为 1，但还未 commit）
        # 注意：上面修改了 application.status=1，这里 count 查询会包含它
        if approved_count >= post.max_members:
            post.status = 2  # 状态改为「已满」

    # 创建通知给申请人
    status_text = "通过" if req.status == 1 else "拒绝"
    notification = Notification(
        user_id=application.applicant_id,
        title=f"申请已被{status_text}",
        content=f"你申请的「{post.title}」需求已被{status_text}",
        is_read=0,
    )
    db.add(notification)

    db.commit()

    return ok("审核成功", {})
