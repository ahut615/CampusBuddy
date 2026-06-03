"""
通知接口（成员D 维护）

接口：
    GET  /api/notifications              — 我的通知列表
    PUT  /api/notifications/{id}/read     — 标记单个为已读
    PUT  /api/notifications/read-all      — 全部已读
"""
from fastapi import APIRouter

router = APIRouter()

# ========== 成员D 在此实现以下接口 ==========
#
# @router.get("")
# def list_notifications(...):
#     """获取当前用户的通知列表（支持未读过滤+分页）"""
#     pass
#
# @router.put("/{notification_id}/read")
# def mark_read(notification_id: int, ...):
#     """标记指定通知为已读"""
#     pass
#
# @router.put("/read-all")
# def mark_all_read(...):
#     """标记所有通知为已读"""
#     pass
