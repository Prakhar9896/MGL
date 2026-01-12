# Game List Backend API

A complete backend API for a gaming list website similar to Letterboxd and MyAnimeList, built with Express, TypeScript, MongoDB, and Clerk authentication.

## Features

- ✅ **User Management**: User profiles, authentication via Clerk
- ✅ **Game Lists**: Track games as playing, completed, wishlist, or dropped
- ✅ **Game Database**: Integration with GiantBomb API for game data
- ✅ **Friend System**: Send, accept, and manage friend requests
- ✅ **Reviews & Ratings**: Rate games and write reviews
- ✅ **Statistics**: Track gaming statistics and progress

## Tech Stack

- **Node.js** with **TypeScript**
- **Express.js** - Web framework
- **MongoDB** with **Mongoose** - Database
- **Clerk** - Authentication
- **GiantBomb API** - Game data

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.ts           # MongoDB connection
│   ├── controller/
│   │   ├── userController.ts     # User management
│   │   ├── gameController.ts     # Game data from GiantBomb
│   │   ├── gameListController.ts # Game list management
│   │   └── friendshipController.ts # Friend system
│   ├── middleware/
│   │   ├── auth.ts               # Clerk authentication
│   │   └── errorHandler.ts       # Error handling
│   ├── model/
│   │   ├── User.ts               # User schema
│   │   ├── Game.ts               # Game schema
│   │   ├── GameList.ts           # Game list schema
│   │   └── Friendship.ts         # Friendship schema
│   ├── routes/
│   │   ├── userRoutes.ts
│   │   ├── gameRoutes.ts
│   │   ├── gameListRoutes.ts
│   │   └── friendshipRoutes.ts
│   └── index.ts                  # Main server file
├── .env.example
├── package.json
└── tsconfig.json
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- Clerk account
- GiantBomb API key

### Installation

1. **Clone the repository** (if not already done)

2. **Install dependencies**:
   ```bash
   cd backend
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your credentials:
   - MongoDB URI
   - Clerk keys (from https://dashboard.clerk.com)
   - GiantBomb API key (from https://www.giantbomb.com/api)

4. **Start the server**:
   ```bash
   npm start
   ```

The server will run on `http://localhost:5000`

## API Endpoints

### Users

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/users/search?query=` | Search users by username | ❌ |
| GET | `/api/users/:userId` | Get user profile | ❌ |
| GET | `/api/users/me/profile` | Get current user | ✅ |
| PUT | `/api/users/me/profile` | Update profile | ✅ |
| DELETE | `/api/users/me/profile` | Delete account | ✅ |
| POST | `/api/users/webhook` | Clerk webhook | ❌ |

### Games

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/games/search?query=` | Search games | ❌ |
| GET | `/api/games/trending` | Get trending games | ❌ |
| GET | `/api/games/giantbomb/:id` | Get game by GiantBomb ID | ❌ |
| GET | `/api/games/:id` | Get game from database | ❌ |

### Game Lists

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/gamelists/user/:userId` | Get user's game list | ❌ |
| GET | `/api/gamelists/me/list` | Get current user's list | ✅ |
| GET | `/api/gamelists/me/stats` | Get gaming statistics | ✅ |
| POST | `/api/gamelists/me/games` | Add game to list | ✅ |
| PUT | `/api/gamelists/me/games/:gameId` | Update game entry | ✅ |
| DELETE | `/api/gamelists/me/games/:gameId` | Remove game from list | ✅ |

### Friendships

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/friendships/user/:userId` | Get user's friends | ❌ |
| GET | `/api/friendships/me/friends` | Get current user's friends | ✅ |
| GET | `/api/friendships/me/requests` | Get pending requests | ✅ |
| GET | `/api/friendships/status/:userId` | Check friendship status | ✅ |
| POST | `/api/friendships/request` | Send friend request | ✅ |
| PUT | `/api/friendships/accept/:friendshipId` | Accept request | ✅ |
| PUT | `/api/friendships/reject/:friendshipId` | Reject request | ✅ |
| DELETE | `/api/friendships/remove/:friendId` | Remove friend | ✅ |

## Data Models

### User
- Clerk ID (unique)
- Email
- Username
- Profile image
- Bio
- Friends array
- Timestamps

### Game
- GiantBomb ID (unique)
- Name
- Description
- Image URL
- Release date
- Platforms, genres, developers, publishers
- API data (cached)

### GameList
- User reference
- Games array with:
  - Game reference
  - Status (playing, completed, wishlist, dropped)
  - Rating (0-10)
  - Review
  - Hours played
  - Start/completion dates

### Friendship
- Requester & recipient references
- Status (pending, accepted, rejected)
- Timestamps

## Authentication

This API uses Clerk for authentication. Protected routes require a valid Clerk session token in the request headers.

To access protected endpoints:
1. Users must sign up/login via Clerk
2. Include the session token in requests
3. The middleware will verify and attach user info to `req.auth`

## Development

The project uses:
- **Nodemon** for hot reloading
- **TypeScript** for type safety
- **ESM modules** (type: "module")

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| PORT | Server port | No (default: 5000) |
| NODE_ENV | Environment mode | No (default: development) |
| MONGODB_URI | MongoDB connection string | Yes |
| CLERK_PUBLISHABLE_KEY | Clerk public key | Yes |
| CLERK_SECRET_KEY | Clerk secret key | Yes |
| GIANTBOMB_API_KEY | GiantBomb API key | Yes |
| FRONTEND_URL | Frontend URL for CORS | No (default: localhost:3000) |

## Error Handling

The API includes comprehensive error handling:
- 400: Bad Request (missing/invalid data)
- 401: Unauthorized (no auth)
- 403: Forbidden (insufficient permissions)
- 404: Not Found
- 500: Server Error

## Notes

- All timestamps are automatically managed by MongoDB
- GiantBomb API responses are cached in the database
- Friend lists are bidirectional (both users have each other as friends)
- Game statuses support full lifecycle tracking

## License

ISC
