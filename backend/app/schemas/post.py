"""
需求模块 — Pydantic 校验模型（成员B 维护）

请求/响应的数据格式校验。
"""
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class PostCreateRequest(BaseModel):
    """创建需求请求"""
    title: str                              # 必填, 1-200字
    content: str                            # 必填, 1-2000字
    category: str                           # 必填
    location: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    max_members: int = 1                    # 默认1
    tags: Optional[List[str]] = None


class PostUpdateRequest(BaseModel):
    """编辑需求请求，所有字段可选"""
    title: Optional[str] = None
    content: Optional[str] = None
    category: Optional[str] = None
    location: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    max_members: Optional[int] = None
    status: Optional[int] = None
    tags: Optional[List[str]] = None
