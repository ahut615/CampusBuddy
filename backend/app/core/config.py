"""
应用配置模块。
从环境变量读取所有配置项，提供统一配置入口。
"""
import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    """应用配置类，所有配置从环境变量读取，禁止硬编码敏感信息。"""

    # 数据库
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "mysql+pymysql://root:root@localhost:3306/campus_buddy",
    )

    # JWT
    JWT_SECRET: str = os.getenv("JWT_SECRET", "dev-secret-change-in-production")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    JWT_EXPIRE_DAYS: int = int(os.getenv("JWT_EXPIRE_DAYS", "7"))

    # 应用
    APP_NAME: str = "Campus Buddy API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = os.getenv("DEBUG", "true").lower() == "true"


# 全局单例
settings = Settings()
