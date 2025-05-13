import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import Logo from '../components/Logo';

export default function LoginPage() {
  const navigate = useNavigate();
  const { user, login, error, isLoading } = useAuthStore();
  
  const [username, setUsername] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthDay, setBirthDay] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  // ユーザーがすでにログインしている場合はタイムラインページにリダイレクト
  useEffect(() => {
    if (user) {
      navigate('/sns/top');
    }
  }, [user, navigate]);

  // ストアからのエラーメッセージを設定
  useEffect(() => {
    if (error) {
      setLoginError(error);
    }
  }, [error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    // バリデーション
    if (!username) {
      setLoginError('ユーザー名を入力してください');
      return;
    }

    if (!birthYear || !birthMonth || !birthDay) {
      setLoginError('生年月日をすべて入力してください');
      return;
    }

    // 生年月日を結合してフォーマット
    const birthDate = `${birthYear}-${birthMonth.padStart(2, '0')}-${birthDay.padStart(2, '0')}`;
    
    // ログイン処理
    await login(username, birthDate);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-white">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Logo />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ユーザー名入力 */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              ユーザー名
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-300"
              placeholder="ユーザー名を入力"
            />
          </div>

          {/* 生年月日入力 */}
          <div>
            <label htmlFor="birth-year" className="block text-sm font-medium text-gray-700 mb-1">
              生年月日
            </label>
            <div className="flex gap-2">
              <div className="flex-1">
                <input
                  id="birth-year"
                  type="text"
                  value={birthYear}
                  onChange={(e) => setBirthYear(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-300"
                  placeholder="1990"
                  maxLength={4}
                />
                <span className="text-xs text-gray-500 mt-1 block">年</span>
              </div>
              <div className="flex-1">
                <input
                  id="birth-month"
                  type="text"
                  value={birthMonth}
                  onChange={(e) => setBirthMonth(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-300"
                  placeholder="01"
                  maxLength={2}
                />
                <span className="text-xs text-gray-500 mt-1 block">月</span>
              </div>
              <div className="flex-1">
                <input
                  id="birth-day"
                  type="text"
                  value={birthDay}
                  onChange={(e) => setBirthDay(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-300"
                  placeholder="01"
                  maxLength={2}
                />
                <span className="text-xs text-gray-500 mt-1 block">日</span>
              </div>
            </div>
          </div>

          {/* エラーメッセージ */}
          {loginError && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
              {loginError}
            </div>
          )}

          {/* ログインボタン */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-4 py-3 bg-[#f472b6] text-white font-semibold rounded-md hover:bg-[#ec4899] focus:outline-none focus:ring-2 focus:ring-pink-300 transition-colors disabled:bg-pink-300 disabled:cursor-not-allowed"
          >
            {isLoading ? 'ログイン中...' : 'ログイン'}
          </button>
        </form>

        {/* ログイン情報のヘルプテキスト */}
        <div className="mt-8 p-4 bg-gray-50 rounded-md text-sm text-gray-600">
          <p className="font-medium mb-2">ログイン情報:</p>
          <div className="space-y-2">
            <div>
              <p>ユーザー名: ひびき</p>
              <p>生年月日: 1996年11月13日</p>
            </div>
            <div>
              <p>ユーザー名: あすか</p>
              <p>生年月日: 1995年5月18日</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}