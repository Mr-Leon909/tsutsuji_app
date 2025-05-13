import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { usePostStore } from '../store/postStore';
import BottomNavbar from '../components/BottomNavbar';
import PostGrid from '../components/PostGrid';

export default function UserPostsPage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { userPosts, fetchUserPosts, isLoading } = usePostStore();
  const [userProfile, setUserProfile] = useState<{
    username: string;
    avatar_url: string | null;
  } | null>(null);

  useEffect(() => {
    if (userId) {
      // ユーザー情報の取得
      const fetchUserProfile = async () => {
        try {
          const { data, error } = await supabase
            .from('users')
            .select('username, avatar_url')
            .eq('id', userId)
            .single();

          if (error) {
            throw error;
          }

          if (data) {
            setUserProfile(data);
          }
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
        }
      };

      fetchUserProfile();
      fetchUserPosts(userId);
    }
  }, [fetchUserPosts, userId]);

  // 現在のユーザーのプロフィールの場合はマイページにリダイレクト
  useEffect(() => {
    if (user && userId === user.id) {
      navigate('/sns/myposts');
    }
  }, [user, userId, navigate]);

  if (!userProfile) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="pb-28">
      {/* ヘッダー */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center">
          <button onClick={() => navigate(-1)} className="mr-4">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-semibold">{userProfile.username}</h1>
        </div>
      </header>

      {/* プロフィール情報 */}
      <div className="px-4 py-6">
        <div className="flex items-center">
          {/* プロフィール画像 */}
          <div className="w-20 h-20 rounded-full bg-gray-200 overflow-hidden mr-6">
            {userProfile.avatar_url ? (
              <img
                src={userProfile.avatar_url}
                alt={userProfile.username}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-300 text-gray-600 text-2xl font-bold">
                {userProfile.username.charAt(0)}
              </div>
            )}
          </div>

          {/* ユーザー情報 */}
          <div className="flex-1">
            <p className="text-base font-semibold">{userProfile.username}</p>
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
          </div>
        ) : (
          <PostGrid posts={userPosts} userId={userId!} isCurrentUser={false} />
        )}
      </div>

      {/* 下部ナビゲーション */}
      <BottomNavbar />
    </div>
  );
}