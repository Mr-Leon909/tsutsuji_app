import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useCommentStore } from '../store/commentStore';

interface CommentInputProps {
  postId: string;
}

export default function CommentInput({ postId }: CommentInputProps) {
  const { user } = useAuthStore();
  const { addComment } = useCommentStore();
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !comment.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      await addComment(postId, user.id, comment.trim());
      setComment('');
    } catch (error) {
      console.error('Failed to post comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form 
      onSubmit={handleSubmit}
      className="border-t border-gray-200 px-4 py-3 flex items-center"
    >
      <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden mr-3">
        {user?.avatar_url ? (
          <img src={user.avatar_url} alt={user.username} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-300 text-gray-600 font-bold">
            {user?.username.charAt(0)}
          </div>
        )}
      </div>
      
      <input
        type="text"
        placeholder="コメントを追加..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="flex-1 text-sm border-none outline-none bg-transparent"
        maxLength={1000}
        required
      />
      
      <button
        type="submit"
        disabled={!comment.trim() || isSubmitting}
        className={`text-sm font-semibold ml-2 ${
          comment.trim() && !isSubmitting
            ? 'text-pink-500 hover:text-pink-600'
            : 'text-pink-300 cursor-not-allowed'
        }`}
      >
        投稿
      </button>
    </form>
  );
}