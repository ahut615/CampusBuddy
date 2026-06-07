"""
通知接口（成员D 维护）

接口：
    GET  /api/notifications              — 我的通知列表
    PUT  /api/notifications/{id}/read     — 标记单个为已读
    PUT  /api/notifications/read-all      — 全部已读
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.database import get_db
from app.core.deps import get_current_user_id
from app.models.notification import Notification
from app.utils.response import ok, err

router = APIRouter()


@router.get("")
def list_notifications(
    is_read: int | None = Query(None, description="筛选条件：0=未读 1=已读，不传则全部"),
    page: int = Query(1, ge=1, description="页码（从1开始）"),
    page_size: int = Query(10, ge=1, le=50, description="每页条数（1-50）"),
    current_user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """
    获取当前用户的通知列表。
    支持按 is_read 筛选，返回分页结果和未读总数。
    """
    # 基础查询：当前用户的通知
    query = db.query(Notification).filter(
        Notification.user_id == current_user_id
    )

    # 按已读/未读筛选
    if is_read is not None:
        query = query.filter(Notification.is_read == is_read)

    # 按创建时间倒序排列
    query = query.order_by(Notification.created_at.desc())

    # 查询未读总数（不受筛选条件影响）
    unread_count = (
        db.query(func.count(Notification.id))
        .filter(
            Notification.user_id == current_user_id,
            Notification.is_read == 0,
        )
        .scalar()
    )

    # 查询总数（受筛选条件影响）
    total = query.count()

    # 分页
    offset = (page - 1) * page_size
    notifications = query.offset(offset).limit(page_size).all()

    # 构建返回数据
    notification_list = []
    for n in notifications:
        notification_list.append({
            "id": n.id,
            "title": n.title,
            "content": n.content,
            "is_read": n.is_read,
            "created_at": str(n.created_at) if n.created_at else None,
        })

    return ok("获取通知列表成功", {
        "total": total,
        "page": page,
        "page_size": page_size,
        "unread_count": unread_count,
        "list": notification_list,
    })


@router.put("/{notification_id}/read")
def mark_read(
    notification_id: int,
    current_user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """
    标记指定通知为已读。
    仅通知接收者可操作。
    """
    # 查询通知
    notification = (
        db.query(Notification)
        .filter(Notification.id == notification_id)
        .first()
    )

    # 通知不存在
    if notification is None:
        return err(404, "通知不存在")

    # 权限校验：仅接收者可操作
    if notification.user_id != current_user_id:
        return err(403, "无权操作此通知")

    # 标记为已读
    if notification.is_read == 0:
        notification.is_read = 1
        db.commit()
        db.refresh(notification)

    return ok("已标记为已读", {
        "id": notification.id,
        "is_read": notification.is_read,
    })


@router.put("/read-all")
def mark_all_read(
    current_user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """
    标记当前用户的所有通知为已读。
    """
    # 批量更新未读通知为已读
    updated_count = (
        db.query(Notification)
        .filter(
            Notification.user_id == current_user_id,
            Notification.is_read == 0,
        )
        .update({"is_read": 1})
    )
    db.commit()

    return ok("已标记全部已读", {
        "updated_count": updated_count,
    })
