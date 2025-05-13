import { useLocation } from 'react-router-dom';

interface LogoProps {
  variant?: 'default' | 'small';
}

export default function Logo({ variant = 'default' }: LogoProps) {
  const location = useLocation();
  const logoUrl = '/TSUTSUjiロゴ.png';

  // デフォルトサイズのロゴ
  if (variant === 'default') {
    return (
      <div className="flex flex-col items-center">
        <img src={logoUrl} alt="TSUTSUJI" className="w-48 h-48" />
      </div>
    );
  }

  // 小さいサイズのロゴ（ヘッダー用など）
  return (
    <div className="flex items-center">
      <img src={logoUrl} alt="TSUTSUJI" className="w-20 h-20" />
    </div>
  );
}