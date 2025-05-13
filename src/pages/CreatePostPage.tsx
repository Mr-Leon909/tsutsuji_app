import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { X, ArrowRight, Image, Film } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { usePostStore } from '../store/postStore';
import BottomNavbar from '../components/BottomNavbar';

// アップロード画面のステップ
enum UploadStep {
  MEDIA_SELECT = 'MEDIA_SELECT',
  CAPTION = 'CAPTION'
}

export default function CreatePostPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { createPost } = usePostStore();
  
  const [currentStep, setCurrentStep] = useState<UploadStep>(UploadStep.MEDIA_SELECT);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isVideo, setIsVideo] = useState(false);
  const [caption, setCaption] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ファイルのドロップとプレビュー処理
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null);
    
    if (acceptedFiles.length === 0) {
      return;
    }

    const file = acceptedFiles[0];
    
    // ファイルサイズの制限（10MB）
    if (file.size > 10 * 1024 * 1024) {
      setError('ファイルサイズは10MB以下にしてください');
      return;
    }
    
    // 画像か動画かを判定
    const isVideoFile = file.type.startsWith('video/');
    setIsVideo(isVideoFile);
    
    setSelectedFile(file);
    
    // プレビューURLの生成
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': [],
      'video/*': []
    },
    maxFiles: 1
  });

  // 「次へ」ボタンのハンドラー
  const handleNext = () => {
    if (!selectedFile) {
      setError('画像または動画を選択してください');
      return;
    }
    
    setCurrentStep(UploadStep.CAPTION);
  };

  // 投稿を作成する処理
  const handleCreatePost = async () => {
    if (!user || !selectedFile || isUploading) return;
    
    setIsUploading(true);
    setError(null);
    
    try {
      // 実際のアプリケーションでは、ここでSupabase Storageなどにファイルをアップロードする処理を行います
      // このデモでは、プレビューURLをそのまま使用します
      
      // キャプションの文字数制限
      if (caption.length > 2000) {
        setError('キャプションは2000文字以内で入力してください');
        setIsUploading(false);
        return;
      }
      
      // 投稿の作成
      const postId = await createPost(user.id, preview!, isVideo, caption || null);
      
      if (postId) {
        // 投稿に成功したらタイムラインページに移動
        navigate('/sns/top');
      } else {
        setError('投稿の作成に失敗しました');
      }
    } catch (err) {
      console.error('Post creation error:', err);
      setError('エラーが発生しました。もう一度お試しください。');
    } finally {
      setIsUploading(false);
    }
  };

  // キャンセルボタンの処理
  const handleCancel = () => {
    if (currentStep === UploadStep.MEDIA_SELECT) {
      navigate(-1);
    } else {
      setCurrentStep(UploadStep.MEDIA_SELECT);
    }
  };

  // ファイル選択画面
  const renderMediaSelectStep = () => (
    <>
      <header className="sticky top-0 z-10 bg-black text-white px-4 py-3">
        <div className="flex items-center justify-between">
          <button onClick={handleCancel}>
            <X className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-medium">新規投稿</h1>
          <button 
            onClick={handleNext}
            disabled={!selectedFile}
            className={`font-semibold ${!selectedFile ? 'opacity-50' : ''}`}
          >
            次へ
          </button>
        </div>
      </header>

      <div className="flex-1 p-4">
        {/* ドロップゾーン */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors h-64 flex items-center justify-center ${
            isDragActive ? 'border-pink-400 bg-pink-50' : 'border-gray-300'
          }`}
        >
          <input {...getInputProps()} />
          
          {preview ? (
            <div className="w-full h-full flex items-center justify-center">
              {isVideo ? (
                <video 
                  src={preview} 
                  className="max-h-full max-w-full object-contain" 
                  controls 
                  autoPlay 
                  muted 
                  loop 
                />
              ) : (
                <img 
                  src={preview} 
                  alt="プレビュー" 
                  className="max-h-full max-w-full object-contain" 
                />
              )}
            </div>
          ) : isDragActive ? (
            <div className="text-pink-500">
              <p className="font-medium">ここにファイルをドロップ</p>
            </div>
          ) : (
            <div className="text-gray-500">
              <div className="flex items-center justify-center mb-2">
                <Image className="w-10 h-10 mr-2" />
                <Film className="w-10 h-10" />
              </div>
              <p className="font-medium">画像または動画をドラッグ＆ドロップ</p>
              <p className="text-sm mt-1">またはクリックして選択</p>
            </div>
          )}
        </div>

        {/* エラーメッセージ */}
        {error && (
          <div className="mt-4 p-2 bg-red-50 text-red-600 rounded text-sm">
            {error}
          </div>
        )}
      </div>
    </>
  );

  // キャプション入力画面
  const renderCaptionStep = () => (
    <>
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <button onClick={handleCancel}>
            <X className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-medium">新規投稿</h1>
          <button 
            onClick={handleCreatePost}
            disabled={isUploading}
            className={`font-semibold text-pink-500 ${isUploading ? 'opacity-50' : ''}`}
          >
            {isUploading ? '投稿中...' : '投稿する'}
          </button>
        </div>
      </header>

      <div className="flex-1 p-4">
        {/* プレビューとキャプション入力 */}
        <div className="flex mb-6">
          <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden mr-4 flex-shrink-0">
            {preview && (
              isVideo ? (
                <video 
                  src={preview} 
                  className="w-full h-full object-cover" 
                  muted 
                />
              ) : (
                <img 
                  src={preview} 
                  alt="プレビュー" 
                  className="w-full h-full object-cover" 
                />
              )
            )}
          </div>
          
          <div className="flex-1">
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="キャプションを入力する..."
              className="w-full p-2 resize-none focus:outline-none border-0"
              rows={5}
              maxLength={2000}
            />
            <div className="text-right text-xs text-gray-500">
              {caption.length}/2000
            </div>
          </div>
        </div>

        {/* エラーメッセージ */}
        {error && (
          <div className="mt-4 p-2 bg-red-50 text-red-600 rounded text-sm">
            {error}
          </div>
        )}
      </div>
    </>
  );

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {currentStep === UploadStep.MEDIA_SELECT ? (
        renderMediaSelectStep()
      ) : (
        renderCaptionStep()
      )}
      
      {/* 下部ナビゲーション */}
      <BottomNavbar />
    </div>
  );
}