"""
通知模块 — 数据库模型（成员D 维护）

包含表：notifications（通知表）
"""
from sqlalchemy import (
    Column,
    BigInteger,
    String,
    Text,
    Integer,
    DateTime,
    ForeignKey,
    Index,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class Notification(Base):
    """通知表"""
    __tablename__ = "notifications"

    id = Column(BigInteger, primary_key=True, autoincrement=True, comment="通知ID")
    user_id = Column(
        BigInteger,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        comment="接收用户ID",
    )
    title = Column(String(200), nullable=False, comment="通知标题")
    content = Column(Text, nullable=False, comment="通知内容")
    is_read = Column(Integer, default=0, comment="是否已读：0=未读 1=已读")
    created_at = Column(DateTime, server_default=func.now(), comment="创建时间")

    # 索引
    __table_args__ = (
        Index("idx_user_id", "user_id"),
        Index("idx_is_read", "is_read"),
    )

    # 关系
    user = relationship("User", back_populates="notifications")
