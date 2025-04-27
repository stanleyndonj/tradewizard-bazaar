// src/pages/MessagesPage.tsx
import React from 'react';
import { useBackend } from '@/context/BackendContext';
import AdminChatInterface from '@/components/admin/ChatInterface';
import UserChatInterface from '@/components/users/UserChatInterface';

const MessagesPage = () => {
  const { user } = useBackend();

  return (
    <div className="p-4">
      {user?.is_admin ? <AdminChatInterface /> : <UserChatInterface />}
    </div>
  );
};

export default MessagesPage;