import { Navigate, Route, Routes } from 'react-router-dom';

import AppLayout from './components/AppLayout.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import OrdersPage from './pages/OrdersPage.jsx';
import ProductsPage from './pages/ProductsPage.jsx';
import UsersPage from './pages/UsersPage.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="dashboard" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
