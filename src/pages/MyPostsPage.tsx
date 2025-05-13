import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { usePostStore } from '../store/postStore';
import { ArrowLeft } from 'lucide-react';
import BottomNavbar from '../components/BottomNavbar';
import PostGrid from '../components/PostGrid';

export default function MyPostsPage() {
  const { user } = useAuthStore();
  const { userPosts, fetchUserPosts, isLoading } = usePostStore();

  useEffect(() => {
    if (user) {
      fetchUserPosts(user.id);
    }
  }, [fetchUserPosts, user]);

  if (!user) {
    return null;
  }

  return (
    <div className="pb-28">
      {/* ヘッダー */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-center">
          <h1 className="text-lg font-semibold">{user.username}</h1>
        </div>
      </header>

      {/* プロフィール情報 */}
      <div className="px-4 py-6">
        <div className="flex items-center">
          {/* プロフィール画像 */}
          <div className="relative mr-6">
            <div className="w-20 h-20 rounded-full bg-gray-200 overflow-hidden">
              {user.avatar_url ? (
                <img src={user.avatar_url} alt={user.username} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-300 text-gray-600 text-2xl font-bold">
                  {user.username?.charAt(0) || '?'}
                </div>
              )}
            </div>
            
            {/* 週末の予定は？ボタン */}
            <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 border border-gray-200 shadow-sm">
              <div className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded-full">
                <span className="text-xs font-medium">＋</span>
              </div>
            </div>
          </div>
          
          {/* ユーザー情報 */}
          <div className="flex-1">
            <p className="text-base font-semibold">{user.username}</p>
            <div className="mt-1 flex items-center">
              <div className="mr-4">
                <span className="font-semibold">{userPosts.length}</span>
                <span className="text-sm text-gray-500 ml-1">投稿</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 投稿グリッド */}
      <div className="border-t border-gray-200">
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <p className="text-gray-500">読み込み中...</p>
          </div>
        ) : userPosts.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-600 mb-2">投稿がありません</p>
            <p className="text-gray-500 text-sm">
              新しい投稿を作成して、思い出を残しましょう！
            </p>
          </div>
        ) : (
          <PostGrid 
            posts={userPosts} 
            userId={user.id} 
            isCurrentUser={true} 
          />
        )}
      </div>

      {/* 下部ナビゲーション */}
      <BottomNavbar />
    </div>
  );
}