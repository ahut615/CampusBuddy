# Campus Buddy（校园搭子平台）— Claude Code 项目入口

## 项目简介

校园学习与兴趣协作平台，帮助学生找考研搭子、自习搭子、羽毛球搭子、大创队友、ACM队友等。

- 仓库地址：https://github.com/ahut615/CampusBuddy.git
- 技术栈：React 18 + TypeScript + TailwindCSS + shadcn/ui | FastAPI + SQLAlchemy + JWT | MySQL 8.0+ | Docker

## 启动项目

```bash
# 克隆仓库
git clone https://github.com/ahut615/CampusBuddy.git
cd CampusBuddy
git checkout develop         # 骨架代码在 develop 分支

# 配置环境
cp .env.example .env

# Docker一键启动（推荐）
docker compose -f docker/docker-compose.yml up -d

# 或本地启动
cd frontend && npm install && cd ..
# 终端1: cd backend && uvicorn app.main:app --reload --port 8000
# 终端2: cd frontend && npm run dev
```

启动后：前端 http://localhost:3000 | 后端 http://localhost:8000 | API文档 http://localhost:8000/docs

## 四大模块 & 分支

| 模块 | 分支 | 职责 |
|------|------|------|
| **用户系统** | `feature-auth` | 注册/登录/JWT/个人中心/编辑资料 |
| **搭子需求** | `feature-post` | 发布需求/搜索筛选/详情/编辑删除 |
| **申请匹配** | `feature-application` | 提交申请/审核通过拒绝/状态管理 |
| **通知部署** | `feature-notification` | 通知中心/Docker部署/联调测试 |

## 开发规则（必须遵守）

1. **只改自己模块的文件**（详见 docs/07_claudecode项目启动指导文档.md 中的模块文件清单）
2. **修改公共文件必须提PR**：App.tsx（加路由）、main.py（注册路由）、package.json（加依赖）、components/（公共组件）
3. **统一API返回格式**：`{code: 200, message: "success", data: {}}`
4. **数据库字段全部 snake_case**
5. **所有页面使用 shadcn/ui 组件**
6. **提交格式**：`[模块名] 提交说明`
7. **禁止提交到 main**，开发在 feature 分支，合并到 develop

## 文档索引

开发前请先阅读（按顺序）：
1. `docs/CampusBuddy_总架构文档.md` — 项目目标、技术栈、验收标准
2. `docs/07_claudecode项目启动指导文档.md` — 编码规范、禁止事项、**各模块CC提示词模板**
3. 找到你负责的模块文档（01-04）
4. `docs/05_数据库设计文档(er图+sql脚本).md` — 表结构参考
5. `docs/06_api规范文档(openapi版).md` — 接口规范参考

## 当前状态

Phase 0 骨架已完成，可直接运行。各模块的 API 文件、Model 文件、Schema 文件和页面文件均为**占位代码**，内含实现指引注释，需要你填充业务逻辑。
