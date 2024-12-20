import { db } from '../firebase';
import { doc, setDoc, onDisconnect, serverTimestamp, onSnapshot } from 'firebase/firestore';

export const PresenceService = {
  initializePresence: async (userId) => {
    if (!userId) return;
    
    let unsubscribe = null;
    const userStatusRef = doc(db, 'status', userId);
    const connectedRef = doc(db, '.info/connected');
    
    try {
      // Listen for connection state changes
      unsubscribe = onSnapshot(connectedRef, async (snap) => {
        if (snap.exists() && snap.data()?.connected) {
          // Create a reference for cleanup
          const onDisconnectRef = onDisconnect(userStatusRef);
          
          // First set the status to online
          await setDoc(userStatusRef, {
            state: 'online',
            lastChanged: serverTimestamp(),
          });

          // Then setup the offline trigger
          await onDisconnectRef.set({
            state: 'offline',
            lastChanged: serverTimestamp(),
          });
        }
      });

      // Return cleanup function
      return () => {
        if (unsubscribe) unsubscribe();
      };
    } catch (error) {
      console.error('Error setting up presence:', error);
      if (unsubscribe) unsubscribe();
    }
  },

  getUserPresence: (userId, callback) => {
    const userStatusRef = doc(db, 'status', userId);
    return onSnapshot(userStatusRef, (doc) => {
      if (doc.exists()) {
        callback(doc.data());
      }
    });
  }
}; 