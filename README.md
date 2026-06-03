# Campus Buddy（校园搭子平台）

校园学习与兴趣协作平台——找考研搭子、自习搭子、羽毛球搭子、大创队友、ACM队友。

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React 18 + TypeScript + Vite 5 + TailwindCSS 3 + shadcn/ui + Zustand |
| 后端 | FastAPI + SQLAlchemy 2.0 + Pydantic 2.x + PyJWT |
| 数据库 | MySQL 8.0+ |
| 部署 | Docker + Docker Compose + Nginx |

## 快速启动（3步）

```bash
# 1. 克隆仓库
git clone https://github.com/Lutra666/CampusBuddy.git
cd CampusBuddy
git checkout develop

# 2. 配置环境变量
cp .env.example .env
# 编辑 .env，修改密码和密钥

# 3. Docker Compose 一键启动
docker compose -f docker/docker-compose.yml up -d
```

启动后：
- 前端：http://localhost:3000
- 后端 API：http://localhost:8000
- API 文档（Swagger）：http://localhost:8000/docs

## 本地开发（不用Docker）

### 前端

```bash
cd frontend
cp ../.env.example .env
npm install
npm run dev        # http://localhost:5173
```

### 后端

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 数据库

确保本地 MySQL 8.0+ 运行中，执行 `docs/05_数据库设计文档(er图+sql脚本).md` 中的 SQL 脚本初始化数据库。

## 项目结构

```
campus-buddy/
├── frontend/                # React + TypeScript 前端
│   └── src/
│       ├── pages/           # 页面（按模块划分）
│       ├── components/      # 公共组件
│       ├── api/             # API请求封装
│       └── store/           # 状态管理
├── backend/                 # FastAPI 后端
│   └── app/
│       ├── api/             # API接口（按模块划分）
│       ├── models/          # SQLAlchemy 模型
│       ├── schemas/         # Pydantic 校验
│       └── core/            # 核心配置（JWT、数据库）
├── docker/                  # Docker 配置
└── docs/                    # 项目文档
```

## 模块分工

| 模块 | 负责分支 | 负责人 |
|------|----------|--------|
| 用户系统（注册/登录/个人中心） | feature-auth | 成员A |
| 搭子需求（发布/搜索/详情） | feature-post | 成员B |
| 申请匹配（申请/审核） | feature-application | 成员C |
| 通知部署（通知/Docker/联调） | feature-notification | 成员D |

## 开发流程

1. 从 `develop` 拉取最新代码
2. 切换到自己的 feature 分支
3. 在自己的目录内开发（不修改他人模块代码）
4. 提交 PR 到 `develop`，至少1人 review 通过后合并
5. 详细规范见 `docs/` 目录下的开发文档

## 文档索引

| 文档 | 内容 |
|------|------|
| [总架构文档](docs/CampusBuddy_总架构文档.md) | 项目目标、技术栈、Git规范 |
| [用户系统模块](docs/01_用户系统模块开发文档.md) | 成员A负责范围 |
| [搭子需求模块](docs/02_搭子需求模块开发文档.md) | 成员B负责范围 |
| [申请匹配模块](docs/03_申请匹配模块开发文档.md) | 成员C负责范围 |
| [通知部署模块](docs/04_通知部署模块开发文档.md) | 成员D负责范围 |
| [数据库设计](docs/05_数据库设计文档(er图+sql脚本).md) | ER图 + DDL |
| [API规范](docs/06_api规范文档(openapi版).md) | 接口规范 + 错误码 |
| [项目启动指导](docs/07_claudecode项目启动指导文档.md) | 编码规范 + CC提示词 |
