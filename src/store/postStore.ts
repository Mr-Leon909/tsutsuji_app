import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface Post {
  id: string;
  user_id: string;
  media_url: string;
  is_video: boolean;
  caption: string | null;
  created_at: string;
  user: {
    username: string;
    avatar_url: string | null;
  };
  likes_count: number;
  comments_count: number;
  has_liked: boolean;
}

interface PostState {
  posts: Post[];
  userPosts: Post[];
  currentPost: Post | null;
  isLoading: boolean;
  error: string | null;
  fetchPosts: (userId?: string) => Promise<void>;
  fetchPostById: (postId: string) => Promise<void>;
  fetchUserPosts: (userId: string) => Promise<void>;
  likePost: (postId: string, userId: string) => Promise<void>;
  unlikePost: (postId: string, userId: string) => Promise<void>;
  createPost: (userId: string, mediaUrl: string, isVideo: boolean, caption: string | null) => Promise<string | null>;
}

export const usePostStore = create<PostState>((set, get) => ({
  posts: [],
  userPosts: [],
  currentPost: null,
  isLoading: false,
  error: null,
  
  fetchPosts: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      let query = supabase
        .from('posts')
        .select(`
          *,
          user:users(username, avatar_url),
          likes:likes(count),
          comments:comments(count)
        `)
        .order('created_at', { ascending: false });
      
      const { data, error } = await query;

      if (error) {
        throw error;
      }

      if (data) {
        // ユーザーがいいねしているかどうかを確認
        const currentUserId = userId;
        const postsWithLikeStatus = await Promise.all(
          data.map(async (post) => {
            if (currentUserId) {
              const { data: likeData } = await supabase
                .from('likes')
                .select('*')
                .eq('post_id', post.id)
                .eq('user_id', currentUserId)
                .single();
              
              return {
                ...post,
                likes_count: post.likes.length,
                comments_count: post.comments.length,
                has_liked: !!likeData
              };
            }
            return {
              ...post,
              likes_count: post.likes.length,
              comments_count: post.comments.length,
              has_liked: false
            };
          })
        );

        set({ posts: postsWithLikeStatus, isLoading: false });
      }
    } catch (error) {
      console.error('Fetch posts error:', error);
      set({ error: '投稿の取得に失敗しました', isLoading: false });
    }
  },

  fetchPostById: async (postId) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          user:users(username, avatar_url),
          likes:likes(count),
          comments:comments(count)
        `)
        .eq('id', postId)
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        set({ 
          currentPost: {
            ...data,
            likes_count: data.likes.length,
            comments_count: data.comments.length,
            has_liked: false // このフラグは後で更新
          }, 
          isLoading: false 
        });
      }
    } catch (error) {
      console.error('Fetch post by id error:', error);
      set({ error: '投稿の取得に失敗しました', isLoading: false });
    }
  },

  fetchUserPosts: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          user:users(username, avatar_url),
          likes:likes(count),
          comments:comments(count)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      if (data) {
        const formattedPosts = data.map(post => ({
          ...post,
          likes_count: post.likes.length,
          comments_count: post.comments.length,
          has_liked: false // このフラグは後で更新
        }));
        
        set({ userPosts: formattedPosts, isLoading: false });
      }
    } catch (error) {
      console.error('Fetch user posts error:', error);
      set({ error: 'ユーザーの投稿の取得に失敗しました', isLoading: false });
    }
  },

  likePost: async (postId, userId) => {
    try {
      const { error } = await supabase
        .from('likes')
        .insert([{ post_id: postId, user_id: userId }]);

      if (error) {
        throw error;
      }

      // 現在の状態を更新
      const posts = get().posts.map(post => {
        if (post.id === postId) {
          return { ...post, likes_count: post.likes_count + 1, has_liked: true };
        }
        return post;
      });

      const userPosts = get().userPosts.map(post => {
        if (post.id === postId) {
          return { ...post, likes_count: post.likes_count + 1, has_liked: true };
        }
        return post;
      });

      const currentPost = get().currentPost;
      if (currentPost && currentPost.id === postId) {
        set({ currentPost: { ...currentPost, likes_count: currentPost.likes_count + 1, has_liked: true } });
      }

      set({ posts, userPosts });
    } catch (error) {
      console.error('Like post error:', error);
    }
  },

  unlikePost: async (postId, userId) => {
    try {
      const { error } = await supabase
        .from('likes')
        .delete()
        .match({ post_id: postId, user_id: userId });

      if (error) {
        throw error;
      }

      // 現在の状態を更新
      const posts = get().posts.map(post => {
        if (post.id === postId) {
          return { ...post, likes_count: Math.max(0, post.likes_count - 1), has_liked: false };
        }
        return post;
      });

      const userPosts = get().userPosts.map(post => {
        if (post.id === postId) {
          return { ...post, likes_count: Math.max(0, post.likes_count - 1), has_liked: false };
        }
        return post;
      });

      const currentPost = get().currentPost;
      if (currentPost && currentPost.id === postId) {
        set({ currentPost: { 
          ...currentPost, 
          likes_count: Math.max(0, currentPost.likes_count - 1), 
          has_liked: false 
        }});
      }

      set({ posts, userPosts });
    } catch (error) {
      console.error('Unlike post error:', error);
    }
  },

  createPost: async (userId, mediaUrl, isVideo, caption) => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .insert([{ 
          user_id: userId, 
          media_url: mediaUrl, 
          is_video: isVideo, 
          caption: caption
        }])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data?.id || null;
    } catch (error) {
      console.error('Create post error:', error);
      return null;
    }
  }
}));