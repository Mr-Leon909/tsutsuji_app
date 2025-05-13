import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { usePostStore } from '../store/postStore';
import Logo from '../components/Logo';
import PostCard from '../components/PostCard';
import BottomNavbar from '../components/BottomNavbar';

export default function TimelinePage() {
  const { user } = useAuthStore();
  const { posts, fetchPosts, isLoading, error } = usePostStore();

  useEffect(() => {
    if (user) {
      fetchPosts(user.id);
    }
  }, [fetchPosts, user]);

  return (
    <div className="pb-28">
      {/* ヘッダー */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex justify-center">
          <Logo variant="small" />
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-screen-md mx-auto">
        {isLoading && posts.length === 0 ? (
          <div className="flex justify-center items-center h-40">
            <p className="text-gray-500">読み込み中...</p>
          </div>
        ) : error ? (
          <div className="p-4 text-center">
            <p className="text-red-500">{error}</p>
            <button 
              onClick={() => user && fetchPosts(user.id)}
              className="mt-2 text-pink-500 font-medium"
            >
              再読み込み
            </button>
          </div>
        ) : posts.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-600 mb-2">投稿がありません</p>
            <p className="text-gray-500 text-sm">
              新しい投稿を作成して、みんなと共有しましょう！
            </p>
          </div>
        ) : (
          // 投稿リスト
          <div className="divide-y divide-gray-200">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                id={post.id}
                userId={post.user_id}
                username={post.user.username}
                avatarUrl={post.user.avatar_url}
                mediaUrl={post.media_url}
                isVideo={post.is_video}
                caption={post.caption}
                createdAt={post.created_at}
                likesCount={post.likes_count}
                commentsCount={post.comments_count}
                hasLiked={post.has_liked}
              />
            ))}
          </div>
        )}
      </main>

      {/* 下部ナビゲーション */}
      <BottomNavbar />
    </div>
  );
}