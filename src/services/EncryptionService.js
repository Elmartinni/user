import CryptoJS from 'crypto-js';

export const EncryptionService = {
  generateKey: () => {
    return CryptoJS.lib.WordArray.random(256/8).toString();
  },

  encryptMessage: (message, key) => {
    try {
      return CryptoJS.AES.encrypt(message, key).toString();
    } catch (error) {
      console.error('Encryption error:', error);
      throw error;
    }
  },

  decryptMessage: (encryptedMessage, key) => {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedMessage, key);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error('Decryption error:', error);
      return 'Message cannot be decrypted';
    }
  }
}; 