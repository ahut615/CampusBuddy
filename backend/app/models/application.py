"""
申请模块 — 数据库模型（成员C 维护）

包含表：applications（申请匹配表）
"""
from sqlalchemy import (
    Column,
    BigInteger,
    Text,
    Integer,
    DateTime,
    ForeignKey,
    UniqueConstraint,
    Index,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class Application(Base):
    """申请匹配表"""
    __tablename__ = "applications"

    id = Column(BigInteger, primary_key=True, autoincrement=True, comment="申请ID")
    post_id = Column(
        BigInteger,
        ForeignKey("posts.id", ondelete="CASCADE"),
        nullable=False,
        comment="需求ID",
    )
    applicant_id = Column(
        BigInteger,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        comment="申请人ID",
    )
    message = Column(Text, default=None, comment="申请留言")
    status = Column(
        Integer,
        default=0,
        comment="状态：0=待审核 1=已通过 2=已拒绝",
    )
    created_at = Column(DateTime, server_default=func.now(), comment="申请时间")

    # 索引 + 唯一约束（同一用户不能重复申请同一需求）
    __table_args__ = (
        UniqueConstraint("post_id", "applicant_id", name="uk_post_applicant"),
        Index("idx_post_id", "post_id"),
        Index("idx_applicant_id", "applicant_id"),
    )

    # 关系
    post = relationship("Post", back_populates="applications")
    applicant = relationship("User", back_populates="applications")
