const {
  errorResponse,
  successResponse,
} = require("../helpers/successAndError");
const PlanModel = require("../models/Plan");
const UpiOrderModel = require("../models/upiOrderModel");
const UserModel = require("../models/User");
const { createRazorpayOrder } = require("../utility/razorpay-gateway");
const ShortUniqueId = require("short-unique-id");
require("dotenv").config();

const uid = new ShortUniqueId({ length: 10 });

module.exports.createPlanOrder = async (req, res) => {
  try {
    const userId = req.userId;
    const {
      planId,
      successUrl = "https://burhancity.vercel.app/success",
      failedUrl = "https://burhancity.vercel.app/failure",
    } = req.body;

    const plan = await PlanModel.findById(planId);
    if (!plan) throw new Error("Invalid plan id");

    const user = await UserModel.findById(userId);
    if (!user) throw new Error("User not found");

    const amount = parseInt(plan.offerPrice || plan.price);
    const upiId = uid.rnd();

    const upiOrder = new UpiOrderModel({
      orderId: upiId,
      user: userId,
      plan: planId,
      planName: plan.name,
      price: plan.price,
      amount,
      gateway: "razorpay",
    });
    await upiOrder.save();

    const orderId = `plan-${upiOrder._id}`;
    const order = await createRazorpayOrder(
      amount,
      orderId,
      user.email,
      user.phone,
      user.name,
      successUrl,
      failedUrl
    );
    if (!order) throw new Error("Failed to create Razorpay order");

    res.status(200).json(successResponse(200, "Order created", order));
  } catch (error) {
    console.error(error);
    res.status(500).json(errorResponse(500, error.message));
  }
};

module.exports.activatePlanWebhook = async (req, res) => {
  try {
    const data = req.body.payload.payment.entity;
    const upiOrderId = data.notes.orderId.split("-")[1];
    const orderPrefix = data.notes.orderId.split("-")[0];

    if (orderPrefix !== "plan") throw new Error("Invalid order type");

    const order = await UpiOrderModel.findOneAndUpdate(
      { _id: upiOrderId },
      { $set: { status: "success" } },
      { new: true }
    );
    if (!order) throw new Error("Order not found");

    const updatedUser = await UserModel.findOneAndUpdate(
      { _id: order.user },
      {
        $set: {
          planId: order.plan,
          planName: order.planName,
          paymentDone: true,
          paymentDoneOn: new Date(),
          lastPaymentAmount: order.amount,
          paymentMethod: order.gateway,
        },
      },
      { new: true }
    );

    return res.status(200).json({ status: "OK" });
  } catch (error) {
    console.error(error.message);
    res.status(500).json(errorResponse(500, error.message));
  }
};
