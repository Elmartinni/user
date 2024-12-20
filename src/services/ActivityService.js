import { db } from '../firebase';
import { doc, setDoc, increment, serverTimestamp, writeBatch } from 'firebase/firestore';

// Add rate limiting and error handling
const rateLimiter = new Map();

export const ActivityService = {
  trackActivity: async (userId, activityType, details = {}) => {
    if (!userId) return;

    // Rate limit check (1 activity per second)
    const key = `${userId}_${activityType}`;
    const now = Date.now();
    if (rateLimiter.has(key) && now - rateLimiter.get(key) < 1000) {
      return;
    }
    rateLimiter.set(key, now);

    try {
      const batch = writeBatch(db);
      
      // Activity log
      const activityRef = doc(db, 'activities', `${userId}_${now}`);
      batch.set(activityRef, {
        userId,
        type: activityType,
        details,
        timestamp: serverTimestamp()
      });

      // Update stats
      const statsRef = doc(db, `users/${userId}/stats/activity`);
      batch.set(statsRef, {
        [`${activityType}Count`]: increment(1),
        lastActive: serverTimestamp()
      }, { merge: true });

      await batch.commit();
    } catch (error) {
      console.error('Error tracking activity:', error);
    }
  },

  trackLogin: (userId) => {
    return ActivityService.trackActivity(userId, 'login');
  },

  trackMatch: (userId, matchedUserId) => {
    return ActivityService.trackActivity(userId, 'match', { matchedUserId });
  },

  trackMessage: (userId, matchId) => {
    return ActivityService.trackActivity(userId, 'message', { matchId });
  },

  trackProfileView: (userId, viewedUserId) => {
    return ActivityService.trackActivity(userId, 'profile_view', { viewedUserId });
  },

  trackSwipe: (userId, swipedUserId, direction) => {
    return ActivityService.trackActivity(userId, 'swipe', { 
      swipedUserId, 
      direction 
    });
  }
}; 