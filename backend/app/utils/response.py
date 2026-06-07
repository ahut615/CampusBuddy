"""
统一响应格式工具（公共模块）

所有接口使用 ok() / err() 返回统一 JSON 格式：
    { "code": 200, "message": "success", "data": {} }

用法：
    from app.utils.response import ok, err
    return ok("登录成功", {"token": "xxx"})
    return err(404, "用户不存在")
"""

from typing import Any, Optional


def ok(message: str = "success", data: Optional[Any] = None) -> dict:
    """
    构建成功响应。

    参数：
        message: 提示信息，默认 "success"
        data:    返回数据，None 时返回空对象 {}

    返回：
        {"code": 200, "message": "...", "data": {...}}
    """
    return {
        "code": 200,
        "message": message,
        "data": data if data is not None else {},
    }


def err(code: int, message: str) -> dict:
    """
    构建错误响应。

    参数：
        code:    错误码（400/401/403/404/409/500 等）
        message: 错误说明

    返回：
        {"code": 400, "message": "...", "data": {}}
    """
    return {
        "code": code,
        "message": message,
        "data": {},
    }
