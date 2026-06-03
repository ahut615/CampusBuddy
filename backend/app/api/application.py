"""
申请接口（成员C 维护）

接口：
    POST /api/applications                — 提交申请
    GET  /api/applications/me             — 我的申请列表
    GET  /api/posts/{id}/applications     — 需求收到的申请列表
    PUT  /api/applications/{id}           — 审核申请
"""
from fastapi import APIRouter

router = APIRouter()

# ========== 成员C 在此实现以下接口 ==========
#
# @router.post("")
# def submit_application(...):
#     """提交加入申请"""
#     pass
#
# @router.get("/me")
# def my_applications(...):
#     """获取我提交的申请列表"""
#     pass
#
# @router.get("/posts/{post_id}/applications")
# def post_applications(post_id: int, ...):
#     """获取某个需求收到的所有申请（仅发布者可查看）"""
#     pass
#
# @router.put("/{application_id}")
# def review_application(application_id: int, ...):
#     """审核申请（通过/拒绝）"""
#     pass
