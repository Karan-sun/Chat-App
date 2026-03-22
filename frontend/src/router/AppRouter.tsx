import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { ChatLayout } from '../pages/ChatLayout';
import { RoomListView } from '../components/sidebar/RoomList';
import { DMListView } from '../components/sidebar/DMList';
import { RoomChatView } from '../components/chat/RoomChatView';
import { DMChatView } from '../components/chat/DMChatView';

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/chat" element={<ChatLayout />}>
            <Route index element={<Navigate to="rooms" replace />} />
            <Route path="rooms" element={<RoomListView />} />
            <Route path="rooms/:roomId" element={<RoomChatView />} />
            <Route path="dm" element={<DMListView />} />
            <Route path="dm/:userId" element={<DMChatView />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/chat" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
