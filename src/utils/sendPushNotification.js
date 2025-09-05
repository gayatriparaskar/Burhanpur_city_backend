const webpush = require('web-push');

// Configure web-push
webpush.setVapidDetails(
  process.env.VAPID_SUBJECT || 'mailto:your-email@example.com',
  process.env.VAPID_PUBLIC_KEY || 'your-public-key',
  process.env.VAPID_PRIVATE_KEY || 'your-private-key'
);

const sendPushNotification = async (subscription, payload) => {
  try {
    const result = await webpush.sendNotification(subscription, JSON.stringify(payload));
    console.log('Push notification sent successfully:', result);
    return { success: true, result };
  } catch (error) {
    console.error('Error sending push notification:', error);
    return { success: false, error: error.message };
  }
};

module.exports = { sendPushNotification };
