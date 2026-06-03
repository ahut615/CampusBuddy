# 06 API规范文档（OpenAPI/Apifox版）
版本：v1.0
## 一、通用规范
### 1.1 基础地址
开发环境：`http://localhost:8000/api`
生产环境：`https://your-domain.com/api`
### 1.2 统一返回格式
所有接口返回JSON格式，结构如下：
```json
{
  "code": 200,
  "message": "success",
  "data": {}
}
```
| 字段 | 类型 | 说明 |
|------|------|------|
| code | int | 状态码，200=成功，其他为错误码 |
| message | string | 提示信息，成功为success，错误为具体说明 |
| data | any | 返回数据，无数据时为null |
### 1.3 统一错误码
| 错误码 | 说明 |
|--------|------|
| 200 | 成功 |
| 400 | 参数错误（请求参数缺失、格式错误等） |
| 401 | 未授权（JWT不存在/无效/过期） |
| 403 | 权限不足（无操作权限，如修改他人发布的需求） |
| 404 | 资源不存在（访问的接口/数据不存在） |
| 409 | 资源冲突（如用户重复提交申请、用户名已存在） |
| 500 | 服务器内部错误 |
### 1.4 JWT认证说明
1. 登录成功后返回JWT Token
2. 所有需要认证的接口必须在请求头中携带Token：
```
Authorization: Bearer <your-jwt-token>
```
3. Token有效期：7天，过期需要重新登录
---
## 二、接口清单
### 🔴 模块1：用户认证与用户信息
#### 1.1 用户注册
**接口地址：** `POST /auth/register`
**是否需要认证：** 否
**请求参数：**
```json
{
  "username": "string(必填, 3-20位)",
  "email": "string(必填, 合法邮箱格式)",
  "password": "string(必填, 6-20位)"
}
```
**返回示例（成功）：**
```json
{
  "code": 200,
  "message": "注册成功",
  "data": {
    "id": 1,
    "username": "test",
    "email": "test@example.com",
    "created_at": "2026-06-03T23:00:00"
  }
}
```
#### 1.2 用户登录
**接口地址：** `POST /auth/login`
**是否需要认证：** 否
**请求参数：**
```json
{
  "username": "string(必填)",
  "password": "string(必填)"
}
```
**返回示例（成功）：**
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```
#### 1.3 获取当前用户信息
**接口地址：** `GET /users/me`
**是否需要认证：** 是
**请求参数：** 无
**返回示例（成功）：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "username": "test",
    "email": "test@example.com",
    "avatar_url": "https://xxx.com/avatar.jpg",
    "nickname": "张三",
    "major": "计算机科学与技术",
    "grade": "2023级",
    "bio": "热爱学习，喜欢打球",
    "tags": ["考研", "羽毛球"],
    "created_at": "2026-06-03T23:00:00"
  }
}
```
#### 1.4 修改当前用户信息
**接口地址：** `PUT /users/me`
**是否需要认证：** 是
**请求参数：**
```json
{
  "nickname": "string(可选)",
  "avatar_url": "string(可选)",
  "major": "string(可选)",
  "grade": "string(可选)",
  "bio": "string(可选)",
  "tags": ["string数组(可选)"]
}
```
**返回示例（成功）：**
```json
{
  "code": 200,
  "message": "修改成功",
  "data": {}
}
```
---
### 🟠 模块2：搭子需求管理
#### 2.1 创建搭子需求
**接口地址：** `POST /posts`
**是否需要认证：** 是
**请求参数：**
```json
{
  "title": "string(必填, 1-200字)",
  "content": "string(必填, 1-2000字)",
  "category": "string(必填, 分类如：考研/自习/羽毛球)",
  "location": "string(可选, 地点)",
  "start_time": "string(可选, ISO格式时间)",
  "end_time": "string(可选, ISO格式时间)",
  "max_members": "int(可选, 默认1, 最大100)",
  "tags": ["string数组(可选)"]
}
```
**返回示例（成功）：**
```json
{
  "code": 200,
  "message": "发布成功",
  "data": {
    "id": 1,
    "created_at": "2026-06-03T23:00:00"
  }
}
```
#### 2.2 获取需求列表
**接口地址：** `GET /posts`
**是否需要认证：** 否
**请求参数（Query）：**
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| page | int | 否 | 页码，默认1 |
| page_size | int | 否 | 每页数量，默认10 |
| keyword | string | 否 | 搜索关键词 |
| category | string | 否 | 分类筛选 |
| status | int | 否 | 状态筛选：1=招募中 2=已满 3=已结束 |
**返回示例（成功）：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 100,
    "page": 1,
    "page_size": 10,
    "list": [
      {
        "id": 1,
        "title": "找考研搭子",
        "category": "考研",
        "location": "图书馆3楼",
        "start_time": "2026-06-04T08:00:00",
        "max_members": 3,
        "current_members": 1,
        "status": 1,
        "user": {
          "id": 1,
          "nickname": "张三",
          "avatar_url": "https://xxx.com/avatar.jpg"
        },
        "created_at": "2026-06-03T23:00:00"
      }
    ]
  }
}
```
#### 2.3 获取需求详情
**接口地址：** `GET /posts/{id}`
**是否需要认证：** 否
**路径参数：** `id` 需求ID
**返回示例（成功）：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "title": "找考研搭子",
    "content": "每天8点到图书馆学习，互相监督...",
    "category": "考研",
    "location": "图书馆3楼",
    "start_time": "2026-06-04T08:00:00",
    "end_time": "2026-06-04T22:00:00",
    "max_members": 3,
    "current_members": 1,
    "status": 1,
    "tags": ["考研", "监督"],
    "user": {
      "id": 1,
      "nickname": "张三",
      "avatar_url": "https://xxx.com/avatar.jpg",
      "major": "计算机科学与技术",
      "grade": "2023级"
    },
    "created_at": "2026-06-03T23:00:00",
    "is_owner": false,
    "has_applied": false
  }
}
```
#### 2.4 编辑需求
**接口地址：** `PUT /posts/{id}`
**是否需要认证：** 是（仅需求发布者可编辑）
**路径参数：** `id` 需求ID
**请求参数：** 同创建需求，所有字段可选
**返回示例（成功）：**
```json
{
  "code": 200,
  "message": "修改成功",
  "data": {}
}
```
#### 2.5 删除需求
**接口地址：** `DELETE /posts/{id}`
**是否需要认证：** 是（仅需求发布者可删除）
**路径参数：** `id` 需求ID
**返回示例（成功）：**
```json
{
  "code": 200,
  "message": "删除成功",
  "data": {}
}
```
---
### 🟡 模块3：申请匹配管理
#### 3.1 提交申请
**接口地址：** `POST /applications`
**是否需要认证：** 是
**请求参数：**
```json
{
  "post_id": "int(必填, 需求ID)",
  "message": "string(可选, 申请留言, 最多500字)"
}
```
**返回示例（成功）：**
```json
{
  "code": 200,
  "message": "申请提交成功",
  "data": {
    "id": 1,
    "created_at": "2026-06-03T23:00:00"
  }
}
```
#### 3.2 获取我的申请列表
**接口地址：** `GET /applications/me`
**是否需要认证：** 是
**请求参数（Query）：**
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| status | int | 否 | 状态筛选：0=待审核 1=已通过 2=已拒绝 |
| page | int | 否 | 页码，默认1 |
**返回示例（成功）：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 10,
    "page": 1,
    "list": [
      {
        "id": 1,
        "post_title": "找考研搭子",
        "post_category": "考研",
        "status": 0,
        "message": "我也在准备考研，想一起学习",
        "created_at": "2026-06-03T23:00:00",
        "post": {
          "id": 1,
          "title": "找考研搭子",
          "user": {
            "nickname": "张三",
            "avatar_url": "https://xxx.com/avatar.jpg"
          }
        }
      }
    ]
  }
}
```
#### 3.3 获取需求的申请列表
**接口地址：** `GET /posts/{id}/applications`
**是否需要认证：** 是（仅需求发布者可查看）
**路径参数：** `id` 需求ID
**请求参数（Query）：**
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| status | int | 否 | 状态筛选：0=待审核 1=已通过 2=已拒绝 |
**返回示例（成功）：**
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 1,
      "applicant": {
        "id": 2,
        "nickname": "李四",
        "avatar_url": "https://xxx.com/avatar2.jpg",
        "major": "软件工程",
        "grade": "2023级"
      },
      "message": "我也在准备考研，想一起学习",
      "status": 0,
      "created_at": "2026-06-03T23:00:00"
    }
  ]
}
```
#### 3.4 审核申请
**接口地址：** `PUT /applications/{id}`
**是否需要认证：** 是（仅需求发布者可审核）
**路径参数：** `id` 申请ID
**请求参数：**
```json
{
  "status": "int(必填, 1=通过 2=拒绝)"
}
```
**返回示例（成功）：**
```json
{
  "code": 200,
  "message": "审核成功",
  "data": {}
}
```
---
### 🟢 模块4：通知管理
#### 4.1 获取我的通知列表
**接口地址：** `GET /notifications`
**是否需要认证：** 是
**请求参数（Query）：**
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| is_read | int | 否 | 0=未读 1=已读，不传返回所有 |
| page | int | 否 | 页码，默认1 |
**返回示例（成功）：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 20,
    "page": 1,
    "unread_count": 3,
    "list": [
      {
        "id": 1,
        "title": "你的申请已通过",
        "content": "你申请加入的「找考研搭子」需求已通过审核",
        "is_read": 0,
        "created_at": "2026-06-03T23:00:00"
      }
    ]
  }
}
```
#### 4.2 标记通知为已读
**接口地址：** `PUT /notifications/{id}/read`
**是否需要认证：** 是
**路径参数：** `id` 通知ID
**返回示例（成功）：**
```json
{
  "code": 200,
  "message": "标记成功",
  "data": {}
}
```
#### 4.3 标记所有通知为已读
**接口地址：** `PUT /notifications/read-all`
**是否需要认证：** 是
**请求参数：** 无
**返回示例（成功）：**
```json
{
  "code": 200,
  "message": "全部已读",
  "data": {}
}
```
---
## 三、通知触发规则（后端自动触发）
| 场景 | 接收人 | 通知内容 |
|------|--------|----------|
| 有新的申请提交 | 需求发布者 | 你的需求「xxx」收到新的申请 |
| 申请被审核 | 申请人 | 你申请的「xxx」需求已被通过/拒绝 |
| 需求人数已满 | 所有已通过的申请人 | 你加入的「xxx」需求人数已满 |