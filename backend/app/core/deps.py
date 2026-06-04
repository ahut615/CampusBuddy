"""
FastAPI 依赖注入模块。
提供通用的认证检查等可复用依赖。
"""
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.core.security import decode_access_token

# HTTP Bearer Token 认证方案
security_scheme = HTTPBearer()


def get_current_user_id(
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme),
) -> int:
    """
    从请求的 Authorization Header 中提取并验证 JWT，返回当前用户ID。

    使用方式：
        current_user_id: int = Depends(get_current_user_id)

    所有需要认证的接口直接使用此依赖即可。
    """
    token = credentials.credentials
    payload = decode_access_token(token)

    if payload is None:
        raise HTTPException(
            status_code=401,
            detail="Token 无效或已过期，请重新登录",
        )

    user_id = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=401,
            detail="Token 格式错误",
        )

    return int(user_id)
