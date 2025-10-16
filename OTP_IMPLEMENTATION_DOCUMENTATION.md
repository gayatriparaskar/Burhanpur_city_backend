# OTP Implementation for Business Registration

This document explains the complete OTP (One-Time Password) implementation for business registration with WhatsApp Business API integration.

## 🎯 **Overview**

The OTP system provides secure phone number verification for business registration with the following features:
- 6-digit random OTP generation
- Secure hashing and storage
- WhatsApp Business API integration
- Rate limiting and attempt tracking
- Automatic expiration (5 minutes)
- Business registration flow integration

## 📁 **File Structure**

```
src/
├── models/
│   └── OTP.js                    # OTP data model
├── controllers/
│   ├── OTPController.js          # OTP logic and WhatsApp integration
│   └── BussinessController.js    # Updated with OTP verification
├── routes/
│   └── OTPRouter.js              # OTP API routes
└── middleware/
    └── upload.js                 # File upload handling
```

## 🔧 **API Endpoints**

### **1. Generate and Send OTP**
- **Endpoint**: `POST /api/otp/generate`
- **Content-Type**: `application/json`
- **Authentication**: Not required
- **Body**:
  ```json
  {
    "phone": "9876543210",
    "purpose": "business_registration"
  }
  ```

### **2. Verify OTP**
- **Endpoint**: `POST /api/otp/verify`
- **Content-Type**: `application/json`
- **Authentication**: Not required
- **Body**:
  ```json
  {
    "phone": "9876543210",
    "otp": "123456",
    "purpose": "business_registration"
  }
  ```

### **3. Resend OTP**
- **Endpoint**: `POST /api/otp/resend`
- **Content-Type**: `application/json`
- **Authentication**: Not required
- **Body**:
  ```json
  {
    "phone": "9876543210",
    "purpose": "business_registration"
  }
  ```

### **4. Check OTP Status**
- **Endpoint**: `GET /api/otp/status?phone=9876543210&purpose=business_registration`
- **Authentication**: Not required

### **5. Create Business with OTP Verification**
- **Endpoint**: `POST /api/bussiness/registerBussWithOTP`
- **Content-Type**: `multipart/form-data`
- **Authentication**: Not required
- **Body**: All business fields + phone + otp

## 📝 **Request Examples**

### **Using Postman**

#### **1. Generate OTP**
1. **Method**: `POST`
2. **URL**: `http://localhost:5000/api/otp/generate`
3. **Body Type**: `raw` (JSON)
4. **Body**:
   ```json
   {
     "phone": "9876543210",
     "purpose": "business_registration"
   }
   ```

#### **2. Verify OTP**
1. **Method**: `POST`
2. **URL**: `http://localhost:5000/api/otp/verify`
3. **Body Type**: `raw` (JSON)
4. **Body**:
   ```json
   {
     "phone": "9876543210",
     "otp": "123456",
     "purpose": "business_registration"
   }
   ```

#### **3. Create Business with OTP**
1. **Method**: `POST`
2. **URL**: `http://localhost:5000/api/bussiness/registerBussWithOTP`
3. **Body Type**: `form-data`
4. **Fields**:
   ```
   name: "My Business"
   category: "CATEGORY_ID"
   subCategory: "SUBCATEGORY_ID"
   owner: "USER_ID"
   phone: "9876543210"
   otp: "123456"
   description: "Business description"
   address: "Business address"
   profileImage: [Select image file]
   ```

### **Using cURL**

#### **Generate OTP**
```bash
curl -X POST http://localhost:5000/api/otp/generate \
  -H "Content-Type: application/json" \
  -d '{"phone": "9876543210", "purpose": "business_registration"}'
```

#### **Verify OTP**
```bash
curl -X POST http://localhost:5000/api/otp/verify \
  -H "Content-Type: application/json" \
  -d '{"phone": "9876543210", "otp": "123456", "purpose": "business_registration"}'
```

#### **Create Business with OTP**
```bash
curl -X POST http://localhost:5000/api/bussiness/registerBussWithOTP \
  -F "name=My Business" \
  -F "category=CATEGORY_ID" \
  -F "subCategory=SUBCATEGORY_ID" \
  -F "owner=USER_ID" \
  -F "phone=9876543210" \
  -F "otp=123456" \
  -F "description=Business description" \
  -F "profileImage=@/path/to/image.jpg"
```

## 📋 **Response Format**

### **Success Responses**

#### **OTP Generated Successfully**
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

#### **OTP Verified Successfully**
```json
{
  "success": true,
  "message": "OTP verified successfully",
  "data": {
    "phone": "9876543210",
    "purpose": "business_registration",
    "verifiedAt": "2024-01-01T12:03:00.000Z"
  }
}
```

#### **Business Created with OTP**
```json
{
  "success": true,
  "message": "Business submitted for approval",
  "data": {
    "_id": "64a1b2c3d4e5f6789012349",
    "name": "My Business",
    "phone": "9876543210",
    "approvalStatus": "pending",
    "isActive": false,
    "createdAt": "2024-01-01T12:00:00.000Z"
  }
}
```

### **Error Responses**

#### **Invalid Phone Number**
```json
{
  "success": false,
  "message": "Valid 10-digit phone number is required"
}
```

#### **OTP Expired**
```json
{
  "success": false,
  "message": "OTP not found or expired. Please request a new OTP."
}
```

#### **Invalid OTP**
```json
{
  "success": false,
  "message": "Invalid OTP. 2 attempts remaining"
}
```

#### **Max Attempts Reached**
```json
{
  "success": false,
  "message": "Maximum OTP attempts reached. Please request a new OTP."
}
```

## 🔧 **Environment Variables**

Add these to your `.env` file:

```env
# WhatsApp Business API Configuration
WHATSAPP_API_URL=https://graph.facebook.com/v18.0
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_ACCESS_TOKEN=your_access_token
WHATSAPP_TEMPLATE_NAME=otp_verification

# Database (existing)
MONGODB_URI=your_mongodb_connection_string
```

## 📱 **WhatsApp Template Setup**

### **1. Create WhatsApp Business Account**
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app and add WhatsApp Business API
3. Get your Phone Number ID and Access Token

### **2. Create OTP Message Template**
1. Go to WhatsApp Business Manager
2. Create a new message template with the following content:

**Template Name**: `otp_verification`
**Category**: `UTILITY`
**Language**: `English`
**Template Content**:
```
Your OTP for business registration is: {{1}}

This OTP is valid for 5 minutes. Do not share this OTP with anyone.

If you did not request this OTP, please ignore this message.
```

### **3. Template Approval**
- Submit the template for approval
- Wait for Facebook's approval (usually 24-48 hours)
- Once approved, you can use it in production

## 🔍 **Frontend Implementation Examples**

### **React.js Implementation**

```jsx
import React, { useState } from 'react';

const BusinessRegistration = () => {
  const [step, setStep] = useState(1); // 1: Phone, 2: OTP, 3: Business Form
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [businessData, setBusinessData] = useState({});

  // Step 1: Send OTP
  const sendOTP = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/otp/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phone, 
          purpose: 'business_registration' 
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setStep(2);
        alert('OTP sent to your WhatsApp!');
      } else {
        alert('Error: ' + data.message);
      }
    } catch (error) {
      alert('Error sending OTP');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const verifyOTP = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phone, 
          otp, 
          purpose: 'business_registration' 
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setStep(3);
        alert('OTP verified successfully!');
      } else {
        alert('Error: ' + data.message);
      }
    } catch (error) {
      alert('Error verifying OTP');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Create Business
  const createBusiness = async (formData) => {
    setLoading(true);
    try {
      const response = await fetch('/api/bussiness/registerBussWithOTP', {
        method: 'POST',
        body: formData // FormData with all business fields + phone + otp
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('Business registered successfully!');
        setStep(1); // Reset
      } else {
        alert('Error: ' + data.message);
      }
    } catch (error) {
      alert('Error creating business');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="business-registration">
      {step === 1 && (
        <div>
          <h2>Enter Phone Number</h2>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="9876543210"
            maxLength="10"
          />
          <button onClick={sendOTP} disabled={loading}>
            {loading ? 'Sending...' : 'Send OTP'}
          </button>
        </div>
      )}

      {step === 2 && (
        <div>
          <h2>Enter OTP</h2>
          <p>OTP sent to WhatsApp: {phone}</p>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="123456"
            maxLength="6"
          />
          <button onClick={verifyOTP} disabled={loading}>
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
          <button onClick={() => setStep(1)}>Change Phone</button>
        </div>
      )}

      {step === 3 && (
        <div>
          <h2>Business Registration Form</h2>
          {/* Your business form here */}
          <BusinessForm onSubmit={createBusiness} phone={phone} otp={otp} />
        </div>
      )}
    </div>
  );
};

export default BusinessRegistration;
```

### **Vue.js Implementation**

```vue
<template>
  <div class="business-registration">
    <!-- Step 1: Phone Number -->
    <div v-if="step === 1">
      <h2>Enter Phone Number</h2>
      <input
        v-model="phone"
        type="tel"
        placeholder="9876543210"
        maxlength="10"
      />
      <button @click="sendOTP" :disabled="loading">
        {{ loading ? 'Sending...' : 'Send OTP' }}
      </button>
    </div>

    <!-- Step 2: OTP Verification -->
    <div v-if="step === 2">
      <h2>Enter OTP</h2>
      <p>OTP sent to WhatsApp: {{ phone }}</p>
      <input
        v-model="otp"
        type="text"
        placeholder="123456"
        maxlength="6"
      />
      <button @click="verifyOTP" :disabled="loading">
        {{ loading ? 'Verifying...' : 'Verify OTP' }}
      </button>
      <button @click="step = 1">Change Phone</button>
    </div>

    <!-- Step 3: Business Form -->
    <div v-if="step === 3">
      <h2>Business Registration Form</h2>
      <BusinessForm @submit="createBusiness" :phone="phone" :otp="otp" />
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      step: 1,
      phone: '',
      otp: '',
      loading: false
    }
  },
  methods: {
    async sendOTP() {
      this.loading = true;
      try {
        const response = await fetch('/api/otp/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            phone: this.phone, 
            purpose: 'business_registration' 
          })
        });
        
        const data = await response.json();
        
        if (data.success) {
          this.step = 2;
          alert('OTP sent to your WhatsApp!');
        } else {
          alert('Error: ' + data.message);
        }
      } catch (error) {
        alert('Error sending OTP');
      } finally {
        this.loading = false;
      }
    },

    async verifyOTP() {
      this.loading = true;
      try {
        const response = await fetch('/api/otp/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            phone: this.phone, 
            otp: this.otp, 
            purpose: 'business_registration' 
          })
        });
        
        const data = await response.json();
        
        if (data.success) {
          this.step = 3;
          alert('OTP verified successfully!');
        } else {
          alert('Error: ' + data.message);
        }
      } catch (error) {
        alert('Error verifying OTP');
      } finally {
        this.loading = false;
      }
    },

    async createBusiness(formData) {
      this.loading = true;
      try {
        const response = await fetch('/api/bussiness/registerBussWithOTP', {
          method: 'POST',
          body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
          alert('Business registered successfully!');
          this.step = 1; // Reset
        } else {
          alert('Error: ' + data.message);
        }
      } catch (error) {
        alert('Error creating business');
      } finally {
        this.loading = false;
      }
    }
  }
}
</script>
```

## 🎯 **High-Level Flow**

### **1. User Journey**
```
User enters phone number 
    ↓
Server generates 6-digit OTP
    ↓
OTP is hashed and stored in DB
    ↓
WhatsApp message sent with OTP
    ↓
User enters OTP
    ↓
Server verifies OTP
    ↓
Business registration proceeds
```

### **2. Security Features**
- OTP is hashed before storage
- Maximum 3 attempts per OTP
- 5-minute expiration
- Rate limiting (1 minute between requests)
- Automatic cleanup of expired OTPs

### **3. WhatsApp Integration**
- Uses approved message templates
- Business-initiated messages
- Template placeholders for OTP
- Error handling for API failures

## ⚠️ **Important Notes**

1. **WhatsApp Template**: Must be approved by Facebook before use
2. **Rate Limiting**: 1 minute between OTP requests
3. **Security**: OTPs are hashed and never stored in plain text
4. **Expiration**: OTPs expire after 5 minutes
5. **Attempts**: Maximum 3 attempts per OTP
6. **Cleanup**: Expired OTPs are automatically deleted

## 🔧 **Testing Checklist**

- [ ] Generate OTP for valid phone number
- [ ] Verify OTP with correct code
- [ ] Test invalid OTP handling
- [ ] Test max attempts limit
- [ ] Test OTP expiration
- [ ] Test rate limiting
- [ ] Test WhatsApp message delivery
- [ ] Test business creation with OTP
- [ ] Test error handling
- [ ] Test resend functionality

## 🚀 **Quick Start**

1. **Set up environment variables** for WhatsApp API
2. **Create and approve WhatsApp template**
3. **Test OTP generation** endpoint
4. **Test OTP verification** endpoint
5. **Test business creation** with OTP
6. **Implement frontend** using the examples
7. **Test complete flow** end-to-end

The OTP system is now ready for business registration! 🎉
