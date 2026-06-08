"""
Campus Buddy — FastAPI 应用入口。

启动命令：
    uvicorn app.main:app --reload --port 8000

API 文档（自动生成）：
    http://localhost:8000/docs
    http://localhost:8000/redoc
"""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import Base, engine

# 预先导入所有模型，确保 Base.metadata.create_all() 能识别全部表
import app.models.tag         # noqa: F401  标签表（公共）
import app.models.user         # noqa: F401  用户表 + user_tags（成员A）
import app.models.post         # noqa: F401  需求表 + post_tags（成员B）
import app.models.application # noqa: F401  申请表（成员C）
import app.models.notification # noqa: F401  通知表（成员D）


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    应用生命周期：启动时自动创建数据库表（本地开发环境）。
    Docker 环境由 init.sql 处理，此处不影响。
    """
    Base.metadata.create_all(bind=engine)
    yield


# ==================== 创建 FastAPI 应用 ====================
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="校园搭子平台 API — 考研搭子、自习搭子、运动搭子、大创队友、ACM队友",
    lifespan=lifespan,
)

# ==================== CORS 中间件 ====================
# 允许前端开发服务器（Vite:5173）和 Docker 部署（Nginx:3000）跨域访问
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==================== 统一返回模型 ====================
# 使用统一返回格式：{"code": 200, "message": "success", "data": {}}


# ==================== 注册路由 ====================
# ---- 各模块负责人请在下方添加自己的 router ----

# 用户模块（成员A）✅ 已实现
from app.api import auth, user  # noqa: E402
app.include_router(auth.router, prefix="/api/auth", tags=["认证"])
app.include_router(user.router, prefix="/api/users", tags=["用户"])

# 需求模块（成员B）
from app.api import post
app.include_router(post.router, prefix="/api/posts", tags=["需求"])

# 申请模块（成员C）
# from app.api import application
# app.include_router(application.router, prefix="/api/applications", tags=["申请"])

# 通知模块（成员D）
# from app.api import notification
# app.include_router(notification.router, prefix="/api/notifications", tags=["通知"])


# ==================== 健康检查 ====================
@app.get("/api/health", tags=["系统"])
def health_check():
    """
    健康检查接口，用于确认服务是否正常运行。
    Docker Compose 会通过此接口判断后端是否就绪。
    """
    return {
        "code": 200,
        "message": "success",
        "data": {
            "app": settings.APP_NAME,
            "version": settings.APP_VERSION,
            "status": "running",
        },
    }
