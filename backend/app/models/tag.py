"""
标签模块 — 数据库模型（公共，所有模块均可引用）

包含表：tags（标签表）
"""
from sqlalchemy import Column, BigInteger, String, DateTime
from sqlalchemy.sql import func

from app.core.database import Base


class Tag(Base):
    """标签表"""
    __tablename__ = "tags"

    id = Column(BigInteger, primary_key=True, autoincrement=True, comment="标签ID")
    name = Column(String(50), unique=True, nullable=False, comment="标签名")
    created_at = Column(DateTime, server_default=func.now(), comment="创建时间")
