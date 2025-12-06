# Railway Deployment Guide

## Step 1: Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub (easiest option)
3. Authorize Railway to access your GitHub account

## Step 2: Deploy Backend
1. Click "New Project" on Railway dashboard
2. Select "Deploy from GitHub repo"
3. Connect your GitHub account
4. Search and select `hemanshu2116/tic-tac-toe`
5. Select `server` as the root directory (important!)
6. Railway will auto-detect `Procfile` and deploy

## Step 3: Get Your Backend URL
1. After deployment, go to "Deployments"
2. Find your active deployment
3. Copy the URL (looks like: `https://your-app-production.up.railway.app`)
4. Note: Railway automatically assigns a port, you don't need `:5001`

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
   - Value: `https://your-railway-url` (from Step 3)
3. Redeploy by pushing a change to GitHub or clicking "Trigger deploy"

## Testing
- **Local**: http://localhost:3000
- **Production**: Your Netlify URL
- **Multiplayer**: Should work on both!

## Notes
- Railway gives you free hours monthly (enough for testing)
- Both backend and frontend auto-deploy when you push to GitHub
- If backend goes down, Railway auto-restarts it
