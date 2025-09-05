# Render Deployment Guide

## Steps to Deploy on Render

1. **Commit all changes to your repository:**
   ```bash
   git add .
   git commit -m "Fix deployment issues"
   git push origin main
   ```

2. **In Render Dashboard:**
   - Go to your service settings
   - Set Build Command: `npm install`
   - Set Start Command: `npm start`
   - Set Environment: `Node`
   - Set Node Version: `18.20.8`

3. **Environment Variables to set in Render:**
   - `NODE_ENV=production`
   - `PORT=10000` (or let Render assign automatically)
   - `MONGODB_URI=your_mongodb_connection_string`
   - `JWT_SECRET=your_jwt_secret`
   - `JWT_EXPIRE=2h`
   - `SALT_ROUNDS=10`
   - `RAZORPAY_KEY_ID_TEST=your_razorpay_key`
   - `RAZORPAY_KEY_SECRET_TEST=your_razorpay_secret`
   - Any other environment variables your app needs

4. **Deploy:**
   - Click "Deploy" in Render dashboard
   - Monitor the build logs for any errors

## Common Issues Fixed:
- ✅ Added proper start script to package.json
- ✅ Fixed .gitignore to not ignore package-lock.json
- ✅ Added render.yaml configuration
- ✅ Added .nvmrc for Node version consistency
