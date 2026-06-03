"""
用户模块 — 数据库模型（成员A 维护）

包含表：users（用户表）、user_tags（用户标签关联表）

注意：tags 表需提前创建，见 docs/05_数据库设计文档
"""
from sqlalchemy import (
    Column,
    BigInteger,
    String,
    Text,
    DateTime,
    ForeignKey,
    PrimaryKeyConstraint,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class User(Base):
    """用户表"""
    __tablename__ = "users"

    id = Column(BigInteger, primary_key=True, autoincrement=True, comment="用户ID")
    username = Column(String(50), unique=True, nullable=False, comment="用户名")
    email = Column(String(100), unique=True, nullable=False, comment="邮箱")
    password_hash = Column(String(255), nullable=False, comment="密码哈希")
    avatar_url = Column(String(255), default=None, comment="头像URL")
    nickname = Column(String(50), default=None, comment="昵称")
    major = Column(String(100), default=None, comment="专业")
    grade = Column(String(20), default=None, comment="年级")
    bio = Column(Text, default=None, comment="个人简介")
    created_at = Column(DateTime, server_default=func.now(), comment="创建时间")
    updated_at = Column(
        DateTime, server_default=func.now(), onupdate=func.now(), comment="更新时间"
    )

    # 关系
    posts = relationship("Post", back_populates="user", cascade="all, delete-orphan")
    applications = relationship(
        "Application", back_populates="applicant", cascade="all, delete-orphan"
    )
    notifications = relationship(
        "Notification", back_populates="user", cascade="all, delete-orphan"
    )


class UserTag(Base):
    """用户标签关联表"""
    __tablename__ = "user_tags"

    user_id = Column(
        BigInteger,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        comment="用户ID",
    )
    tag_id = Column(
        BigInteger,
        ForeignKey("tags.id", ondelete="CASCADE"),
        nullable=False,
        comment="标签ID",
    )

    __table_args__ = (PrimaryKeyConstraint("user_id", "tag_id"),)
