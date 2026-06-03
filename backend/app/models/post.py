"""
需求模块 — 数据库模型（成员B 维护）

包含表：posts（搭子需求表）、post_tags（需求标签关联表）
"""
from sqlalchemy import (
    Column,
    BigInteger,
    String,
    Text,
    Integer,
    DateTime,
    ForeignKey,
    PrimaryKeyConstraint,
    Index,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class Post(Base):
    """搭子需求表"""
    __tablename__ = "posts"

    id = Column(BigInteger, primary_key=True, autoincrement=True, comment="需求ID")
    user_id = Column(
        BigInteger,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        comment="发布用户ID",
    )
    title = Column(String(200), nullable=False, comment="需求标题")
    content = Column(Text, nullable=False, comment="需求详情")
    category = Column(String(50), nullable=False, comment="需求分类")
    location = Column(String(100), default=None, comment="地点")
    start_time = Column(DateTime, default=None, comment="开始时间")
    end_time = Column(DateTime, default=None, comment="结束时间")
    max_members = Column(Integer, default=1, comment="最大人数")
    status = Column(Integer, default=1, comment="状态：1=招募中 2=已满 3=已结束")
    created_at = Column(DateTime, server_default=func.now(), comment="创建时间")
    updated_at = Column(
        DateTime, server_default=func.now(), onupdate=func.now(), comment="更新时间"
    )

    # 索引
    __table_args__ = (
        Index("idx_user_id", "user_id"),
        Index("idx_category", "category"),
        Index("idx_status", "status"),
    )

    # 关系
    user = relationship("User", back_populates="posts")
    applications = relationship(
        "Application", back_populates="post", cascade="all, delete-orphan"
    )


class PostTag(Base):
    """需求标签关联表"""
    __tablename__ = "post_tags"

    post_id = Column(
        BigInteger,
        ForeignKey("posts.id", ondelete="CASCADE"),
        nullable=False,
        comment="需求ID",
    )
    tag_id = Column(
        BigInteger,
        ForeignKey("tags.id", ondelete="CASCADE"),
        nullable=False,
        comment="标签ID",
    )

    __table_args__ = (PrimaryKeyConstraint("post_id", "tag_id"),)
