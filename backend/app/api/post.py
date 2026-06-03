"""
需求接口（成员B 维护）

接口：
    POST   /api/posts          — 创建需求
    GET    /api/posts          — 需求列表（搜索+筛选+分页）
    GET    /api/posts/{id}     — 需求详情
    PUT    /api/posts/{id}     — 编辑需求
    DELETE /api/posts/{id}     — 删除需求
"""
from fastapi import APIRouter

router = APIRouter()

# ========== 成员B 在此实现以下接口 ==========
#
# @router.post("")
# def create_post(...):
#     """创建搭子需求"""
#     pass
#
# @router.get("")
# def list_posts(...):
#     """获取需求列表（支持搜索、分类筛选、分页）"""
#     pass
#
# @router.get("/{post_id}")
# def get_post(post_id: int, ...):
#     """获取需求详情"""
#     pass
#
# @router.put("/{post_id}")
# def update_post(post_id: int, ...):
#     """编辑需求（仅发布者可操作）"""
#     pass
#
# @router.delete("/{post_id}")
# def delete_post(post_id: int, ...):
#     """删除需求（仅发布者可操作）"""
#     pass
