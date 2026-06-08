"""
需求接口（成员B 维护）

接口：
    POST   /api/posts          — 创建需求（含标签关联）
    GET    /api/posts          — 需求列表（搜索+筛选+分页）
    GET    /api/posts/{id}     — 需求详情（含发布人信息、标签、是否已申请）
    PUT    /api/posts/{id}     — 编辑需求（仅发布者可操作）
    DELETE /api/posts/{id}     — 删除需求（仅发布者可操作）
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.core.database import get_db
from app.core.deps import get_current_user_id, get_optional_user_id
from app.utils.response import ok, err
from app.models.post import Post, PostTag
from app.models.tag import Tag
from app.models.user import User
from app.models.application import Application
from app.schemas.post import PostCreateRequest, PostUpdateRequest

router = APIRouter()


# ── 工具函数 ─────────────────────────────────────────────
def _resolve_tags(db: Session, tag_names: list[str]) -> list[Tag]:
    """根据标签名列表查找已有 Tag，不存在的自动创建。返回 Tag 对象列表。"""
    if not tag_names:
        return []
    tags: list[Tag] = []
    for name in tag_names:
        name = name.strip()
        if not name:
            continue
        tag = db.query(Tag).filter(Tag.name == name).first()
        if not tag:
            tag = Tag(name=name)
            db.add(tag)
            db.flush()  # 先拿到 id，后续建关联用
        tags.append(tag)
    return tags


def _post_to_dict(post: Post, db: Session, current_user_id: int | None = None) -> dict:
    """将 Post ORM 对象转为前端需要的 dict，包含发布人信息、标签、是否已申请。"""
    # 发布人信息
    user = db.query(User).filter(User.id == post.user_id).first()
    # 关联标签
    tag_objs = (
        db.query(Tag)
        .join(PostTag, PostTag.tag_id == Tag.id)
        .filter(PostTag.post_id == post.id)
        .all()
    )
    # 当前用户是否已申请
    has_applied = False
    if current_user_id:
        existing = (
            db.query(Application)
            .filter(
                Application.post_id == post.id,
                Application.applicant_id == current_user_id,
            )
            .first()
        )
        has_applied = existing is not None

    return {
        "id": post.id,
        "user_id": post.user_id,
        "title": post.title,
        "content": post.content,
        "category": post.category,
        "location": post.location,
        "start_time": post.start_time.isoformat() if post.start_time else None,
        "end_time": post.end_time.isoformat() if post.end_time else None,
        "max_members": post.max_members,
        "status": post.status,
        "created_at": post.created_at.isoformat() if post.created_at else None,
        "updated_at": post.updated_at.isoformat() if post.updated_at else None,
        "user": {
            "id": user.id,
            "username": user.username,
            "nickname": user.nickname,
            "avatar_url": user.avatar_url,
        } if user else None,
        "tags": [{"id": t.id, "name": t.name} for t in tag_objs],
        "has_applied": has_applied,
    }


# ── 接口实现 ─────────────────────────────────────────────
@router.post("")
def create_post(
    body: PostCreateRequest,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id),
):
    """创建搭子需求，支持附带标签。"""
    # 基本字段校验
    if not body.title or not body.title.strip():
        return err(400, "标题不能为空")
    if len(body.title) > 200:
        return err(400, "标题不能超过200字")
    if not body.content or not body.content.strip():
        return err(400, "内容不能为空")
    if not body.category or not body.category.strip():
        return err(400, "分类不能为空")

    # 时间校验
    if body.start_time and body.end_time and body.start_time >= body.end_time:
        return err(400, "开始时间必须早于结束时间")

    # 创建需求
    post = Post(
        user_id=current_user_id,
        title=body.title.strip(),
        content=body.content.strip(),
        category=body.category.strip(),
        location=body.location.strip() if body.location else None,
        start_time=body.start_time,
        end_time=body.end_time,
        max_members=body.max_members,
    )
    db.add(post)
    db.flush()  # 获取 post.id

    # 关联标签
    if body.tags:
        tag_objs = _resolve_tags(db, body.tags)
        for tag in tag_objs:
            db.add(PostTag(post_id=post.id, tag_id=tag.id))

    db.commit()
    db.refresh(post)

    return ok("发布成功", {"id": post.id})


@router.get("")
def list_posts(
    keyword: str = Query(None, description="搜索关键词（模糊匹配标题和内容）"),
    category: str = Query(None, description="分类精确筛选"),
    status: int = Query(None, description="状态筛选：1=招募中 2=已满 3=已结束"),
    page: int = Query(1, ge=1, description="页码"),
    page_size: int = Query(10, ge=1, le=50, description="每页条数"),
    db: Session = Depends(get_db),
):
    """获取需求列表，支持关键词搜索、分类筛选、状态筛选、分页。"""
    query = db.query(Post)

    # 关键词模糊搜索
    if keyword:
        kw = keyword.strip()
        query = query.filter(
            or_(Post.title.contains(kw), Post.content.contains(kw))
        )
    # 分类筛选
    if category:
        query = query.filter(Post.category == category.strip())
    # 状态筛选
    if status is not None:
        query = query.filter(Post.status == status)

    total = query.count()
    posts = (
        query.order_by(Post.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    # 列表页内容截断，减少传输量
    items = []
    for post in posts:
        item = _post_to_dict(post, db)
        # 列表页只展示前200字内容摘要
        item["content"] = post.content[:200] + ("..." if len(post.content) > 200 else "")
        items.append(item)

    return ok("success", {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size if total > 0 else 0,
    })


@router.get("/{post_id}")
def get_post(
    post_id: int,
    db: Session = Depends(get_db),
    current_user_id: int | None = Depends(get_optional_user_id),
):
    """获取需求详情。未登录可查看，登录后额外返回 has_applied 字段。"""
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        return err(404, "需求不存在")

    return ok("success", _post_to_dict(post, db, current_user_id))


@router.put("/{post_id}")
def update_post(
    post_id: int,
    body: PostUpdateRequest,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id),
):
    """编辑需求，仅发布者可操作。所有字段可选，传了就更新。"""
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        return err(404, "需求不存在")
    if post.user_id != current_user_id:
        return err(403, "只能编辑自己发布的需求")

    # 逐字段更新（只更新传入的字段）
    if body.title is not None:
        if not body.title.strip():
            return err(400, "标题不能为空")
        if len(body.title) > 200:
            return err(400, "标题不能超过200字")
        post.title = body.title.strip()
    if body.content is not None:
        if not body.content.strip():
            return err(400, "内容不能为空")
        post.content = body.content.strip()
    if body.category is not None:
        if not body.category.strip():
            return err(400, "分类不能为空")
        post.category = body.category.strip()
    if body.location is not None:
        post.location = body.location.strip() if body.location else None
    if body.start_time is not None:
        post.start_time = body.start_time
    if body.end_time is not None:
        post.end_time = body.end_time
    if body.max_members is not None:
        if body.max_members < 1:
            return err(400, "最大人数至少为1")
        post.max_members = body.max_members
    if body.status is not None:
        if body.status not in (1, 2, 3):
            return err(400, "状态值无效（1=招募中 2=已满 3=已结束）")
        post.status = body.status

    # 时间校验
    if post.start_time and post.end_time and post.start_time >= post.end_time:
        return err(400, "开始时间必须早于结束时间")

    # 标签更新：如果传了 tags，先删旧关联再建新的
    if body.tags is not None:
        db.query(PostTag).filter(PostTag.post_id == post.id).delete()
        tag_objs = _resolve_tags(db, body.tags)
        for tag in tag_objs:
            db.add(PostTag(post_id=post.id, tag_id=tag.id))

    db.commit()
    db.refresh(post)

    return ok("更新成功", _post_to_dict(post, db, current_user_id))


@router.delete("/{post_id}")
def delete_post(
    post_id: int,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id),
):
    """删除需求，仅发布者可操作。"""
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        return err(404, "需求不存在")
    if post.user_id != current_user_id:
        return err(403, "只能删除自己发布的需求")

    # 先删关联的 post_tags，再删 post（CASCADE 配置了也可不手动删）
    db.query(PostTag).filter(PostTag.post_id == post.id).delete()
    db.delete(post)
    db.commit()

    return ok("删除成功", {})
