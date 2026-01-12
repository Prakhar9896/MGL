# API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
Protected endpoints require Clerk authentication token in headers:
```
Authorization: Bearer <clerk_token>
```

---

## 📍 Users API

### Search Users
```http
GET /users/search?query=username
```
**Response:**
```json
[
  {
    "_id": "string",
    "username": "string",
    "profileImage": "string",
    "bio": "string"
  }
]
```

### Get User Profile
```http
GET /users/:userId
```
**Response:**
```json
{
  "_id": "string",
  "clerkId": "string",
  "email": "string",
  "username": "string",
  "profileImage": "string",
  "bio": "string",
  "friends": [],
  "createdAt": "date",
  "updatedAt": "date"
}
```

### Get Current User (Protected)
```http
GET /users/me/profile
```

### Update Profile (Protected)
```http
PUT /users/me/profile
```
**Body:**
```json
{
  "username": "string",
  "bio": "string",
  "profileImage": "string"
}
```

---

## 🎮 Games API

### Search Games
```http
GET /games/search?query=game_name&limit=10
```
**Response:**
```json
[
  {
    "giantBombId": 12345,
    "name": "Game Name",
    "description": "Game description",
    "imageUrl": "https://...",
    "releaseDate": "2024-01-01",
    "platforms": ["PC", "PS5"]
  }
]
```

### Get Trending Games
```http
GET /games/trending?limit=20
```

### Get Game by GiantBomb ID
```http
GET /games/giantbomb/:id
```
Fetches from GiantBomb API and caches in database.

### Get Game from Database
```http
GET /games/:id
```
Returns game from local database.

---

## 📋 Game Lists API (All Protected)

### Get Current User's Game List
```http
GET /gamelists/me/list?status=playing
```
**Query Params:**
- `status` (optional): `playing`, `completed`, `wishlist`, `dropped`

**Response:**
```json
{
  "user": "userId",
  "games": [
    {
      "game": {
        "_id": "string",
        "name": "Game Name",
        "imageUrl": "string",
        ...
      },
      "status": "playing",
      "rating": 8,
      "review": "Great game!",
      "hoursPlayed": 25,
      "startedAt": "date",
      "addedAt": "date"
    }
  ],
  "totalGames": 42,
  "byStatus": {
    "playing": 5,
    "completed": 30,
    "wishlist": 7,
    "dropped": 0
  }
}
```

### Get User's Game List (Public)
```http
GET /gamelists/user/:userId?status=completed
```

### Add Game to List
```http
POST /gamelists/me/games
```
**Body:**
```json
{
  "giantBombId": 12345,
  "status": "playing",
  "rating": 8,
  "review": "Amazing game!",
  "hoursPlayed": 10
}
```

### Update Game in List
```http
PUT /gamelists/me/games/:gameId
```
**Body:**
```json
{
  "status": "completed",
  "rating": 9,
  "review": "Updated review",
  "hoursPlayed": 50
}
```

### Remove Game from List
```http
DELETE /gamelists/me/games/:gameId
```

### Get Game Statistics
```http
GET /gamelists/me/stats
```
**Response:**
```json
{
  "totalGames": 42,
  "playing": 5,
  "completed": 30,
  "wishlist": 7,
  "dropped": 0,
  "totalHoursPlayed": 1250,
  "averageRating": 8.5,
  "recentlyCompleted": []
}
```

---

## 👥 Friendships API (All Protected)

### Get Current User's Friends
```http
GET /friendships/me/friends
```
**Response:**
```json
[
  {
    "_id": "string",
    "username": "string",
    "profileImage": "string",
    "bio": "string"
  }
]
```

### Get User's Friends (Public)
```http
GET /friendships/user/:userId
```

### Get Pending Friend Requests
```http
GET /friendships/me/requests
```
**Response:**
```json
{
  "received": [
    {
      "_id": "friendshipId",
      "requester": {
        "username": "string",
        "profileImage": "string"
      },
      "status": "pending",
      "createdAt": "date"
    }
  ],
  "sent": []
}
```

### Check Friendship Status
```http
GET /friendships/status/:userId
```
**Response:**
```json
{
  "status": "accepted", // or "pending", "rejected", "none"
  "isRequester": true,
  "friendshipId": "string"
}
```

### Send Friend Request
```http
POST /friendships/request
```
**Body:**
```json
{
  "recipientId": "userId"
}
```

### Accept Friend Request
```http
PUT /friendships/accept/:friendshipId
```

### Reject Friend Request
```http
PUT /friendships/reject/:friendshipId
```

### Remove Friend
```http
DELETE /friendships/remove/:friendId
```

---

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (not authenticated)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Server Error

## Game Status Values

- `playing` - Currently playing
- `completed` - Finished the game
- `wishlist` - Want to play
- `dropped` - Started but didn't finish

## Friendship Status Values

- `pending` - Request sent, awaiting response
- `accepted` - Friends
- `rejected` - Request declined

---

## Example Usage

### Adding a game to your list:
```javascript
// 1. Search for a game
const games = await fetch('/api/games/search?query=Zelda');

// 2. Add to your list
await fetch('/api/gamelists/me/games', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${clerkToken}`
  },
  body: JSON.stringify({
    giantBombId: games[0].giantBombId,
    status: 'playing',
    rating: 9
  })
});
```

### Sending a friend request:
```javascript
// 1. Search for user
const users = await fetch('/api/users/search?query=john');

// 2. Send request
await fetch('/api/friendships/request', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${clerkToken}`
  },
  body: JSON.stringify({
    recipientId: users[0]._id
  })
});
```
