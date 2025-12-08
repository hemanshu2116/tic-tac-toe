# Render.com Deployment Guide

## Step 1: Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up with GitHub (easiest option)
3. Authorize Render to access your GitHub account

## Step 2: Deploy Backend
1. Click "New +" on Render dashboard
2. Select "Web Service"
3. Connect your GitHub account
4. Search and select `hemanshu2116/tic-tac-toe`
5. Configure the service:
   - **Name**: `tic-tac-toe-server` (or any name you prefer)
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`
6. Click "Create Web Service"
7. Wait for deployment to complete (2-3 minutes)

## Step 3: Get Your Backend URL
1. After deployment, find your service URL at the top
2. Copy the URL (looks like: `https://tic-tac-toe-server.onrender.com`)
3. Note: Render automatically assigns the port, you don't need `:5001`

## Step 4: Deploy Frontend to Netlify
1. Go to [netlify.com](https://netlify.com)
2. Click "New site from Git"
3. Connect GitHub and select `hemanshu2116/tic-tac-toe`
4. Build settings:
   - Build command: `npm run build`
   - Publish directory: `build`
5. Click "Deploy site"

## Step 5: Add Environment Variable to Netlify
1. In Netlify dashboard, go to Site settings → Build & deploy → Environment
2. Add new variable:
   - Key: `REACT_APP_SOCKET_SERVER`
   - Value: `https://your-render-url.onrender.com` (from Step 3)
3. Redeploy by going to Deploys → Trigger deploy → Deploy site

## Testing
- **Local**: http://localhost:3000
- **Production**: Your Netlify URL
- **Multiplayer**: Should work on both!

## Important Notes
- **Free tier limitation**: Render services go to sleep after 15 minutes of inactivity
- **First connection**: May take 30-60 seconds to wake up (one-time delay)
- **Active sessions**: Stay awake while users are playing
- **Auto-deploy**: Both backend and frontend auto-deploy when you push to GitHub
- **No credit card required** for free tier

## Troubleshooting
- If connection fails, check browser console for the backend URL
- Verify environment variable is set correctly in Netlify
- Make sure backend service is running (green status) on Render dashboard

