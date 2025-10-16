/**
 * Test script to demonstrate OTP flow for business registration
 * Run this script to test the complete OTP implementation
 */

const fetch = require('node-fetch'); // Install with: npm install node-fetch

const BASE_URL = 'http://localhost:5000/api';
const TEST_PHONE = '9876543210';

async function testOTPFlow() {
  console.log('🚀 Testing OTP Flow for Business Registration\n');

  try {
    // Step 1: Generate OTP
    console.log('📱 Step 1: Generating OTP...');
    const generateResponse = await fetch(`${BASE_URL}/otp/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: TEST_PHONE,
        purpose: 'business_registration'
      })
    });

    const generateData = await generateResponse.json();
    console.log('✅ OTP Generated:', generateData);

    if (!generateData.success) {
      throw new Error(`Failed to generate OTP: ${generateData.message}`);
    }

    // Step 2: Check OTP Status
    console.log('\n📊 Step 2: Checking OTP Status...');
    const statusResponse = await fetch(`${BASE_URL}/otp/status?phone=${TEST_PHONE}&purpose=business_registration`);
    const statusData = await statusResponse.json();
    console.log('✅ OTP Status:', statusData);

    // Step 3: Verify OTP (using a dummy OTP for testing)
    console.log('\n🔐 Step 3: Verifying OTP...');
    const verifyResponse = await fetch(`${BASE_URL}/otp/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: TEST_PHONE,
        otp: '123456', // This will fail in real scenario
        purpose: 'business_registration'
      })
    });

    const verifyData = await verifyResponse.json();
    console.log('❌ OTP Verification (Expected to fail):', verifyData);

    // Step 4: Test Business Creation with OTP
    console.log('\n🏢 Step 4: Testing Business Creation with OTP...');
    
    // Create FormData for business creation
    const FormData = require('form-data');
    const formData = new FormData();
    
    formData.append('name', 'Test Business');
    formData.append('category', '64a1b2c3d4e5f6789012349'); // Replace with actual category ID
    formData.append('subCategory', '64a1b2c3d4e5f6789012349'); // Replace with actual subcategory ID
    formData.append('owner', '64a1b2c3d4e5f6789012349'); // Replace with actual user ID
    formData.append('phone', TEST_PHONE);
    formData.append('otp', '123456');
    formData.append('description', 'Test business description');
    formData.append('address', 'Test address');

    const businessResponse = await fetch(`${BASE_URL}/bussiness/registerBussWithOTP`, {
      method: 'POST',
      body: formData
    });

    const businessData = await businessResponse.json();
    console.log('❌ Business Creation (Expected to fail):', businessData);

    console.log('\n✅ OTP Flow Test Completed!');
    console.log('\n📝 Notes:');
    console.log('- OTP generation should work if WhatsApp API is configured');
    console.log('- OTP verification will fail with dummy OTP (expected)');
    console.log('- Business creation will fail without valid OTP (expected)');
    console.log('- Replace dummy IDs with actual category/user IDs for real testing');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
if (require.main === module) {
  testOTPFlow();
}

module.exports = { testOTPFlow };
