import { createBrowserRouter, Navigate } from 'react-router-dom';
import Layout from './components/Layout.tsx';
import UserListPage from './pages/UserListPage.tsx';
import UserDetailPage from './pages/UserDetailPage.tsx';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <UserListPage /> },
      { path: 'users/:id', element: <UserDetailPage /> },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);
