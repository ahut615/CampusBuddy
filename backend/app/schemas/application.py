"""
申请模块 — Pydantic 校验模型（成员C 维护）

请求/响应的数据格式校验。
"""
from pydantic import BaseModel
from typing import Optional


class ApplicationCreateRequest(BaseModel):
    """提交申请请求"""
    post_id: int                # 必填, 需求ID
    message: Optional[str] = None  # 申请留言, 最多500字


class ApplicationReviewRequest(BaseModel):
    """审核申请请求"""
    status: int                 # 必填, 1=通过 2=拒绝
