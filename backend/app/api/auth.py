"""
用户认证接口（成员A 维护）

接口：
    POST /api/auth/register  — 用户注册
    POST /api/auth/login     — 用户登录
"""
from fastapi import APIRouter

router = APIRouter()

# ========== 成员A 在此实现以下接口 ==========
#
# @router.post("/register")
# def register(req: UserRegisterRequest, db: Session = Depends(get_db)):
#     """用户注册"""
#     pass
#
# @router.post("/login")
# def login(req: UserLoginRequest, db: Session = Depends(get_db)):
#     """用户登录，返回JWT Token"""
#     pass
