const express = require('express');
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
const productrouter = require('./src/routes/productRoutes")
const planRoutes = require("./src/routes/PlanRouter")


dotenv.config();
const app = express();
connectDB();
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

app.use('/api/Product',productrouter);



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


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});