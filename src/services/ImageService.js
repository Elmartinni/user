import { storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export const ImageService = {
  uploadImage: async (file, path) => {
    try {
      const storageRef = ref(storage, path);
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);
      return url;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  },

  uploadProfileImage: async (userId, file) => {
    const path = `profile-images/${userId}/${Date.now()}-${file.name}`;
    return ImageService.uploadImage(file, path);
  },

  uploadMessageImage: async (matchId, file) => {
    const path = `message-images/${matchId}/${Date.now()}-${file.name}`;
    return ImageService.uploadImage(file, path);
  }
}; 