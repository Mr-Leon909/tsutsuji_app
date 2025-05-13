import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, MessageCircle } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { usePostStore } from '../store/postStore';
import { useCommentStore } from '../store/commentStore';
import BottomNavbar from '../components/BottomNavbar';
import Comment from '../components/Comment';
import CommentInput from '../components/CommentInput';

export default function UserPostDetailPage() {
  const { userId, id } = useParams<{ userId: string; id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { currentPost, fetchPostById, likePost, unlikePost } = usePostStore();
  const { comments, fetchComments } = useCommentStore();
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  useEffect(() => {
    if (id && user) {
      fetchPostById(id);
      fetchComments(id, user.id);
    }
  }, [fetchPostById, fetchComments, id, user]);

  useEffect(() => {
    if (currentPost) {
      setLiked(currentPost.has_liked);
      setLikesCount(currentPost.likes_count);
    }
  }, [currentPost]);

  // 現在のユーザーの投稿の場合はマイ投稿詳細ページにリダイレクト
  useEffect(() => {
    if (user && currentPost && currentPost.user_id === user.id) {
      navigate(`/sns/mypost/${id}`);
    }
  }, [user, currentPost, id, navigate]);

  // いいね機能の処理
  const handleLike = () => {
    if (!user || !currentPost) return;
    
    if (liked) {
      setLiked(false);
      setLikesCount(prev => Math.max(0, prev - 1));
      unlikePost(currentPost.id, user.id);
    } else {
      setLiked(true);
      setLikesCount(prev => prev + 1);
      likePost(currentPost.id, user.id);
    }
  };

  if (!currentPost || !user) {
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
          <h1 className="text-lg font-semibold">投稿</h1>
        </div>
      </header>

      {/* 投稿内容 */}
      <div className="max-w-screen-md mx-auto">
        {/* ユーザー情報 */}
        <div className="flex items-center p-4">
          <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden mr-3">
            {currentPost.user.avatar_url ? (
              <img
                src={currentPost.user.avatar_url}
                alt={currentPost.user.username}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-300 text-gray-600 font-bold">
                {currentPost.user.username.charAt(0)}
              </div>
            )}
          </div>
          <span className="font-semibold">{currentPost.user.username}</span>
        </div>

        {/* メディアコンテンツ */}
        <div className="w-full aspect-square bg-black">
          {currentPost.is_video ? (
            <video
              src={currentPost.media_url}
              className="w-full h-full object-contain"
              controls
              autoPlay
              playsInline
            />
          ) : (
            <img
              src={currentPost.media_url}
              alt="投稿"
              className="w-full h-full object-contain"
            />
          )}
        </div>

        {/* アクションボタン */}
        <div className="flex items-center gap-4 p-4">
          <button onClick={handleLike} className={`${liked ? 'like-animation' : ''}`}>
            <Heart
              className={`w-7 h-7 ${liked ? 'text-pink-500 fill-pink-500' : 'text-gray-900'}`}
            />
          </button>
          <button>
            <MessageCircle className="w-7 h-7 text-gray-900" />
          </button>
        </div>

        {/* いいね数 */}
        {likesCount > 0 && (
          <div className="px-4 mb-2">
            <p className="font-semibold">{likesCount}件のいいね</p>
          </div>
        )}

        {/* キャプション */}
        {currentPost.caption && (
          <div className="px-4 mb-4">
            <p>
              <span className="font-semibold mr-1">{currentPost.user.username}</span>
              {currentPost.caption}
            </p>
          </div>
        )}

        {/* コメントセクション */}
        <div className="border-t border-gray-200 pt-4">
          <div className="px-4 mb-4">
            <h3 className="font-semibold mb-4">コメント</h3>
            
            {comments.length === 0 ? (
              <p className="text-gray-500 text-sm">コメントはまだありません。</p>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <Comment
                    key={comment.id}
                    id={comment.id}
                    username={comment.user.username}
                    avatarUrl={comment.user.avatar_url}
                    content={comment.content}
                    createdAt={comment.created_at}
                    likesCount={comment.likes_count}
                    hasLiked={comment.has_liked}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* コメント入力欄 */}
      <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-gray-200">
        <CommentInput postId={currentPost.id} />
      </div>

      {/* 下部ナビゲーション */}
      <BottomNavbar />
    </div>
  );
}