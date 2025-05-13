/*
  # TSUTSUJIアプリケーションの初期スキーマ
  
  1. 新規テーブル
     - `users` - ユーザー情報を管理するテーブル
     - `posts` - 投稿データを管理するテーブル
     - `likes` - 投稿に対するいいねを管理するテーブル
     - `comments` - 投稿に対するコメントを管理するテーブル
     - `comment_likes` - コメントに対するいいねを管理するテーブル
  
  2. セキュリティ
     - 全テーブルでRLSを有効化
     - 適切なセキュリティポリシーを設定
*/

-- ユーザーテーブル
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL UNIQUE,
  birth_date DATE NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 投稿テーブル
CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  media_url TEXT NOT NULL,
  is_video BOOLEAN NOT NULL DEFAULT false,
  caption TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- いいねテーブル
CREATE TABLE IF NOT EXISTS likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- 各ユーザーが各投稿に1回だけいいねできるように制約
  UNIQUE(post_id, user_id)
);

-- コメントテーブル
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- コメントいいねテーブル
CREATE TABLE IF NOT EXISTS comment_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id uuid REFERENCES comments(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- 各ユーザーが各コメントに1回だけいいねできるように制約
  UNIQUE(comment_id, user_id)
);

-- インデックスの作成
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at);
CREATE INDEX IF NOT EXISTS idx_likes_post_id ON likes(post_id);
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_comment_id ON comment_likes(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_user_id ON comment_likes(user_id);

-- RLSの有効化
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;

-- ユーザーテーブルのポリシー
CREATE POLICY "ユーザーの読み取り全員可" ON users
  FOR SELECT USING (true);

-- 投稿テーブルのポリシー
CREATE POLICY "投稿の読み取り全員可" ON posts
  FOR SELECT USING (true);

CREATE POLICY "自分の投稿のみ作成可" ON posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "自分の投稿のみ更新可" ON posts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "自分の投稿のみ削除可" ON posts
  FOR DELETE USING (auth.uid() = user_id);

-- いいねテーブルのポリシー
CREATE POLICY "いいねの読み取り全員可" ON likes
  FOR SELECT USING (true);

CREATE POLICY "いいねの作成全員可" ON likes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "自分のいいねのみ削除可" ON likes
  FOR DELETE USING (auth.uid() = user_id);

-- コメントテーブルのポリシー
CREATE POLICY "コメントの読み取り全員可" ON comments
  FOR SELECT USING (true);

CREATE POLICY "コメントの作成全員可" ON comments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "自分のコメントのみ更新可" ON comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "自分のコメントのみ削除可" ON comments
  FOR DELETE USING (auth.uid() = user_id);

-- コメントいいねテーブルのポリシー
CREATE POLICY "コメントいいねの読み取り全員可" ON comment_likes
  FOR SELECT USING (true);

CREATE POLICY "コメントいいねの作成全員可" ON comment_likes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "自分のコメントいいねのみ削除可" ON comment_likes
  FOR DELETE USING (auth.uid() = user_id);

-- デフォルトユーザーの作成
INSERT INTO users (username, birth_date)
VALUES 
  ('ひびき', '1996-11-13'),
  ('あすか', '1995-05-18')
ON CONFLICT (username) DO NOTHING;