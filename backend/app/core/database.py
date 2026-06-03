"""
数据库连接模块。
创建 SQLAlchemy 引擎和会话工厂，提供 get_db 依赖注入。
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from app.core.config import settings

# 创建数据库引擎
# SQLite 支持（本地开发）：DATABASE_URL=sqlite:///./campus_buddy.db
# MySQL 支持（生产/联调）：DATABASE_URL=mysql+pymysql://user:pass@host:3306/db
engine = create_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,          # debug模式下打印SQL
    pool_pre_ping=True,           # 连接池健康检查
)

# 会话工厂
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# ORM 基类
Base = declarative_base()


def get_db():
    """
    数据库会话依赖注入。
    使用方式：在 FastAPI 路径函数参数中声明 `db: Session = Depends(get_db)`。
    请求结束时自动关闭会话，确保连接归还连接池。
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
