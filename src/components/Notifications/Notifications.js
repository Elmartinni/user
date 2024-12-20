import React, { useState, useEffect } from 'react';
import { db, auth } from '../../firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import './Notifications.css';

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const currentUser = auth.currentUser;

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', currentUser.uid),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newNotifications = [];
      snapshot.forEach((doc) => {
        newNotifications.push({
          id: doc.id,
          ...doc.data()
        });
      });
      setNotifications(newNotifications);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'match':
        return '💘';
      case 'message':
        return '💌';
      case 'like':
        return '❤️';
      default:
        return '📫';
    }
  };

  return (
    <div className="notifications-container">
      <h2>Notifications</h2>
      <div className="notifications-list">
        {notifications.length === 0 ? (
          <p className="no-notifications">No notifications yet</p>
        ) : (
          notifications.map((notification) => (
            <div key={notification.id} className="notification-item">
              <div className="notification-icon">
                {getNotificationIcon(notification.type)}
              </div>
              <div className="notification-content">
                <p>{notification.message}</p>
                <span className="notification-time">
                  {notification.timestamp.toDate().toLocaleDateString()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Notifications; 