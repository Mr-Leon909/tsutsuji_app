import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user: {
    username: string;
    avatar_url: string | null;
  };
  likes_count: number;
  has_liked: boolean;
}

interface CommentState {
  comments: Comment[];
  isLoading: boolean;
  error: string | null;
  fetchComments: (postId: string, userId?: string) => Promise<void>;
  addComment: (postId: string, userId: string, content: string) => Promise<void>;
  likeComment: (commentId: string, userId: string) => Promise<void>;
  unlikeComment: (commentId: string, userId: string) => Promise<void>;
}

export const useCommentStore = create<CommentState>((set, get) => ({
  comments: [],
  isLoading: false,
  error: null,
  
  fetchComments: async (postId, userId) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          user:users(username, avatar_url),
          likes:comment_likes(count)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) {
        throw error;
      }

      if (data) {
        // ユーザーがいいねしているかどうかを確認
        const commentsWithLikeStatus = await Promise.all(
          data.map(async (comment) => {
            if (userId) {
              const { data: likeData } = await supabase
                .from('comment_likes')
                .select('*')
                .eq('comment_id', comment.id)
                .eq('user_id', userId)
                .single();
              
              return {
                ...comment,
                likes_count: comment.likes.length,
                has_liked: !!likeData
              };
            }
            return {
              ...comment,
              likes_count: comment.likes.length,
              has_liked: false
            };
          })
        );

        set({ comments: commentsWithLikeStatus, isLoading: false });
      }
    } catch (error) {
      console.error('Fetch comments error:', error);
      set({ error: 'コメントの取得に失敗しました', isLoading: false });
    }
  },

  addComment: async (postId, userId, content) => {
    try {
      const { data: commentData, error: commentError } = await supabase
        .from('comments')
        .insert([{ post_id: postId, user_id: userId, content }])
        .select()
        .single();

      if (commentError) {
        throw commentError;
      }

      if (commentData) {
        // ユーザー情報を取得
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('username, avatar_url')
          .eq('id', userId)
          .single();

        if (userError) {
          throw userError;
        }

        // 新しいコメントを追加
        const newComment: Comment = {
          ...commentData,
          user: userData,
          likes_count: 0,
          has_liked: false
        };

        set(state => ({ comments: [...state.comments, newComment] }));
      }
    } catch (error) {
      console.error('Add comment error:', error);
    }
  },

  likeComment: async (commentId, userId) => {
    try {
      const { error } = await supabase
        .from('comment_likes')
        .insert([{ comment_id: commentId, user_id: userId }]);

      if (error) {
        throw error;
      }

      // 現在の状態を更新
      const comments = get().comments.map(comment => {
        if (comment.id === commentId) {
          return { ...comment, likes_count: comment.likes_count + 1, has_liked: true };
        }
        return comment;
      });

      set({ comments });
    } catch (error) {
      console.error('Like comment error:', error);
    }
  },

  unlikeComment: async (commentId, userId) => {
    try {
      const { error } = await supabase
        .from('comment_likes')
        .delete()
        .match({ comment_id: commentId, user_id: userId });

      if (error) {
        throw error;
      }

      // 現在の状態を更新
      const comments = get().comments.map(comment => {
        if (comment.id === commentId) {
          return { ...comment, likes_count: Math.max(0, comment.likes_count - 1), has_liked: false };
        }
        return comment;
      });

      set({ comments });
    } catch (error) {
      console.error('Unlike comment error:', error);
    }
  }
}));