
import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useBackend } from '@/context/BackendContext';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

const NotificationDropdown = () => {
  const { 
    notifications, 
    unreadNotificationCount, 
    loadNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead
  } = useBackend();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  
  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen, loadNotifications]);

  const handleNotificationClick = (notification: any) => {
    // Mark as read
    markNotificationAsRead(notification.id);
    
    // Navigate based on notification type
    if (notification.type === 'message' && notification.related_id) {
      navigate('/messages');
    } else if (notification.type === 'robot_request' && notification.related_id) {
      navigate('/dashboard');
    } else if (notification.type === 'new_robot' && notification.related_id) {
      navigate('/robots');
    }
    
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="text-gray-300 hover:text-white relative">
          <Bell className="h-5 w-5" />
          {unreadNotificationCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 mt-1 py-2 bg-gray-900 border border-gray-700 text-white">
        <DropdownMenuLabel className="flex justify-between items-center">
          <span>Notifications</span>
          {unreadNotificationCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs text-blue-400 hover:text-blue-300 p-1 h-auto"
              onClick={() => markAllNotificationsAsRead()}
            >
              Mark all as read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-gray-700" />
        
        <div className="max-h-[300px] overflow-y-auto">
          <DropdownMenuGroup>
            {notifications.length === 0 ? (
              <div className="py-4 px-3 text-center text-gray-400 text-sm">
                No notifications
              </div>
            ) : (
              notifications.slice(0, 10).map((notification) => (
                <DropdownMenuItem 
                  key={notification.id}
                  className={cn(
                    "flex flex-col items-start p-3 cursor-pointer hover:bg-gray-800",
                    !notification.is_read && "bg-gray-800/50"
                  )}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex justify-between w-full">
                    <span className="font-medium text-sm">
                      {notification.title}
                    </span>
                    <span className="text-xs text-gray-400">
                      {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-xs text-gray-300 mt-1">{notification.content}</p>
                  {!notification.is_read && (
                    <div className="w-2 h-2 rounded-full bg-blue-500 absolute top-3 right-3"></div>
                  )}
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuGroup>
        </div>
        
        {notifications.length > 10 && (
          <>
            <DropdownMenuSeparator className="bg-gray-700" />
            <DropdownMenuItem
              className="text-center text-blue-400 hover:text-blue-300 cursor-pointer"
              onClick={() => {
                navigate('/notifications');
                setIsOpen(false);
              }}
            >
              View all notifications
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationDropdown;
