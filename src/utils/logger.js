export const logger = {
  error: (error, context = {}) => {
    console.error(error);
    // Send to error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Report to monitoring service
    }
  },
  info: (message, data = {}) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(message, data);
    }
  }
}; 