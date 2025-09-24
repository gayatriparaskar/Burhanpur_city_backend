const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./src/config/database');
const morgan = require("morgan");

// Routes
const userRouter = require ('./src/routes/UserRouter');
const BussinessRouter = require("./src/routes/BussinessRouter");
const categoryRoutes = require('./src/routes/CategoryRouter');
const subcategoryRoutes = require('./src/routes/SubCategoryRouter');
const jobRoutes = require('./src/routes/JobRouter');

const advertisementRoutes = require('./src/routes/AdvertisementRouter');
const planRoutes = require("./src/routes/PlanRouter");
const productRouter = require("./src/routes/ProductRouter"); // ✅ adjust path if needed
const DashRouter = require('./src/routes/DashRoute');
const BookingRouter = require('./src/routes/BookingRouter'); // Booking routes
const saveSubscriptionRoute = require('./src/routes/saveSubscription'); // Push notification subscription
const conversationRoutes = require('./src/routes/ConversationRouter'); // Conversation routes
const messageRoutes = require('./src/routes/MessageRouter'); // Message routes
const notificationRoutes = require('./src/routes/NotificationRouter'); // Notification routes




dotenv.config();
const app = express();
connectDB();

// Create HTTP server
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(morgan('dev'));

// // Routes
app.use("/api/Users",userRouter);
app.use("/api/bussiness",BussinessRouter);
app.use('/api/category', categoryRoutes);
app.use('/api/subcategory', subcategoryRoutes);
app.use('/api/jobs', jobRoutes);

app.use('/api/plan', planRoutes);
// app.use('/api/advertisements', advertisementRoutes
app.use('/api/advertisements', advertisementRoutes);
app.use("/api/plan", planRoutes);
app.use("/api/dashboard", DashRouter);
app.use("/api/product", productRouter); // ✅ mount router here
app.use("/api/bookings",BookingRouter); // Booking routes
app.use('/api/save-subscription', saveSubscriptionRoute); // Push notification subscription
app.use('/api/conversations', conversationRoutes); // Conversation routes
app.use('/api/messages', messageRoutes); // Message routes
app.use('/api/notifications', notificationRoutes); // Notification routes


// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: err.message,
  });
});

app.get("/", async (req, res) => {
    
      res.status(200).json({
        success: "Hello from the server",
        message: "Server is running perfectly",
      });

});


// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Socket handler (will be created)
const { socketHandler } = require('./src/socket/socketHandler');
socketHandler(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Socket.IO server initialized`);
});