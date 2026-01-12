# Quick Setup Guide

## 🚀 Quick Start (5 minutes)

### Step 1: Install Dependencies
```bash
cd backend
npm install
```

### Step 2: Set Up MongoDB

**Option A: Local MongoDB**
```bash
# Install MongoDB locally or use Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

**Option B: MongoDB Atlas (Recommended)**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free cluster
3. Get connection string
4. Whitelist your IP address

### Step 3: Get Clerk Keys
1. Go to https://dashboard.clerk.com
2. Create new application
3. Copy `Publishable Key` and `Secret Key`
4. Add `http://localhost:3000` to allowed origins

### Step 4: Get GiantBomb API Key
1. Go to https://www.giantbomb.com/api
2. Sign up/Login
3. Get your API key from profile

### Step 5: Configure Environment
```bash
cp .env.example .env
```

Edit `.env` file with your credentials:
```env
PORT=5000
NODE_ENV=development

MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/gamelist-db
# OR for local: mongodb://localhost:27017/gamelist-db

CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx

GIANTBOMB_API_KEY=your_api_key_here

FRONTEND_URL=http://localhost:3000
```

### Step 6: Start Development Server
```bash
npm start
```

Server will run on `http://localhost:5000`

### Step 7: Test the API
```bash
# Health check
curl http://localhost:5000/health

# Search games (no auth required)
curl "http://localhost:5000/api/games/search?query=zelda"
```

---

## 🧪 Testing with Clerk

### Get Authentication Token:

1. Set up Clerk in your frontend
2. Login with Clerk
3. Get session token from Clerk
4. Use in API requests:

```bash
curl -H "Authorization: Bearer YOUR_CLERK_TOKEN" \
  http://localhost:5000/api/users/me/profile
```

---

## 📁 Project Structure Overview

```
backend/
├── src/
│   ├── config/          # Database configuration
│   ├── controller/      # Business logic (4 controllers)
│   ├── middleware/      # Auth & error handling
│   ├── model/          # MongoDB schemas (4 models)
│   ├── routes/         # API routes (4 route files)
│   ├── types/          # TypeScript types
│   └── index.ts        # Main server entry
├── .env               # Your environment variables (create this)
├── .env.example       # Template
└── package.json
```

---

## ✅ Verification Checklist

- [ ] MongoDB is running and accessible
- [ ] Clerk application created
- [ ] GiantBomb API key obtained
- [ ] `.env` file created with all credentials
- [ ] Dependencies installed (`npm install`)
- [ ] Server starts without errors (`npm start`)
- [ ] Health check returns 200 OK
- [ ] Can search games without authentication
- [ ] Can authenticate with Clerk

---

## 🐛 Common Issues

### MongoDB Connection Error
```
Error: MONGODB_URI is not defined
```
**Solution:** Make sure `.env` file exists and has `MONGODB_URI`

### Clerk Authentication Fails
```
Error: Unauthorized
```
**Solution:** 
1. Verify Clerk keys in `.env`
2. Ensure token is valid and not expired
3. Check Clerk dashboard for application status

### GiantBomb API Error
```
Error: GiantBomb API key not configured
```
**Solution:** Add `GIANTBOMB_API_KEY` to `.env` file

### Port Already in Use
```
Error: Port 5000 already in use
```
**Solution:** Change `PORT` in `.env` or kill process using port 5000

---

## 📚 Next Steps

1. **Test all endpoints** using Postman or Thunder Client
2. **Set up Clerk webhooks** for user creation
3. **Add more game data sources** if needed
4. **Implement rate limiting** for production
5. **Add Redis caching** for better performance
6. **Set up logging** with Winston or similar

---

## 🔗 Resources

- [Clerk Documentation](https://clerk.com/docs)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [GiantBomb API Docs](https://www.giantbomb.com/api/documentation)
- [Express.js Guide](https://expressjs.com/)
- [Mongoose Docs](https://mongoosejs.com/)

---

## 💡 Tips

- Use MongoDB Compass to visualize your data
- Use Thunder Client or Postman for API testing
- Check logs for detailed error messages
- Keep your API keys secure and never commit `.env`
- Use environment-specific configs for production

---

Need help? Check the [README.md](./README.md) and [API_DOCS.md](./API_DOCS.md) for detailed information!
