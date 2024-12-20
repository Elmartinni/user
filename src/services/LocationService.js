import { db } from '../firebase';
import { doc, updateDoc, GeoPoint } from 'firebase/firestore';

export const LocationService = {
  getCurrentPosition: () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(resolve, reject);
    });
  },

  updateUserLocation: async (userId, latitude, longitude) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        location: new GeoPoint(latitude, longitude),
        lastLocationUpdate: new Date()
      });
    } catch (error) {
      console.error('Error updating location:', error);
      throw error;
    }
  },

  calculateDistance: (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }
}; 