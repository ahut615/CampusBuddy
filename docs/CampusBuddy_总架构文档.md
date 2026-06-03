# Campus Buddy（校园搭子平台）

## 总架构与开发规范文档（Tech Lead版）

版本：v1.0

### 项目目标
Campus Buddy 是一个校园学习与兴趣协作平台。

目标场景：
- 考研搭子
- 自习搭子
- 英语搭子
- 健身搭子
- 羽毛球搭子
- 大创队友
- ACM队友

### MVP功能
- 用户系统（注册、登录、个人资料）
- 搭子需求（发布、浏览、搜索、详情）
- 申请系统（申请、审核）
- 标签系统
- 通知系统

### 技术栈
前端：React + TypeScript + Vite + TailwindCSS + shadcn/ui

后端：FastAPI + SQLAlchemy + Pydantic + JWT

数据库：MySQL 8+

部署：Docker + Nginx

### API规范

统一返回格式：

```json
{
  "code": 200,
  "message": "success",
  "data": {}
}
```

### Git规范

- main
- develop
- feature-auth
- feature-post
- feature-application
- feature-notification

禁止直接提交 main。

### 模块划分

用户模块：
- users
- user_tags

搭子需求模块：
- posts
- post_tags

申请匹配模块：
- applications

通知部署模块：
- notifications
- Docker
- CI/CD

### 验收标准

- 能注册登录
- 能发布需求
- 能搜索需求
- 能申请加入
- 能审核申请
- 能收到通知
- Docker 可运行
