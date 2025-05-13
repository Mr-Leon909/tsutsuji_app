import { useNavigate } from 'react-router-dom';
import { Video } from 'lucide-react';

interface Post {
  id: string;
  user_id: string;
  media_url: string;
  is_video: boolean;
}

interface PostGridProps {
  posts: Post[];
  userId: string;
  isCurrentUser: boolean;
}

export default function PostGrid({ posts, userId, isCurrentUser }: PostGridProps) {
  const navigate = useNavigate();

  // 投稿の詳細ページに移動する関数
  const navigateToPost = (postId: string) => {
    if (isCurrentUser) {
      navigate(`/sns/mypost/${postId}`);
    } else {
      navigate(`/sns/${userId}/post/${postId}`);
    }
  };

  return (
    <div className="grid grid-cols-3 gap-[2px]">
      {posts.map((post) => (
        <div 
          key={post.id}
          className="aspect-square relative cursor-pointer overflow-hidden bg-gray-100"
          onClick={() => navigateToPost(post.id)}
        >
          {post.is_video ? (
            <>
              <video 
                src={post.media_url}
                className="w-full h-full object-cover"
                muted
                playsInline
              />
              <div className="absolute top-2 right-2">
                <Video className="w-4 h-4 text-white" />
              </div>
            </>
          ) : (
            <img 
              src={post.media_url} 
              alt="投稿" 
              className="w-full h-full object-cover"
              loading="lazy"
            />
          )}
        </div>
      ))}
    </div>
  );
}