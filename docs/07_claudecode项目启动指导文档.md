# 07 Claude Code项目启动指导文档
版本：v1.1（新增 Phase 0 + Mock策略 + 跨模块协作规则）

## 〇、Phase 0：项目骨架（已完成，所有人拉取即可）

**骨架已完成并提交到 develop 分支，包含以下内容：**

| 文件/目录 | 内容 | 负责人 |
|-----------|------|--------|
| `frontend/` | Vite + React + TS + Tailwind + shadcn/ui 项目 | 骨架（已就绪） |
| `frontend/src/App.tsx` | React Router 路由框架 + 导航栏布局 | 骨架（已就绪） |
| `frontend/src/api/client.ts` | Axios 实例 + JWT 拦截器 | 骨架（已就绪） |
| `frontend/src/store/authStore.ts` | Zustand 用户状态管理 | 骨架（已就绪） |
| `frontend/src/components/Layout.tsx` | 导航栏 + 页面布局组件 | 骨架（已就绪） |
| `backend/app/main.py` | FastAPI 入口（CORS + 路由注册） | 骨架（已就绪） |
| `backend/app/core/` | 数据库连接 + JWT + 依赖注入 | 骨架（已就绪） |
| `docker/docker-compose.yml` | MySQL + Backend + Frontend 一键启动 | 骨架（已就绪） |
| `.env.example` | 环境变量模板 | 骨架（已就绪） |
| `README.md` | 克隆→启动→开发 一页式指南 | 骨架（已就绪） |

### 新人首次启动三步走

```bash
# 1. 克隆仓库
git clone https://github.com/ahut615/CampusBuddy.git
cd CampusBuddy
git checkout develop

# 2. 配置环境变量
cp .env.example .env
# 编辑 .env，修改 JWT_SECRET 为你自己的随机字符串

# 3. Docker Compose 一键启动
docker compose -f docker/docker-compose.yml up -d
# 前端：http://localhost:3000
# 后端：http://localhost:8000
# API文档：http://localhost:8000/docs
```

---

## 一、项目目录结构
```
campus-buddy/
├── frontend/                # 前端代码
│   ├── src/
│   │   ├── pages/           # 页面（按模块划分，每个模块仅可修改自己负责的目录）
│   │   │   ├── Login/       # 用户模块-登录页
│   │   │   ├── Register/    # 用户模块-注册页
│   │   │   ├── Profile/     # 用户模块-个人中心
│   │   │   ├── Home/        # 需求模块-首页
│   │   │   ├── PostDetail/  # 需求模块-详情页
│   │   │   ├── Publish/     # 需求模块-发布页
│   │   │   ├── Applications/ # 申请模块-申请管理页
│   │   │   └── Notifications/ # 通知模块-通知中心页
│   │   ├── components/      # 公共组件（所有模块均可复用，修改需PR通知所有人）
│   │   ├── hooks/           # 公共hooks
│   │   ├── utils/           # 工具函数
│   │   ├── api/             # API请求封装（按模块划分）
│   │   ├── store/           # 状态管理
│   │   └── App.tsx          # 路由配置（所有人可修改以添加自己的路由）
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
├── backend/                 # 后端代码
│   ├── app/
│   │   ├── api/             # API接口（按模块划分，每个模块仅可修改自己的文件）
│   │   │   ├── auth.py      # 用户模块-认证接口
│   │   │   ├── user.py      # 用户模块-用户信息接口
│   │   │   ├── post.py      # 需求模块-接口
│   │   │   ├── application.py # 申请模块-接口
│   │   │   └── notification.py # 通知模块-接口
│   │   ├── models/          # 数据库模型（按模块划分）
│   │   │   ├── user.py
│   │   │   ├── post.py
│   │   │   ├── application.py
│   │   │   └── notification.py
│   │   ├── schemas/         # Pydantic校验模型（按模块划分）
│   │   │   ├── user.py
│   │   │   ├── post.py
│   │   │   ├── application.py
│   │   │   └── notification.py
│   │   ├── core/            # 核心配置（JWT、数据库连接等，仅部署模块可修改）
│   │   ├── utils/           # 工具函数
│   │   └── main.py          # 启动文件（所有人可修改以注册自己的路由）
│   ├── requirements.txt
│   └── Dockerfile
├── docker/                  # Docker配置（仅部署模块可修改）
│   └── docker-compose.yml
├── docs/                    # 项目文档
├── .env.example             # 环境变量模板
└── README.md
```
---
## 二、技术栈约束（严格遵守，禁止私自替换）
| 层级 | 技术栈 | 版本要求 |
|------|--------|----------|
| 前端框架 | React + TypeScript | React 18+, TS 5+ |
| 构建工具 | Vite | 5.x |
| CSS框架 | TailwindCSS | 3.x |
| UI组件库 | shadcn/ui | 最新版 |
| 状态管理 | Zustand | 4.x |
| 请求库 | Axios | 最新版 |
| 后端框架 | FastAPI | 0.100+ |
| ORM | SQLAlchemy | 2.0+ |
| 数据校验 | Pydantic | 2.x |
| 认证 | JWT | PyJWT |
| 数据库 | MySQL | 8.0+ |
| 部署 | Docker + Docker Compose | 最新版 |
---
## 三、编码规范
### 3.1 命名规范
- **文件/目录命名：** kebab-case（短横线分隔，如 `user-profile.tsx`）
- **变量/函数命名：** 小驼峰（如 `getUserInfo`）
- **常量命名：** 大写下划线（如 `MAX_PAGE_SIZE`）
- **组件/类命名：** 大驼峰（如 `LoginPage`）
- **数据库字段：** snake_case（下划线分隔，如 `user_id`）
- **API路径：** kebab-case（如 `/users/me`）
### 3.2 代码格式
- 前端：使用Prettier格式化，缩进2空格，行宽120字符
- 后端：使用Black格式化，缩进4空格，行宽120字符
- 所有代码必须无语法错误，无ESLint/flake8警告
### 3.3 注释要求
- 函数/类必须添加注释说明功能、参数、返回值
- 复杂逻辑必须添加注释说明实现思路
- 数据库表/字段必须添加注释说明含义
### 3.4 API规范
- 所有接口必须遵守统一返回格式（见API规范文档）
- 错误必须返回正确的错误码和提示信息
- 所有需要认证的接口必须校验JWT
### 3.5 数据库规范
- 所有表必须包含 `created_at` 和 `updated_at` 字段
- 字段必须设置合理的长度和默认值
- 禁止在代码中硬写SQL语句，必须使用ORM操作
---
## 四、禁止事项（严格执行，违反后果自负）
1. ❌ 禁止修改其他模块的代码：每个模块仅可修改自己负责的目录/文件，修改公共代码必须提交PR并经过所有相关负责人同意
2. ❌ 禁止修改数据库表结构：除非提交变更申请并经过所有人同意，禁止私自新增/修改/删除表或字段
3. ❌ 禁止硬编码敏感信息：API Key、JWT密钥、数据库密码等必须放在环境变量中，禁止硬编码到代码里
4. ❌ 禁止直接提交到main分支：所有代码必须提交到自己的feature分支，提交PR经过代码 review后方可合并到develop分支，测试无误后再合并到main
5. ❌ 禁止破坏现有功能：提交代码前必须测试自己负责的模块功能正常，不影响其他模块运行
6. ❌ 禁止使用不兼容的第三方库：新增依赖必须通知所有人，确认不会产生版本冲突后方可使用
7. ❌ 禁止泄露公共API Key：公共API Key仅可用于本项目开发，严禁外泄或用于其他用途
---
## 五、跨模块修改规则（v1.1新增，替代绝对禁止）

以下文件**允许任何成员修改**，但必须通过 PR 并通知相关人员：

| 文件 | 允许操作 | 注意事项 |
|------|----------|----------|
| `frontend/src/App.tsx` | 添加自己模块的路由 | 不删除/修改他人路由，冲突时协调 |
| `backend/app/main.py` | 注册自己模块的 router | 导入+app.include_router()，不改其他配置 |
| `frontend/package.json` | 新增依赖 | PR中说明用途，所有人确认无冲突 |
| `backend/requirements.txt` | 新增依赖 | PR中说明用途，所有人确认无冲突 |
| `frontend/src/components/` | 提交公共组件 | PR通知全员，附带使用说明 |
| `frontend/src/api/` | 添加自己模块的API封装 | 不修改 client.ts 的JWT逻辑 |
| `.env.example` | 新增环境变量 | 同步更新，不删除已有变量 |

---
## 六、Git协作规范（v1.1新增）

### 6.1 远程仓库
- 仓库地址：`https://github.com/ahut615/CampusBuddy.git`
- 主分支：`main`（稳定版本）
- 开发分支：`develop`（日常开发）

### 6.2 分支命名
- `feature-auth` — 用户模块（成员A）
- `feature-post` — 需求模块（成员B）
- `feature-application` — 申请模块（成员C）
- `feature-notification` — 通知部署模块（成员D）

### 6.3 工作流程
```bash
# 1. 从 develop 拉取最新代码
git checkout develop
git pull origin develop

# 2. 切换到自己的 feature 分支
git checkout feature-auth   # 以成员A为例

# 3. 开发 + 提交
git add .
git commit -m "[用户模块] 完成登录接口开发"

# 4. 推送到远程
git push origin feature-auth

# 5. 在 GitHub 上创建 PR（feature-auth → develop）
# 6. 至少1人review通过后合并
```

### 6.4 提交规范
- Commit message格式：`[模块名] 提交说明`，如 `[用户模块] 完成登录接口开发`
- 每个Commit必须是一个完整的功能点，禁止提交半完成的代码
- PR标题必须明确说明修改的内容，附测试截图

### 6.5 环境一致性（v1.1新增）
- **Node.js:** 18.x 或 20.x（推荐 20 LTS）
- **Python:** 3.11 或 3.12
- **MySQL:** 8.0+（注意：MySQL 5.7 不支持 utf8mb4_unicode_ci 的某些特性）
- **Docker:** 24.x+
- **包管理器前端：** npm（统一，禁止使用 yarn/pnpm 避免lockfile冲突）
- **包管理器后端：** pip（通过 requirements.txt）
---
## 七、Mock策略（v1.1新增）

由于模块间存在依赖关系（C依赖B依赖A），在他人模块尚未完成时，使用Mock数据独立开发：

### 7.1 前端Mock
在 `frontend/src/api/` 下，每个模块的API文件中增加 Mock 开关：

```typescript
// src/api/auth.ts 示例
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

export async function login(data: LoginRequest): Promise<ApiResponse<LoginData>> {
  if (USE_MOCK) {
    return { code: 200, message: '登录成功', data: { token: 'mock-jwt-token' } }
  }
  return client.post('/auth/login', data)
}
```

在 `.env` 中设置 `VITE_USE_MOCK=true` 即可用Mock数据独立开发前端UI。

### 7.2 后端Mock
开发阶段可使用 SQLite 替代 MySQL（修改 `core/database.py` 中的连接字符串），无需安装MySQL即可跑后端。

### 7.3 推荐开发顺序（非强制并行）

| 阶段 | 内容 | 依赖 |
|------|------|------|
| Phase 1 | 成员A完成用户模块（注册+登录+JWT） | 无 |
| Phase 2 | 成员B完成需求模块，成员C/D用Mock并行开发前端UI | Phase 1 |
| Phase 3 | 成员C完成申请模块 | Phase 1+2 |
| Phase 4 | 成员D完成通知 + Docker集成 | Phase 1+2+3 |

> 注：如果大家都急于并行，前端全部使用Mock模式即可。Mock不影响最终代码质量，只是切换环境变量的事。

---
## 八、联调规则
### 8.1 开发顺序
1. 第一阶段：前端用Mock独立开发UI，后端用SQLite独立开发接口（0依赖）
2. 第二阶段：用户模块完成后，其他模块后端接入真实JWT认证
3. 第三阶段：所有模块后端完成，前端切换真实API（关闭Mock）
4. 第四阶段：跨模块联调，Docker打包，整体测试

### 8.2 联调要求
- 接口变更必须提前通知相关模块负责人，同步修改API文档
- 联调过程中发现的Bug必须提交到GitHub Issue，标注Bug级别、重现步骤
- 后端必须提供接口文档（FastAPI自带 `/docs`），前端按照文档对接
- 接口不符合文档的及时反馈到Issue

---
## 九、Claude Code通用提示词（各模块可直接使用）
### Phase 0 骨架提示词（已执行完成）
```
你是Campus Buddy项目的骨架搭建负责人。
请完成以下任务：
1. 用Vite创建React+TypeScript前端项目，配置TailwindCSS+shadcn/ui
2. 用FastAPI创建后端项目，配置SQLAlchemy+JWT
3. 编写docker-compose.yml（MySQL+Backend+Frontend）
4. 编写项目README.md
5. 配置CORS、路由框架、axios实例、Zustand状态管理
要求：代码可以直接运行，环境变量统一管理，输出完整可用的项目骨架。
```

### 通用提示词模板
```
你是Campus Buddy项目的[你的模块名]负责人，严格遵守项目总架构文档和开发规范。
仓库地址：https://github.com/ahut615/CampusBuddy.git
技术栈：React+TypeScript+TailwindCSS+shadcn/ui / FastAPI+SQLAlchemy+JWT

核心规则：
1. 所有接口遵守统一返回格式：{code:200, message:"success", data:{}}
2. 数据库字段全部使用snake_case命名
3. 仅修改我负责的模块代码，不修改其他模块的任何文件
4. 输出的代码必须可以直接运行，不需要额外修改
5. 页面全部使用shadcn/ui组件，符合现代UI设计规范
6. 如需修改公共文件（App.tsx/main.py/package.json），提PR并说明原因
7. 前端开发阶段先使用Mock数据，后端开发阶段可使用SQLite
现在需要实现：[你的需求]
```

### 各模块定制提示词
#### 用户模块（成员A）
```
你是Campus Buddy项目的用户系统负责人。
仓库：https://github.com/ahut615/CampusBuddy.git，分支：feature-auth
实现范围：
前端：pages/Login、pages/Register、pages/Profile
后端：api/auth.py、api/user.py、models/user.py、schemas/user.py
核心功能：注册、登录（JWT签发）、获取个人信息、修改个人资料
注册路由时在main.py中添加：app.include_router(auth_router, prefix="/api/auth", tags=["认证"])
注册路由时在main.py中添加：app.include_router(user_router, prefix="/api/users", tags=["用户"])
禁止修改其他模块的任何代码，所有接口遵守统一返回格式。
```

#### 需求模块（成员B）
```
你是Campus Buddy项目的搭子需求模块负责人。
仓库：https://github.com/ahut615/CampusBuddy.git，分支：feature-post
实现范围：
前端：pages/Home、pages/PostDetail、pages/Publish
后端：api/post.py、models/post.py、schemas/post.py
核心功能：需求CRUD、搜索筛选、标签关联、分页
注册路由时在main.py中添加：app.include_router(post_router, prefix="/api/posts", tags=["需求"])
禁止修改其他模块的任何代码，所有接口遵守统一返回格式。
```

#### 申请模块（成员C）
```
你是Campus Buddy项目的申请匹配模块负责人。
仓库：https://github.com/ahut615/CampusBuddy.git，分支：feature-application
实现范围：
前端：pages/Applications（我的申请页+审核页）
后端：api/application.py、models/application.py、schemas/application.py
核心功能：提交申请、我的申请列表、需求收到的申请列表、审核通过/拒绝
注册路由时在main.py中添加：app.include_router(application_router, prefix="/api/applications", tags=["申请"])
禁止修改其他模块的任何代码，所有接口遵守统一返回格式。
```

#### 通知部署模块（成员D）
```
你是Campus Buddy项目的通知部署模块负责人。
仓库：https://github.com/ahut615/CampusBuddy.git，分支：feature-notification
实现范围：
前端：pages/Notifications
后端：api/notification.py、models/notification.py、docker/docker-compose.yml
核心功能：通知列表、标记已读、全部已读、通知自动触发、Docker配置
注册路由时在main.py中添加：app.include_router(notification_router, prefix="/api/notifications", tags=["通知"])
要求项目最终可以通过 docker compose up -d 一键启动。
禁止修改其他模块的核心业务代码。
```

---
## 十、环境变量说明（v1.1新增）

所有敏感信息通过 `.env` 文件管理，项目提供 `.env.example` 模板：

```bash
# 数据库
MYSQL_ROOT_PASSWORD=your_mysql_password
MYSQL_DATABASE=campus_buddy
DATABASE_URL=mysql+pymysql://root:your_mysql_password@localhost:3306/campus_buddy

# JWT
JWT_SECRET=your_jwt_secret_here_change_in_production
JWT_ALGORITHM=HS256
JWT_EXPIRE_DAYS=7

# 前端Mock开关
VITE_USE_MOCK=false
```

**注意：** `.env` 文件已加入 `.gitignore`，禁止提交到Git。每个人本地创建自己的 `.env`。
