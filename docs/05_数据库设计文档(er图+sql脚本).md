# 05 数据库设计文档（ER图+SQL脚本）
版本：v1.1（修订：补全 tags 表 + 外键约束）

## 一、整体ER关系说明
### 核心实体关系
```
tags (标签表) ◄───────────────────────┐
│                                    │
users (用户表)                        │
├─< user_tags (用户标签关联表) ──────► tag_id
├─< posts (搭子需求表)
│  ├─< post_tags (需求标签关联表) ───► tag_id
│  └─< applications (申请记录表)
└─< notifications (通知表)
```
### 外键关系总览
| 表名         | 外键字段     | 关联表   | 关联字段 | 级联规则       |
|--------------|--------------|----------|----------|----------------|
| user_tags    | user_id      | users    | id       | ON DELETE CASCADE |
| user_tags    | tag_id       | tags     | id       | ON DELETE CASCADE |
| posts        | user_id      | users    | id       | ON DELETE CASCADE |
| post_tags    | post_id      | posts    | id       | ON DELETE CASCADE |
| post_tags    | tag_id       | tags     | id       | ON DELETE CASCADE |
| applications | post_id      | posts    | id       | ON DELETE CASCADE |
| applications | applicant_id | users    | id       | ON DELETE CASCADE |
| notifications | user_id     | users    | id       | ON DELETE CASCADE |

## 二、索引设计
| 表名         | 索引字段               | 索引类型 | 用途说明                     |
|--------------|------------------------|----------|------------------------------|
| tags         | name                   | UNIQUE   | 标签名唯一，防止重复标签     |
| users        | username               | UNIQUE   | 用户名唯一约束，快速登录查询 |
| users        | email                  | UNIQUE   | 邮箱唯一约束，找回密码查询   |
| posts        | user_id                | INDEX    | 快速查询用户发布的所有需求   |
| posts        | category               | INDEX    | 按分类筛选需求               |
| posts        | status                 | INDEX    | 过滤有效/过期需求            |
| applications | post_id                | INDEX    | 查询单个需求的所有申请       |
| applications | applicant_id           | INDEX    | 查询用户提交的所有申请       |
| applications | (post_id, applicant_id)| UNIQUE   | 防止用户重复提交同一申请     |
| notifications | user_id               | INDEX    | 查询用户的所有通知           |
| notifications | is_read               | INDEX    | 过滤未读通知                 |

## 三、完整SQL初始化脚本（MySQL 8.0+）

```sql
-- 创建数据库
CREATE DATABASE IF NOT EXISTS campus_buddy DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE campus_buddy;

-- 0. 标签表（v1.1 新增，必须在 user_tags / post_tags 之前创建）
CREATE TABLE IF NOT EXISTS tags (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '标签ID',
    name VARCHAR(50) NOT NULL UNIQUE COMMENT '标签名',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT '标签表';

-- 预置标签数据
INSERT INTO tags (name) VALUES
('考研'), ('自习'), ('英语'), ('健身'), ('羽毛球'),
('大创'), ('ACM'), ('监督'), ('早起'), ('图书馆');

-- 1. 用户表
CREATE TABLE IF NOT EXISTS users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '用户ID',
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    email VARCHAR(100) NOT NULL UNIQUE COMMENT '邮箱',
    password_hash VARCHAR(255) NOT NULL COMMENT '密码哈希',
    avatar_url VARCHAR(255) DEFAULT NULL COMMENT '头像URL',
    nickname VARCHAR(50) DEFAULT NULL COMMENT '昵称',
    major VARCHAR(100) DEFAULT NULL COMMENT '专业',
    grade VARCHAR(20) DEFAULT NULL COMMENT '年级',
    bio TEXT DEFAULT NULL COMMENT '个人简介',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT '用户表';

-- 2. 用户标签关联表（v1.1：补全 tag_id 外键）
CREATE TABLE IF NOT EXISTS user_tags (
    user_id BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
    tag_id BIGINT UNSIGNED NOT NULL COMMENT '标签ID',
    PRIMARY KEY (user_id, tag_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT '用户标签关联表';

-- 3. 搭子需求表
CREATE TABLE IF NOT EXISTS posts (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '需求ID',
    user_id BIGINT UNSIGNED NOT NULL COMMENT '发布用户ID',
    title VARCHAR(200) NOT NULL COMMENT '需求标题',
    content TEXT NOT NULL COMMENT '需求详情',
    category VARCHAR(50) NOT NULL COMMENT '需求分类（考研/自习/运动等）',
    location VARCHAR(100) DEFAULT NULL COMMENT '地点',
    start_time DATETIME DEFAULT NULL COMMENT '开始时间',
    end_time DATETIME DEFAULT NULL COMMENT '结束时间',
    max_members INT DEFAULT 1 COMMENT '最大人数',
    status TINYINT DEFAULT 1 COMMENT '状态：1=招募中 2=已满 3=已结束',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_category (category),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT '搭子需求表';

-- 4. 需求标签关联表（v1.1：补全 tag_id 外键）
CREATE TABLE IF NOT EXISTS post_tags (
    post_id BIGINT UNSIGNED NOT NULL COMMENT '需求ID',
    tag_id BIGINT UNSIGNED NOT NULL COMMENT '标签ID',
    PRIMARY KEY (post_id, tag_id),
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT '需求标签关联表';

-- 5. 申请匹配表
CREATE TABLE IF NOT EXISTS applications (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '申请ID',
    post_id BIGINT UNSIGNED NOT NULL COMMENT '需求ID',
    applicant_id BIGINT UNSIGNED NOT NULL COMMENT '申请人ID',
    message TEXT DEFAULT NULL COMMENT '申请留言',
    status TINYINT DEFAULT 0 COMMENT '状态：0=待审核 1=已通过 2=已拒绝',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '申请时间',
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (applicant_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uk_post_applicant (post_id, applicant_id),
    INDEX idx_post_id (post_id),
    INDEX idx_applicant_id (applicant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT '申请匹配表';

-- 6. 通知表
CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '通知ID',
    user_id BIGINT UNSIGNED NOT NULL COMMENT '接收用户ID',
    title VARCHAR(200) NOT NULL COMMENT '通知标题',
    content TEXT NOT NULL COMMENT '通知内容',
    is_read TINYINT DEFAULT 0 COMMENT '是否已读：0=未读 1=已读',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_is_read (is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT '通知表';
```

## 四、变更记录

| 版本 | 日期 | 变更内容 |
|------|------|----------|
| v1.0 | 2026-06-03 | 初始版本 |
| v1.1 | 2026-06-03 | 新增 tags 表 DDL + 预置标签；补齐 user_tags / post_tags 的 tag_id 外键；更新 ER 图和外键总览 |
