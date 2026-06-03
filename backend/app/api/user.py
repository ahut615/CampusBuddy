"""
用户信息接口（成员A 维护）

接口：
    GET  /api/users/me  — 获取当前用户信息
    PUT  /api/users/me  — 修改当前用户资料
"""
from fastapi import APIRouter

router = APIRouter()

# ========== 成员A 在此实现以下接口 ==========
#
# @router.get("/me")
# def get_current_user(
#     current_user_id: int = Depends(get_current_user_id),
#     db: Session = Depends(get_db),
# ):
#     """获取当前登录用户的个人信息"""
#     pass
#
# @router.put("/me")
# def update_current_user(
#     req: UserUpdateRequest,
#     current_user_id: int = Depends(get_current_user_id),
#     db: Session = Depends(get_db),
# ):
#     """修改当前登录用户的个人资料"""
#     pass
