# SQL Verification Document - Campus Buddy

> SQL scripts for database structure verification, data integrity checks, and functional testing.

---

## 1. Database & Table Structure Verification

### 1.1 Check Database Exists

```sql
SHOW DATABASES LIKE 'campus_buddy';
```

### 1.2 List All Tables

```sql
USE campus_buddy;
SHOW TABLES;
```

### 1.3 Verify Table Structures

```sql
DESC users;
DESC tags;
DESC user_tags;
DESC posts;
DESC post_tags;
DESC applications;
DESC notifications;
```

### 1.4 Verify Foreign Key Constraints

```sql
SELECT
    TABLE_NAME, COLUMN_NAME, CONSTRAINT_NAME,
    REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'campus_buddy'
  AND REFERENCED_TABLE_NAME IS NOT NULL;
```

### 1.5 Verify Indexes

```sql
SELECT TABLE_NAME, INDEX_NAME, COLUMN_NAME, NON_UNIQUE
FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_SCHEMA = 'campus_buddy'
ORDER BY TABLE_NAME, INDEX_NAME;
```

---

## 2. Preset Data Verification

### 2.1 Check Tags

```sql
SELECT * FROM tags;
SELECT COUNT(*) AS tag_count FROM tags;
-- Expected: tag_count = 10
```

### 2.2 Tag Name Uniqueness

```sql
SELECT name, COUNT(*) AS cnt
FROM tags GROUP BY name HAVING cnt > 1;
-- Expected: empty result
```

---

## 3. User Module Verification

### 3.1 Create Test Users

```sql
INSERT INTO users (username, email, password_hash, nickname, major, grade, bio) VALUES
('test_user1', 'test1@campus.edu', 'hash1', 'Test1', 'CS', '2024', 'Study buddy seeker'),
('test_user2', 'test2@campus.edu', 'hash2', 'Test2', 'English', '2023', 'Morning reading'),
('test_user3', 'test3@campus.edu', 'hash3', 'Test3', 'Math', '2025', 'Library buddy');
```

### 3.2 Query Users with Tags

```sql
SELECT u.id, u.username, u.nickname, u.major, u.grade,
       GROUP_CONCAT(t.name) AS tags
FROM users u
LEFT JOIN user_tags ut ON u.id = ut.user_id
LEFT JOIN tags t ON ut.tag_id = t.id
GROUP BY u.id;
```

### 3.3 Unique Username Constraint

```sql
INSERT INTO users (username, email, password_hash) VALUES ('test_user1', 'x@campus.edu', 'hash');
-- Expected: Duplicate entry error
```

### 3.4 Unique Email Constraint

```sql
INSERT INTO users (username, email, password_hash) VALUES ('unique_user', 'test1@campus.edu', 'hash');
-- Expected: Duplicate entry error
```

---

## 4. Tag Association Verification

### 4.1 Add User Tags

```sql
INSERT INTO user_tags (user_id, tag_id) VALUES (1, 1), (1, 2);
INSERT INTO user_tags (user_id, tag_id) VALUES (2, 3), (2, 9);
```

### 4.2 Unique Association Constraint

```sql
INSERT INTO user_tags (user_id, tag_id) VALUES (1, 1);
-- Expected: Duplicate entry error
```

### 4.3 Cascade Delete Verification

```sql
SELECT * FROM user_tags WHERE user_id = 3;
DELETE FROM users WHERE id = 3;
SELECT * FROM user_tags WHERE user_id = 3;
-- Expected: empty (ON DELETE CASCADE)
```

---

## 5. Posts Module Verification

### 5.1 Create Test Posts

```sql
INSERT INTO posts (user_id, title, content, category, location, start_time, end_time, max_members) VALUES
(1, 'Study buddy wanted', 'Library 8am daily', 'study', 'Library 3F', '2026-06-10 08:00:00', '2026-06-10 22:00:00', 3),
(1, 'Weekend badminton', '2-3 players needed', 'sports', 'Gym', '2026-06-13 14:00:00', '2026-06-13 16:00:00', 4),
(2, 'English speaking group', '3x per week', 'english', 'FLB', '2026-06-15 19:00:00', '2026-06-15 21:00:00', 5);
```

### 5.2 Query by Category

```sql
SELECT * FROM posts WHERE category = 'study';
SELECT * FROM posts WHERE category = 'sports';
SELECT * FROM posts WHERE category = 'english';
```

### 5.3 Active Recruiting Posts

```sql
SELECT p.id, p.title, p.category, u.nickname AS publisher,
       p.max_members, COUNT(a.id) AS current_applicants, p.created_at
FROM posts p
JOIN users u ON p.user_id = u.id
LEFT JOIN applications a ON p.id = a.post_id AND a.status = 1
WHERE p.status = 1
GROUP BY p.id;
```

### 5.4 Add Post Tags

```sql
INSERT INTO post_tags (post_id, tag_id) VALUES (1, 1), (1, 2), (1, 9);
INSERT INTO post_tags (post_id, tag_id) VALUES (2, 4), (2, 5);
INSERT INTO post_tags (post_id, tag_id) VALUES (3, 3);
```

---

## 6. Applications Module Verification

### 6.1 Submit Application

```sql
INSERT INTO applications (post_id, applicant_id, message)
VALUES (1, 2, 'Count me in!');
```

### 6.2 Duplicate Application Constraint

```sql
INSERT INTO applications (post_id, applicant_id, message) VALUES (1, 2, 'Again');
-- Expected: Duplicate entry error (uk_post_applicant)
```

### 6.3 Approve/Reject

```sql
UPDATE applications SET status = 1 WHERE id = 1;
```

### 6.4 Query Applications for a Post

```sql
SELECT a.id, p.title, u.nickname AS applicant, a.message,
       CASE a.status WHEN 0 THEN 'pending' WHEN 1 THEN 'approved' WHEN 2 THEN 'rejected' END AS status_text,
       a.created_at
FROM applications a
JOIN posts p ON a.post_id = p.id
JOIN users u ON a.applicant_id = u.id
WHERE a.post_id = 1;
```

---

## 7. Notifications Module Verification

### 7.1 Create Notifications

```sql
INSERT INTO notifications (user_id, title, content) VALUES
(1, 'New application', 'Someone applied to your post'),
(2, 'Application approved', 'Your application was approved');
```

### 7.2 Query Unread Notifications

```sql
SELECT * FROM notifications WHERE user_id = 1 AND is_read = 0;
```

### 7.3 Mark as Read

```sql
UPDATE notifications SET is_read = 1 WHERE user_id = 1 AND id = 1;
```

### 7.4 Notification Stats

```sql
SELECT user_id, COUNT(*) AS total,
       SUM(CASE WHEN is_read = 0 THEN 1 ELSE 0 END) AS unread,
       SUM(CASE WHEN is_read = 1 THEN 1 ELSE 0 END) AS read_count
FROM notifications WHERE user_id = 1 GROUP BY user_id;
```

---

## 8. Cascade Delete Verification

### 8.1 User Cascade Delete

```sql
DELETE FROM users WHERE id = 1;
SELECT * FROM posts WHERE user_id = 1;
SELECT * FROM applications WHERE applicant_id = 1;
SELECT * FROM user_tags WHERE user_id = 1;
SELECT * FROM notifications WHERE user_id = 1;
-- All expected: empty results
```

### 8.2 Post Cascade Delete

```sql
DELETE FROM posts WHERE id = 2;
SELECT * FROM applications WHERE post_id = 2;
SELECT * FROM post_tags WHERE post_id = 2;
-- All expected: empty results
```

---

## 9. Data Cleanup

```sql
DELETE FROM notifications WHERE user_id IN (1, 2, 3);
DELETE FROM applications WHERE applicant_id IN (1, 2, 3) OR post_id IN (1, 2, 3);
DELETE FROM post_tags WHERE post_id IN (1, 2, 3);
DELETE FROM user_tags WHERE user_id IN (1, 2, 3);
DELETE FROM posts WHERE user_id IN (1, 2, 3);
DELETE FROM users WHERE id IN (1, 2, 3);
```

---

## 10. Statistical Queries

### 10.1 Popular Tags

```sql
SELECT t.name, COUNT(pt.post_id) AS usage_count
FROM tags t
LEFT JOIN post_tags pt ON t.id = pt.tag_id
GROUP BY t.id, t.name
ORDER BY usage_count DESC;
```

### 10.2 User Activity Ranking

```sql
SELECT u.nickname, COUNT(p.id) AS post_count, COUNT(a.id) AS application_count
FROM users u
LEFT JOIN posts p ON u.id = p.user_id
LEFT JOIN applications a ON u.id = a.applicant_id
GROUP BY u.id
ORDER BY (post_count + application_count) DESC;
```

### 10.3 Posts by Category

```sql
SELECT category, COUNT(*) AS total,
       SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) AS recruiting,
       SUM(CASE WHEN status = 2 THEN 1 ELSE 0 END) AS full,
       SUM(CASE WHEN status = 3 THEN 1 ELSE 0 END) AS ended
FROM posts GROUP BY category;
```

---

## Verification Checklist

| # | Item | Section | Expected |
|---|------|---------|----------|
| 1 | Database exists | 1.1 | campus_buddy present |
| 2 | 7 tables correct | 1.2 / 1.3 | Structure matches schema |
| 3 | Foreign keys | 1.4 | 8 FK relationships |
| 4 | Indexes | 1.5 | All indexes present |
| 5 | Preset tags | 2.1 | 10 tags |
| 6 | Tag uniqueness | 2.2 | No duplicates |
| 7 | Username/email unique | 3.3 / 3.4 | Error on duplicate |
| 8 | User-tag unique | 4.2 | Error on duplicate |
| 9 | User cascade delete | 8.1 | Related data removed |
| 10 | Post cascade delete | 8.2 | Related data removed |
| 11 | Application unique | 6.2 | Error on duplicate |
| 12 | Notification CRUD | 7.2-7.4 | Read/unread works |

---

> Maintainer: Campus Buddy Team
> Last Updated: 2026-06-04
> Database: MySQL 8.0+
