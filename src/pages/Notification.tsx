import { useFinance } from '../contexts/FinanceContext';
import { Notification } from '../types';

const NotificationsPage = () => {
  const { notifications, markNotificationAsRead, clearReadNotifications } = useFinance();

  const handleMarkAsRead = async (id: string) => {
    await markNotificationAsRead(id);
  };

  const handleClearRead = async () => {
    await clearReadNotifications();
  };

  const getNotificationStyle = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-100 border-green-500 text-green-700';
      case 'warning':
        return 'bg-yellow-100 border-yellow-500 text-yellow-700';
      case 'info':
        return 'bg-blue-100 border-blue-500 text-blue-700';
      default:
        return 'bg-gray-100 border-gray-500 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
          <button
            onClick={handleClearRead}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:bg-red-300"
            disabled={!notifications.some((n) => n.isRead)}
          >
            Clear Read Notifications
          </button>
        </div>

        {notifications.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-600">No notifications to display</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification: Notification) => (
              <div
                key={notification.id}
                className={`border-l-4 p-4 rounded-lg shadow ${getNotificationStyle(
                  notification.type
                )} ${notification.isRead ? 'opacity-75' : ''}`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{notification.message}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {notification.createdAt
                        ? new Date(notification.createdAt).toLocaleString()
                        : 'Date not available'}
                    </p>
                  </div>
                  {!notification.isRead && notification.id && (
                    <button
                      onClick={() => handleMarkAsRead(notification.id as string)}
                      className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm"
                    >
                      Mark as Read
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;