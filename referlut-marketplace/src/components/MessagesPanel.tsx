import React from 'react';
import { MessageCircle, Bell } from 'lucide-react';
import { User } from '../types';

interface MessagesPanelProps {
  user: User;
}

const MessagesPanel: React.FC<MessagesPanelProps> = ({ user }) => {
  const hasUnread = user.unreadMessages > 0;

  return (
    <div className="fixed bottom-6 left-6 z-10">
      <button className="flex items-center justify-center bg-blue-500 text-white rounded-full p-4 shadow-lg hover:bg-blue-600 transition-colors duration-200 group relative">
        <MessageCircle className="w-6 h-6" />
        
        {hasUnread && (
          <div className="absolute -top-1 -right-1 flex items-center justify-center bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 animate-pulse">
            {user.unreadMessages}
          </div>
        )}
        
        <div className="absolute bottom-full mb-2 left-0 bg-white shadow-lg rounded-lg py-2 px-3 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 whitespace-nowrap">
          {hasUnread ? `${user.unreadMessages} unread messages` : 'Messages'}
        </div>
      </button>
    </div>
  );
};

export default MessagesPanel;