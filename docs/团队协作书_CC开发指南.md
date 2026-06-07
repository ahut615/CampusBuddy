# 团队协作书 — Claude Code 开发指南

> 把这份文档发给每个室友。按下面三步操作，CC 会自动接手开发。

---

## 一、启动（每人做一次，3分钟）

```bash
git clone https://github.com/ahut615/CampusBuddy.git
cd CampusBuddy
git checkout feature-auth      # ← 改成你自己的分支（见下表）
cd frontend && npm install && cd ..
```

| 你是谁 | 分支名 | 负责什么 |
|--------|--------|----------|
| 成员A | `feature-auth` | 用户系统（注册、登录、个人中心） |
| 成员B | `feature-post` | 搭子需求（发布、搜索、详情） |
| 成员C | `feature-application` | 申请匹配（提交申请、审核） |
| 成员D | `feature-notification` | 通知系统 + Docker部署 |

---

## 二、对 CC 说一句话（然后看它写）

### 成员A — 用户系统

```
你是Campus Buddy项目的用户系统负责人，严格遵守项目规范和API文档。

你的分支：feature-auth
仓库：https://github.com/ahut615/CampusBuddy.git

请先阅读 docs/CLAUDE.md 了解项目全貌，然后完成以下任务：

【后端】实现这些文件：
1. backend/app/api/auth.py — POST /auth/register（注册）和 POST /auth/login（登录）
2. backend/app/api/user.py — GET /users/me（获取个人信息）和 PUT /users/me（修改资料）
3. 然后在 backend/app/main.py 中取消注释用户模块的路由注册

要求：
- 使用 models/user.py 中已定义好的 User、UserTag 模型
- 使用 schemas/user.py 中已定义好的请求 Schema
- 密码用 core/security.py 中的 hash_password() 和 verify_password()
- JWT用 core/security.py 中的 create_access_token()，载荷填 {"sub": str(user.id)}
- 认证用 core/deps.py 中的 get_current_user_id()
- 调用 app/utils/response.py 中的 ok() 和 err() 构建统一返回格式
  （如果 response.py 不存在，自己写：ok(message, data) 返回 {code:200, message, data}；
   err(code, message) 返回 {code, message, data:{}}）

【前端】实现这些页面：
1. frontend/src/pages/Login/index.tsx — 登录页（用户名+密码表单）
2. frontend/src/pages/Register/index.tsx — 注册页（用户名+邮箱+密码+确认密码）
3. frontend/src/pages/Profile/index.tsx — 个人中心（展示+编辑资料）

前端要求：
- 使用 shadcn/ui 组件，先 npx shadcn-ui add button input card form label avatar tabs textarea 安装组件
- 调用 frontend/src/api/auth.ts 中的 login() register() getCurrentUser() updateProfile()
- 登录成功后把 token 存到 localStorage('token')，并调 useAuthStore().setToken()
- 样式使用 TailwindCSS

规则：
- 不修改其他模块的文件
- 改公共文件（App.tsx/main.py/package.json）时注释说明原因
- 代码注释用中文，变量名用英文
```

### 成员B — 搭子需求

```
你是Campus Buddy项目的搭子需求模块负责人，严格遵守项目规范和API文档。

你的分支：feature-post
仓库：https://github.com/ahut615/CampusBuddy.git

请先阅读 docs/CLAUDE.md 了解项目全貌，然后完成以下任务：

【后端】实现 backend/app/api/post.py 中的全部接口：
1. POST /posts — 创建需求（含标签关联）
2. GET /posts — 需求列表（支持 keyword搜索、category筛选、status筛选、分页）
3. GET /posts/{id} — 需求详情（含发布人信息、标签、当前用户是否已申请）
4. PUT /posts/{id} — 编辑需求（仅发布者可操作）
5. DELETE /posts/{id} — 删除需求（仅发布者可操作）
6. 然后在 backend/app/main.py 中取消注释需求模块的路由注册

要求：
- 使用 models/post.py 中的 Post、PostTag 模型，models/tag.py 中的 Tag 模型
- 使用 schemas/post.py 中的 PostCreateRequest、PostUpdateRequest
- 认证用 core/deps.py 中的 get_current_user_id()
- 调用 app/utils/response.py 中的 ok() 和 err() 构建统一返回格式
  （如果 response.py 不存在，自己写一个，ok(message, data) 返回 {code:200, message, data}；
   err(code, message) 返回 {code, message, data:{}}）
- 权限判断：比较 post.user_id == current_user_id

【前端】实现这些页面：
1. frontend/src/pages/Home/index.tsx — 首页（搜索框+分类筛选标签+需求卡片列表）
2. frontend/src/pages/Publish/index.tsx — 发布页（标题+内容+分类+地点+时间+标签+最大人数）
3. frontend/src/pages/PostDetail/index.tsx — 详情页（完整信息+发布人头像昵称+申请按钮）

前端要求：
- 使用 shadcn/ui 组件，先 npx shadcn-ui add button input card badge textarea select dialog 安装
- 调用 frontend/src/api/post.ts 中的 listPosts() getPost() createPost() updatePost() deletePost()
- 样式使用 TailwindCSS

规则：
- 不修改其他模块的文件
- 改公共文件时注释说明原因
- 代码注释用中文，变量名用英文
```

### 成员C — 申请匹配

```
你是Campus Buddy项目的申请匹配模块负责人，严格遵守项目规范和API文档。

你的分支：feature-application
仓库：https://github.com/ahut615/CampusBuddy.git

请先阅读 docs/CLAUDE.md 了解项目全貌，然后完成以下任务：

【后端】实现 backend/app/api/application.py 中的全部接口：
1. POST /applications — 提交申请（不可重复申请，不可申请自己的需求，申请后自动发通知给需求发布者）
2. GET /applications/me — 我的申请列表（含关联需求信息，支持状态筛选+分页）
3. 注意：GET /posts/{id}/applications 接口实现在 post.py 或 application.py 均可
4. PUT /applications/{id} — 审核申请（仅需求发布者可操作，审核后通知申请人，通过时判断是否满员）
5. 然后在 backend/app/main.py 中取消注释申请模块的路由注册

要求：
- 使用 models/application.py 中的 Application 模型
- 使用 models/notification.py 中的 Notification 模型（审核后自动创建通知）
- 使用 schemas/application.py 中的 ApplicationCreateRequest、ApplicationReviewRequest
- 认证用 core/deps.py 中的 get_current_user_id()
- 调用 app/utils/response.py 中的 ok() 和 err() 构建统一返回格式
  （如果 response.py 不存在，自己写一个）
- 权限判断：审核时比较 post.user_id == current_user_id

【前端】实现：
1. frontend/src/pages/Applications/index.tsx — 申请管理页（Tab切换「我的申请」「收到的申请」，通过/拒绝按钮）

前端要求：
- 使用 shadcn/ui 组件，先 npx shadcn-ui add button card badge tabs textarea 安装
- 调用 frontend/src/api/application.ts 中的 submitApplication() myApplications() reviewApplication()
- 样式使用 TailwindCSS

规则：
- 不修改其他模块的文件
- 代码注释用中文，变量名用英文
```

### 成员D — 通知 + 部署

```
你是Campus Buddy项目的通知部署模块负责人，严格遵守项目规范和API文档。

你的分支：feature-notification
仓库：https://github.com/ahut615/CampusBuddy.git

请先阅读 docs/CLAUDE.md 了解项目全貌，然后完成以下任务：

【后端】实现 backend/app/api/notification.py 中的全部接口：
1. GET /notifications — 通知列表（支持 is_read 筛选+分页，返回未读总数 unread_count）
2. PUT /notifications/{id}/read — 标记单个为已读（仅接收者可操作）
3. PUT /notifications/read-all — 全部已读
4. 然后在 backend/app/main.py 中取消注释通知模块的路由注册

要求：
- 使用 models/notification.py 中的 Notification 模型
- 认证用 core/deps.py 中的 get_current_user_id()
- 调用 app/utils/response.py 中的 ok() 和 err() 构建统一返回格式
  （如果 response.py 不存在，自己写一个）

【前端】实现：
1. frontend/src/pages/Notifications/index.tsx — 通知中心（未读/已读列表+全部已读按钮）

前端要求：
- 使用 shadcn/ui 组件，先 npx shadcn-ui add button card badge tabs 安装
- 调用 frontend/src/api/notification.ts 中的 listNotifications() markRead() markAllRead()
- 样式使用 TailwindCSS

【Docker】确保 docker/docker-compose.yml 能正常工作，所有人的代码全部完成后可以通过 docker compose up -d 一键启动。

规则：
- 不修改其他模块的核心业务代码
- 修改 docker/ 目录和 Dockerfile 属于你的权限范围
- 代码注释用中文，变量名用英文
```

---

## 三、提交代码

```bash
git add .
git commit -m "[用户模块] 完成注册登录接口开发"
git push origin feature-auth
```

然后去 https://github.com/ahut615/CampusBuddy 创建 PR，从你的分支 → `develop`。

---

## 四、注意事项

### 你能改的文件

| 成员 | 后端 | 前端页面 |
|------|------|----------|
| A | `api/auth.py` `api/user.py` `models/user.py` `schemas/user.py` | `pages/Login` `pages/Register` `pages/Profile` |
| B | `api/post.py` `models/post.py` `schemas/post.py` | `pages/Home` `pages/Publish` `pages/PostDetail` |
| C | `api/application.py` `models/application.py` `schemas/application.py` | `pages/Applications` |
| D | `api/notification.py` `models/notification.py` `docker/` | `pages/Notifications` |

### 公共文件（修改需PR通知全员）

- `main.py` — 注册路由（每人加自己的 router）
- `App.tsx` — 注册页面路由（每人加自己的 Route）
- `package.json` — 加依赖
- `components/` — 公共组件

### 禁止

- 不推 `main` 分支
- 不改别人模块的代码
- 不硬编码密码/密钥
- 不私自改数据库表结构

---

## 五、开发期间的协作

- 成员A 先完成登录注册，其他人先用 `user_id=1` 代替认证调试
- 成员A 完成后，其他人把 `user_id=1` 改成 `Depends(get_current_user_id)`
- 所有人完成后，成员D 负责 Docker 联调
