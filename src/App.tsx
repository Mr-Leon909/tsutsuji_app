import { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import LoginPage from './pages/LoginPage';
import TimelinePage from './pages/TimelinePage';
import MyPostsPage from './pages/MyPostsPage';
import PostDetailPage from './pages/PostDetailPage';
import CreatePostPage from './pages/CreatePostPage';
import UserPostsPage from './pages/UserPostsPage';
import UserPostDetailPage from './pages/UserPostDetailPage';
import NotFoundPage from './pages/NotFoundPage';

// 認証が必要なルートを保護するためのコンポーネント
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuthStore();
  const location = useLocation();
  
  if (!user) {
    // ユーザーが認証されていない場合はログインページにリダイレクト
    return <Navigate to="/sns/login" state={{ from: location }} replace />;
  }
  
  return <>{children}</>;
};

function App() {
  const { user } = useAuthStore();
  const location = useLocation();

  // ログイン済みユーザーがログインページにアクセスした場合の処理
  if (user && location.pathname === '/sns/login') {
    return <Navigate to="/sns/top" replace />;
  }

  // ルートパスとsnsパスのリダイレクト処理
  if (location.pathname === '/' || location.pathname === '/sns') {
    return <Navigate to="/sns/login" replace />;
  }

  return (
    <Routes>
      {/* ログインページ */}
      <Route path="/sns/login" element={<LoginPage />} />
      
      {/* 認証が必要なルート */}
      <Route path="/sns/top" element={
        <ProtectedRoute>
          <TimelinePage />
        </ProtectedRoute>
      } />
      
      <Route path="/sns/myposts" element={
        <ProtectedRoute>
          <MyPostsPage />
        </ProtectedRoute>
      } />
      
      <Route path="/sns/mypost/:id" element={
        <ProtectedRoute>
          <PostDetailPage />
        </ProtectedRoute>
      } />
      
      <Route path="/sns/post" element={
        <ProtectedRoute>
          <CreatePostPage />
        </ProtectedRoute>
      } />
      
      <Route path="/sns/:userId/posts" element={
        <ProtectedRoute>
          <UserPostsPage />
        </ProtectedRoute>
      } />
      
      <Route path="/sns/:userId/post/:id" element={
        <ProtectedRoute>
          <UserPostDetailPage />
        </ProtectedRoute>
      } />
      
      {/* 404ページ */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;