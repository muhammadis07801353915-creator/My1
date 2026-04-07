import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ClientApp from './ClientApp';
import AdminLayout from './admin/AdminLayout';
import Dashboard from './admin/pages/Dashboard';
import Users from './admin/pages/Users';
import Movies from './admin/pages/Movies';
import LiveTVAdmin from './admin/pages/LiveTVAdmin';
import SettingsAdmin from './admin/pages/Settings';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Client App Route */}
        <Route path="/*" element={<ClientApp />} />

        {/* Admin Panel Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="movies" element={<Movies />} />
          <Route path="livetv" element={<LiveTVAdmin />} />
          <Route path="settings" element={<SettingsAdmin />} />
          {/* Fallback for unknown admin routes */}
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
