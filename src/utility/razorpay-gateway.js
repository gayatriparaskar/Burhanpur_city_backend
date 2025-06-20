const Razorpay = require("razorpay");
require("dotenv").config();

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID_TEST,    
  key_secret: process.env.RAZORPAY_KEY_SECRET_TEST, 
});

module.exports.createRazorpayOrder = async (
  amount,
  orderId,
  email,
  phoneNumber,
  name,
  successUrl,
  failedUrl
) => {
  try {
    const response = await razorpayInstance.paymentLink.create({
      amount: Number(amount) * 100, 
      currency: "INR",
      reference_id: orderId,
      description: `BurhanpurCity Plan Purchase`,
      customer: {
        name: name,
        email: email,
        contact: phoneNumber,
      },
      notify: {
        sms: true,
        email: true,
      },
      reminder_enable: true,
      callback_url: successUrl,
      callback_method: "get",
      notes: {
        orderId,
        email,
        phoneNumber,
        name,
        successUrl,
        failedUrl,
      },
    });

    const order = {
      orderId,
      amount,
      upiLink: response.short_url,
      gateway: "razorpay",
    };

    return order;
  } catch (error) {
    console.error("Razorpay PaymentLink Error:", error);
    return false;
  }
};
