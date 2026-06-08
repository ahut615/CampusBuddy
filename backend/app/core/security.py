"""
JWT 认证模块。
提供 Token 创建和验证功能，所有需要认证的接口通过此模块校验身份。
"""
from datetime import datetime, timedelta, timezone
from typing import Optional

import jwt
import bcrypt

from app.core.config import settings


def hash_password(password: str) -> str:
    """对明文密码进行哈希处理，存储到数据库。"""
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """验证明文密码与哈希密码是否匹配。"""
    return bcrypt.checkpw(
        plain_password.encode("utf-8"), hashed_password.encode("utf-8")
    )


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    创建 JWT Token。

    参数：
        data: 要编码到 Token 中的载荷数据（如 {"sub": user_id}）
        expires_delta: 过期时间偏移量，默认使用配置的 JWT_EXPIRE_DAYS

    返回：
        JWT Token 字符串
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(days=settings.JWT_EXPIRE_DAYS)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(
        to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM
    )
    return encoded_jwt


def decode_access_token(token: str) -> Optional[dict]:
    """
    验证并解码 JWT Token。

    参数：
        token: JWT Token 字符串

    返回：
        解码后的载荷字典；验证失败（过期/无效）返回 None
    """
    try:
        payload = jwt.decode(
            token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM]
        )
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None
