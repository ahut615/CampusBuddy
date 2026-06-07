"""
统一响应格式工具。
所有接口通过此模块构建返回结果，确保格式一致。

使用方式：
    from app.utils.response import ok, err

    return ok("登录成功", {"token": "xxx"})
    return err(404, "用户不存在")
"""


def ok(message: str = "success", data=None):
    """成功响应：{code: 200, message: "...", data: {...}}"""
    return {"code": 200, "message": message, "data": data if data is not None else {}}


def err(code: int, message: str):
    """错误响应：{code: 4xx/5xx, message: "...", data: {}}"""
    return {"code": code, "message": message, "data": {}}
