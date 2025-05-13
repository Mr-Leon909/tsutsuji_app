import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Heart, MessageCircle, MoreHorizontal } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { usePostStore } from '../store/postStore';

interface PostCardProps {
  id: string;
  userId: string;
  username: string;
  avatarUrl: string | null;
  mediaUrl: string;
  isVideo: boolean;
  caption: string | null;
  createdAt: string;
  likesCount: number;
  commentsCount: number;
  hasLiked: boolean;
  showActions?: boolean;
}

export default function PostCard({
  id,
  userId,
  username,
  avatarUrl,
  mediaUrl,
  isVideo,
  caption,
  createdAt,
  likesCount,
  commentsCount,
  hasLiked,
  showActions = true
}: PostCardProps) {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { likePost, unlikePost } = usePostStore();
  const [liked, setLiked] = useState(hasLiked);
  const [likes, setLikes] = useState(likesCount);
  const [showHeartAnimation, setShowHeartAnimation] = useState(false);

  // 投稿の詳細ページに移動する関数
  const navigateToDetail = () => {
    if (user?.id === userId) {
      navigate(`/sns/mypost/${id}`);
    } else {
      navigate(`/sns/${userId}/post/${id}`);
    }
  };

  // ユーザーのプロフィールページに移動する関数
  const navigateToUserProfile = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (user?.id === userId) {
      navigate('/sns/myposts');
    } else {
      navigate(`/sns/${userId}/posts`);
    }
  };

  // いいね機能の処理
  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;

    if (liked) {
      setLiked(false);
      setLikes(prev => Math.max(0, prev - 1));
      unlikePost(id, user.id);
    } else {
      setLiked(true);
      setLikes(prev => prev + 1);
      likePost(id, user.id);
      setShowHeartAnimation(true);
      setTimeout(() => setShowHeartAnimation(false), 800);
    }
  };

  // 投稿日時をフォーマットする関数
  const formatTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: ja });
    } catch (error) {
      return '不明な日時';
    }
  };

  return (
    <div className="border-b border-gray-200 pb-4 mb-4">
      {/* ユーザー情報セクション */}
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-2" onClick={navigateToUserProfile}>
          <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
            {avatarUrl ? (
              <img src={avatarUrl} alt={username} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-300 text-gray-600 font-bold">
                {username.charAt(0)}
              </div>
            )}
          </div>
          <span className="font-semibold text-sm">{username}</span>
        </div>
        <button className="text-gray-500">
          <MoreHorizontal size={20} />
        </button>
      </div>

      {/* メディアコンテンツ */}
      <div 
        className="relative aspect-square w-full bg-black cursor-pointer overflow-hidden"
        onClick={navigateToDetail}
      >
        {isVideo ? (
          <video 
            src={mediaUrl} 
            className="w-full h-full object-contain" 
            controls={false}
            loop
            muted
            playsInline
          />
        ) : (
          <img 
            src={mediaUrl} 
            alt="投稿" 
            className="w-full h-full object-contain" 
            loading="lazy" 
          />
        )}
        
        {/* いいねアニメーション */}
        {showHeartAnimation && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <Heart className="heart-animation w-20 h-20 text-white fill-pink-500" />
          </div>
        )}
      </div>

      {/* アクションボタン */}
      {showActions && (
        <div className="flex items-center gap-4 px-4 pt-3">
          <button 
            className={`${liked ? 'like-animation' : ''}`}
            onClick={handleLike}
            aria-label={liked ? 'いいねを取り消す' : 'いいねする'}
          >
            <Heart 
              className={`w-6 h-6 ${liked ? 'text-pink-500 fill-pink-500' : 'text-gray-900'}`} 
            />
          </button>
          <button onClick={navigateToDetail} aria-label="コメントを表示">
            <MessageCircle className="w-6 h-6 text-gray-900" />
          </button>
        </div>
      )}

      {/* いいね数表示 */}
      {showActions && likes > 0 && (
        <div className="px-4 pt-2">
          <p className="text-sm font-semibold">{likes}件のいいね</p>
        </div>
      )}

      {/* キャプションと投稿時間 */}
      <div className="px-4 pt-1">
        {caption && (
          <p className="text-sm">
            <span className="font-semibold mr-1">{username}</span>
            {caption}
          </p>
        )}
        
        {commentsCount > 0 && (
          <button 
            className="text-sm text-gray-500 mt-1"
            onClick={navigateToDetail}
          >
            {commentsCount}件のコメントをすべて見る
          </button>
        )}
        
        <p className="text-xs text-gray-400 mt-1">{formatTime(createdAt)}</p>
      </div>
    </div>
  );
}