const webpush = require('web-push');

// Configure web-push with proper VAPID details
webpush.setVapidDetails(
  process.env.VAPID_SUBJECT || 'mailto:your-email@example.com',
  process.env.VAPID_PUBLIC_KEY || 'your-public-key',
  process.env.VAPID_PRIVATE_KEY || 'your-private-key'
);

// Enhanced push notification with retry mechanism
const sendPushNotification = async (subscription, payload, retries = 3) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`🚀 Attempting to send push notification (attempt ${attempt}/${retries})`);
      
      const result = await webpush.sendNotification(subscription, JSON.stringify(payload));
      console.log('✅ Push notification sent successfully:', result);
      return { success: true, result, attempt };
    } catch (error) {
      console.error(`❌ Push notification attempt ${attempt} failed:`, error.message);
      
      // If it's the last attempt, return the error
      if (attempt === retries) {
        return { success: false, error: error.message, attempts: attempt };
      }
      
      // Wait before retry (exponential backoff)
      const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
      console.log(`⏳ Waiting ${delay}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

// Send push notification to multiple recipients
const sendBulkPushNotifications = async (subscriptions, payload) => {
  const results = [];
  
  for (const subscription of subscriptions) {
    try {
      const result = await sendPushNotification(subscription, payload);
      results.push({ subscription, result });
    } catch (error) {
      results.push({ subscription, result: { success: false, error: error.message } });
    }
  }
  
  return results;
};

module.exports = { sendPushNotification, sendBulkPushNotifications };
