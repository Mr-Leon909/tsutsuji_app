import { Home, PlusSquare, User } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function BottomNavbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  if (!user) return null;

  // 現在のパスがどのナビゲーションアイテムに対応するかを確認
  const isActive = (path: string) => {
    return location.pathname.includes(path);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-10">
      <div className="flex justify-around items-center py-3 px-4 max-w-screen-md mx-auto">
        {/* ホーム（タイムライン）ボタン */}
        <button
          onClick={() => navigate('/sns/top')}
          className="flex flex-col items-center"
          aria-label="タイムライン"
        >
          <Home 
            className={`tsutsuji-nav-icon ${isActive('/sns/top') ? 'active' : 'text-gray-800'}`} 
          />
          {isActive('/sns/top') && (
            <div className="w-1 h-1 bg-[#ec4899] rounded-full mt-1"></div>
          )}
        </button>

        {/* 投稿作成ボタン */}
        <button
          onClick={() => navigate('/sns/post')}
          className="flex flex-col items-center"
          aria-label="投稿を作成"
        >
          <PlusSquare 
            className={`tsutsuji-nav-icon ${isActive('/sns/post') ? 'active' : 'text-gray-800'}`} 
          />
          {isActive('/sns/post') && (
            <div className="w-1 h-1 bg-[#ec4899] rounded-full mt-1"></div>
          )}
        </button>

        {/* マイプロフィールボタン */}
        <button
          onClick={() => navigate('/sns/myposts')}
          className="flex flex-col items-center"
          aria-label="マイプロフィール"
        >
          <User 
            className={`tsutsuji-nav-icon ${isActive('/sns/myposts') || isActive('/sns/mypost/') ? 'active' : 'text-gray-800'}`} 
          />
          {(isActive('/sns/myposts') || isActive('/sns/mypost/')) && (
            <div className="w-1 h-1 bg-[#ec4899] rounded-full mt-1"></div>
          )}
        </button>
      </div>
      
      {/* iPhoneのホームインジケーター用の余白 */}
      <div className="h-6 bg-white"></div>
    </div>
  );
}