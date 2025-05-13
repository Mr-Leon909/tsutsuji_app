import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Heart } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useCommentStore } from '../store/commentStore';

interface CommentProps {
  id: string;
  username: string;
  avatarUrl: string | null;
  content: string;
  createdAt: string;
  likesCount: number;
  hasLiked: boolean;
}

export default function Comment({
  id,
  username,
  avatarUrl,
  content,
  createdAt,
  likesCount,
  hasLiked
}: CommentProps) {
  const { user } = useAuthStore();
  const { likeComment, unlikeComment } = useCommentStore();
  const [liked, setLiked] = useState(hasLiked);
  const [likes, setLikes] = useState(likesCount);

  // いいね機能の処理
  const handleLike = () => {
    if (!user) return;

    if (liked) {
      setLiked(false);
      setLikes(prev => Math.max(0, prev - 1));
      unlikeComment(id, user.id);
    } else {
      setLiked(true);
      setLikes(prev => prev + 1);
      likeComment(id, user.id);
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
    <div className="flex gap-3 mb-4">
      {/* ユーザーアバター */}
      <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
        {avatarUrl ? (
          <img src={avatarUrl} alt={username} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-300 text-gray-600 font-bold">
            {username.charAt(0)}
          </div>
        )}
      </div>

      <div className="flex-1">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            {/* コメント内容 */}
            <p className="text-sm">
              <span className="font-semibold mr-1">{username}</span>
              {content}
            </p>
            
            {/* コメント日時といいね数 */}
            <div className="flex gap-4 mt-1 text-xs text-gray-500">
              <span>{formatTime(createdAt)}</span>
              {likes > 0 && <span>{likes}件のいいね</span>}
            </div>
          </div>
          
          {/* いいねボタン */}
          <button 
            onClick={handleLike}
            className="ml-2 flex-shrink-0"
            aria-label={liked ? 'いいねを取り消す' : 'いいねする'}
          >
            <Heart 
              className={`w-3.5 h-3.5 ${liked ? 'text-pink-500 fill-pink-500' : 'text-gray-400'}`} 
            />
          </button>
        </div>
      </div>
    </div>
  );
}