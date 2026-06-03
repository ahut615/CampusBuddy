"""
用户模块 — Pydantic 校验模型（成员A 维护）

请求/响应的数据格式校验。
"""
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


class UserRegisterRequest(BaseModel):
    """注册请求"""
    username: str      # 3-20位
    email: str         # 合法邮箱格式
    password: str      # 6-20位


class UserLoginRequest(BaseModel):
    """登录请求"""
    username: str
    password: str


class UserUpdateRequest(BaseModel):
    """修改资料请求，所有字段可选"""
    nickname: Optional[str] = None
    avatar_url: Optional[str] = None
    major: Optional[str] = None
    grade: Optional[str] = None
    bio: Optional[str] = None
    tags: Optional[List[str]] = None
