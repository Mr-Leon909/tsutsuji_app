import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50">
      <Logo />
      
      <div className="mt-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">404</h1>
        <p className="text-lg text-gray-600 mb-6">ページが見つかりませんでした</p>
        
        <button
          onClick={() => navigate('/sns/top')}
          className="px-5 py-2.5 bg-[#f472b6] text-white font-semibold rounded-md hover:bg-[#ec4899] transition-colors"
        >
          タイムラインに戻る
        </button>
      </div>
    </div>
  );
}