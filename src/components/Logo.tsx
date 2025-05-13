interface LogoProps {
  variant?: 'default' | 'small';
}

export default function Logo({ variant = 'default' }: LogoProps) {
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
      <img src="../TSUTSUjiロゴ（改）.png" alt="TSUTSUJI" className="w-40 h-40" />
    </div>
  );
}