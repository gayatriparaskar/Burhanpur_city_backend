# Meta WhatsApp Cloud API Setup Guide

## 🎯 **Why Choose Meta Cloud API for OTP**

### **Perfect for Your Use Case:**
- ✅ **Low Volume**: OTP messages are infrequent
- ✅ **Simple Integration**: Direct API calls
- ✅ **Cost Effective**: Free tier covers your needs
- ✅ **Fast Setup**: 1-2 days vs weeks with BSP
- ✅ **Template Management**: Direct control over message templates

## 🚀 **Step-by-Step Setup**

### **Step 1: Create Facebook App**

1. **Go to [Facebook Developers](https://developers.facebook.com/)**
2. **Click "Create App"**
3. **Select "Business" as app type**
4. **Fill in app details:**
   ```
   App Name: Burhanpur City OTP System
   App Contact Email: your-email@domain.com
   Business Use Case: Customer Authentication
   ```

### **Step 2: Add WhatsApp Product**

1. **In your app dashboard, click "Add Product"**
2. **Find "WhatsApp" and click "Set up"**
3. **You'll see the WhatsApp configuration page**

### **Step 3: Get Your Credentials**

1. **Phone Number ID:**
   - Go to WhatsApp > API Setup
   - Copy your Phone Number ID (starts with numbers)

2. **Access Token:**
   - Click "Generate Token" 
   - Copy the temporary token
   - **Important**: This is temporary! You'll need a permanent token later

3. **Webhook URL (for receiving messages):**
   ```
   https://yourdomain.com/api/whatsapp/webhook
   ```

### **Step 4: Create OTP Message Template**

1. **Go to WhatsApp > Message Templates**
2. **Click "Create Template"**
3. **Fill in template details:**

   ```
   Template Name: otp_verification
   Category: UTILITY
   Language: English (US)
   
   Header: None
   
   Body: 
   Your OTP for business registration is: {{1}}
   
   This OTP is valid for 5 minutes. Do not share this OTP with anyone.
   
   If you did not request this OTP, please ignore this message.
   
   Footer: Burhanpur City
   ```

4. **Submit for approval**
5. **Wait for approval (24-48 hours)**

### **Step 5: Update Environment Variables**

Add these to your `.env` file:

```env
# Meta WhatsApp Cloud API Configuration
WHATSAPP_API_URL=https://graph.facebook.com/v18.0
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id_here
WHATSAPP_ACCESS_TOKEN=your_permanent_access_token_here
WHATSAPP_TEMPLATE_NAME=otp_verification
WHATSAPP_WEBHOOK_VERIFY_TOKEN=your_webhook_verify_token
```

### **Step 6: Get Permanent Access Token**

1. **Go to WhatsApp > API Setup**
2. **Click "Generate Token"**
3. **Select your Facebook Page**
4. **Copy the permanent token**
5. **Update your .env file**

## 🔧 **Updated OTP Controller for Meta Cloud API**

Your existing implementation is already perfect! Here's a quick verification:

```javascript
// Your current implementation in OTPController.js is already optimized for Meta Cloud API
const sendWhatsAppOTP = async (phone, otp) => {
  try {
    const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL || 'https://graph.facebook.com/v18.0';
    const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
    const WHATSAPP_TEMPLATE_NAME = process.env.WHATSAPP_TEMPLATE_NAME || 'otp_verification';

    // This is exactly what Meta Cloud API expects! ✅
    const messageData = {
      messaging_product: 'whatsapp',
      to: `+91${phone}`, // Format: +91XXXXXXXXXX
      type: 'template',
      template: {
        name: WHATSAPP_TEMPLATE_NAME,
        language: { code: 'en' },
        components: [{
          type: 'body',
          parameters: [{ type: 'text', text: otp }]
        }]
      }
    };

    const response = await fetch(`${WHATSAPP_API_URL}/${WHATSAPP_PHONE_NUMBER_ID}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(messageData)
    });

    return await response.json();
  } catch (error) {
    throw new Error(`WhatsApp API error: ${error.message}`);
  }
};
```

## 📱 **Testing Your Implementation**

### **Test OTP Generation:**
```bash
curl -X POST http://localhost:5000/api/otp/generate \
  -H "Content-Type: application/json" \
  -d '{"phone": "9876543210", "purpose": "business_registration"}'
```

### **Expected Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "data": {
    "phone": "9876543210",
    "purpose": "business_registration",
    "expiresAt": "2024-01-01T12:05:00.000Z",
    "messageId": "wamid.xxx"
  }
}
```

## 💰 **Cost Analysis**

### **Meta Cloud API Pricing:**
- **Free Tier**: 1,000 conversations/month
- **After Free Tier**: $0.005 per conversation
- **Your OTP Use Case**: ~100-500 OTPs/month = **FREE**

### **BSP Pricing (for comparison):**
- **Setup Fee**: $500-2000
- **Monthly Fee**: $100-500
- **Per Message**: $0.01-0.05
- **Your OTP Use Case**: $200-1000/month

## 🎯 **Why Meta Cloud API Wins for Your Use Case**

| Factor | Meta Cloud API | BSP |
|--------|----------------|-----|
| **Setup Time** | 1-2 days | 1-2 weeks |
| **Monthly Cost** | $0 (free tier) | $200-1000 |
| **Technical Complexity** | Low | High |
| **Maintenance** | None | High |
| **Scalability** | Automatic | Manual |
| **Template Management** | Direct | Through BSP |

## 🚀 **Next Steps**

1. **Create Facebook App** (30 minutes)
2. **Add WhatsApp Product** (15 minutes)
3. **Create OTP Template** (15 minutes)
4. **Get Credentials** (10 minutes)
5. **Update .env file** (5 minutes)
6. **Test OTP flow** (15 minutes)

**Total Setup Time: ~2 hours vs 2 weeks with BSP**

## ✅ **Final Recommendation**

**Choose Meta Cloud API because:**
- ✅ Perfect for OTP use case
- ✅ Free tier covers your needs
- ✅ Faster setup and implementation
- ✅ Lower maintenance overhead
- ✅ Your code is already optimized for it
- ✅ Direct control over templates and messages

**BSP would be overkill for OTP verification and add unnecessary complexity and cost.**
