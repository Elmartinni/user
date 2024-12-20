import { db } from '../firebase';
import { collection, query, where, getDocs, orderBy, limit, doc, getDoc, setDoc } from 'firebase/firestore';
import { LocationService } from './LocationService';

export const RecommendationService = {
  getRecommendations: async (userId, preferences) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) {
        throw new Error('User not found');
      }
      const userData = userDoc.data();
      
      // Base query
      let q = query(
        collection(db, 'users'),
        where('gender', 'in', preferences.interestedIn),
        where('age', '>=', preferences.ageRange.min),
        where('age', '<=', preferences.ageRange.max)
      );

      // Get all potential matches
      const snapshot = await getDocs(q);
      let potentialMatches = [];

      snapshot.forEach(doc => {
        if (doc.id !== userId) {
          potentialMatches.push({
            id: doc.id,
            ...doc.data(),
            score: 0
          });
        }
      });

      // Calculate scores based on various factors
      potentialMatches = potentialMatches.map(match => {
        let score = 0;

        // Location score
        if (userData.location && match.location) {
          const distance = LocationService.calculateDistance(
            userData.location.latitude,
            userData.location.longitude,
            match.location.latitude,
            match.location.longitude
          );
          score += Math.max(0, 100 - distance); // Higher score for closer users
        }

        // Interests match score
        const commonInterests = userData.interests?.filter(
          interest => match.interests?.includes(interest)
        ) || [];
        score += commonInterests.length * 10;

        // Activity score
        if (match.lastActive) {
          const daysSinceActive = (Date.now() - match.lastActive.toDate()) / (1000 * 60 * 60 * 24);
          score += Math.max(0, 50 - daysSinceActive);
        }

        // Profile completion score
        score += (match.profileCompleteness || 0) / 2;

        // Verification bonus
        if (match.verification?.status === 'verified') {
          score += 50;
        }

        return {
          ...match,
          score
        };
      });

      // Sort by score and return top matches
      return potentialMatches
        .sort((a, b) => b.score - a.score)
        .slice(0, 20);
    } catch (error) {
      console.error('Error getting recommendations:', error);
      return [];
    }
  },

  updateUserPreferences: async (userId, preferences) => {
    try {
      await setDoc(doc(db, 'users', userId), {
        matchPreferences: preferences
      }, { merge: true });
    } catch (error) {
      console.error('Error updating preferences:', error);
      throw error;
    }
  }
}; 