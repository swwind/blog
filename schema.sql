-- 创建表来存储评论
CREATE TABLE IF NOT EXISTS comments (
    id TEXT PRIMARY KEY,
    path TEXT NOT NULL,
    name TEXT NOT NULL,
    time INTEGER NOT NULL,
    hash TEXT,
    pubkey TEXT NOT NULL,
    content TEXT NOT NULL,
    userAgent TEXT NOT NULL
);

-- 为 comments 添加 path 索引
CREATE INDEX idx_comments_path ON comments (path);

-- 创建表来存储反应
CREATE TABLE IF NOT EXISTS reactions (
    path TEXT PRIMARY KEY,
    reactions TEXT NOT NULL
);
