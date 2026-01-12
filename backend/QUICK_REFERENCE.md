# 🎮 Game List API - Quick Reference Card

## 🚀 Start Server
```bash
cd backend
npm start
```
Server: `http://localhost:5000`

---

## ⚡ Quick Test Commands

### Health Check
```bash
curl http://localhost:5000/health
```

### Search Games (No Auth)
```bash
curl "http://localhost:5000/api/games/search?query=zelda&limit=5"
```

### Get Current User (With Auth)
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/users/me/profile
```

---

## 🔑 Environment Variables (.env)

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/gamelist-db
CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx
GIANTBOMB_API_KEY=your_api_key
FRONTEND_URL=http://localhost:3000
```

---

## 📍 Essential Endpoints

### Users
```
GET    /api/users/search?query=username
GET    /api/users/:userId
GET    /api/users/me/profile          🔒
PUT    /api/users/me/profile          🔒
```

### Games
```
GET    /api/games/search?query=name
GET    /api/games/trending
GET    /api/games/giantbomb/:id
```

### Game Lists
```
GET    /api/gamelists/me/list         🔒
POST   /api/gamelists/me/games        🔒
PUT    /api/gamelists/me/games/:id    🔒
DELETE /api/gamelists/me/games/:id    🔒
GET    /api/gamelists/me/stats        🔒
```

### Friends
```
GET    /api/friendships/me/friends    🔒
GET    /api/friendships/me/requests   🔒
POST   /api/friendships/request       🔒
PUT    /api/friendships/accept/:id    🔒
DELETE /api/friendships/remove/:id    🔒
```

🔒 = Requires Authentication

---

## 📦 Request Body Examples

### Add Game to List
```json
POST /api/gamelists/me/games
{
  "giantBombId": 12345,
  "status": "playing",
  "rating": 8,
  "review": "Great game!",
  "hoursPlayed": 10
}
```

### Update Game Status
```json
PUT /api/gamelists/me/games/:gameId
{
  "status": "completed",
  "rating": 9,
  "hoursPlayed": 50
}
```

### Send Friend Request
```json
POST /api/friendships/request
{
  "recipientId": "user_id_here"
}
```

---

## 🎯 Game Status Values

- `playing` - Currently playing
- `completed` - Finished
- `wishlist` - Want to play
- `dropped` - Started but stopped

---

## 🔍 Query Parameters

### Game Lists
```
?status=playing           # Filter by status
?status=completed        # Show completed games
```

### Game Search
```
?query=zelda             # Search term
?limit=10                # Results limit
```

---

## ✅ Response Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Server Error

---

## 🐛 Common Issues & Fixes

### MongoDB Connection Error
```
Check: MONGODB_URI in .env
Fix: Ensure MongoDB is running
```

### Authentication Failed
```
Check: Clerk keys in .env
Fix: Verify token is valid
```

### Port Already in Use
```
Fix: Change PORT in .env
Or: Kill process on port 5000
```

---

## 📊 Project Structure (Quick View)

```
backend/src/
├── model/          # 4 MongoDB schemas
├── controller/     # 4 controllers
├── routes/         # 4 route files
├── middleware/     # Auth & errors
├── config/         # Database
└── index.ts        # Main server
```

---

## 🔧 Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm start

# Check TypeScript errors
npx tsc --noEmit

# Format code (if prettier installed)
npm run format
```

---

## 📚 Documentation Files

- `README.md` - Overview
- `SETUP.md` - Setup guide
- `API_DOCS.md` - API reference
- `PROJECT_SUMMARY.md` - Implementation details
- `postman_collection.json` - API tests

---

## 🎓 Key Features

✅ User Management
✅ Clerk Authentication
✅ Game Search (GiantBomb API)
✅ Game Lists (4 statuses)
✅ Ratings & Reviews
✅ Friend System
✅ Statistics Dashboard
✅ TypeScript
✅ MongoDB + Mongoose
✅ Error Handling
✅ CORS Enabled

---

## 💡 Quick Tips

1. Import Postman collection for easy testing
2. Use MongoDB Compass to view data
3. Check console logs for errors
4. Keep .env file secure
5. Test public endpoints first
6. Then test protected endpoints with auth

---

## 🔗 Important Links

- Clerk Dashboard: https://dashboard.clerk.com
- MongoDB Atlas: https://cloud.mongodb.com
- GiantBomb API: https://www.giantbomb.com/api

---

## 📞 API Base URL

```
Development: http://localhost:5000/api
Production: YOUR_DEPLOYMENT_URL/api
```

---

**Quick Start: Install → Configure .env → Start Server → Test!** 🚀
