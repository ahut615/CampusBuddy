"""
用户认证接口（成员A 维护）

POST /api/auth/register — 注册
POST /api/auth/login    — 登录
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import hash_password, verify_password, create_access_token
from app.models.user import User
from app.schemas.user import UserRegisterRequest, UserLoginRequest
from app.utils.response import ok, err

router = APIRouter()


@router.post("/register")
def register(req: UserRegisterRequest, db: Session = Depends(get_db)):
    """用户注册：校验用户名/邮箱唯一性，哈希密码，返回用户信息"""
    if db.query(User).filter(User.username == req.username).first():
        return err(409, "用户名已存在")
    if db.query(User).filter(User.email == req.email).first():
        return err(409, "邮箱已被注册")

    user = User(
        username=req.username,
        email=req.email,
        password_hash=hash_password(req.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return ok("注册成功", {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "created_at": user.created_at.isoformat() if user.created_at else None,
    })


@router.post("/login")
def login(req: UserLoginRequest, db: Session = Depends(get_db)):
    """用户登录：验证用户名密码，签发JWT（有效期7天）"""
    user = db.query(User).filter(User.username == req.username).first()
    if not user or not verify_password(req.password, user.password_hash):
        return err(400, "用户名或密码错误")

    token = create_access_token(data={"sub": str(user.id)})
    return ok("登录成功", {"token": token})
