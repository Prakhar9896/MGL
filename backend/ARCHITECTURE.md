# System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           FRONTEND (Next.js)                            │
│                      http://localhost:3000                              │
└──────────────────────────────┬──────────────────────────────────────────┘
                               │
                               │ HTTP/HTTPS
                               │ JSON
                               │
┌──────────────────────────────▼──────────────────────────────────────────┐
│                        BACKEND (Express + TypeScript)                   │
│                         http://localhost:5000                           │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │                      Middleware Layer                          │   │
│  │  ┌──────────┐  ┌──────────────┐  ┌─────────────────┐          │   │
│  │  │   CORS   │  │ Clerk Auth   │  │  Error Handler  │          │   │
│  │  └──────────┘  └──────────────┘  └─────────────────┘          │   │
│  └────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │                         Routes Layer                           │   │
│  │                                                                 │   │
│  │   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │   │
│  │   │ User Routes  │  │ Game Routes  │  │  List Routes │       │   │
│  │   │  /api/users  │  │ /api/games   │  │/api/gamelists│       │   │
│  │   └──────────────┘  └──────────────┘  └──────────────┘       │   │
│  │                                                                 │   │
│  │              ┌────────────────────────┐                        │   │
│  │              │ Friendship Routes      │                        │   │
│  │              │ /api/friendships       │                        │   │
│  │              └────────────────────────┘                        │   │
│  └────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │                      Controllers Layer                         │   │
│  │                                                                 │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐              │   │
│  │  │   User     │  │   Game     │  │ Game List  │              │   │
│  │  │ Controller │  │ Controller │  │ Controller │              │   │
│  │  └────────────┘  └────────────┘  └────────────┘              │   │
│  │                                                                 │   │
│  │              ┌────────────────────────┐                        │   │
│  │              │ Friendship Controller  │                        │   │
│  │              └────────────────────────┘                        │   │
│  └────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │                        Models Layer                            │   │
│  │                     (Mongoose Schemas)                         │   │
│  │                                                                 │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐   │   │
│  │  │   User   │  │   Game   │  │GameList  │  │ Friendship │   │   │
│  │  │  Model   │  │  Model   │  │  Model   │  │   Model    │   │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └────────────┘   │   │
│  └────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└──────────────────┬───────────────────────────────┬────────────────────┘
                   │                               │
                   │                               │
         ┌─────────▼──────────┐         ┌─────────▼─────────┐
         │   MongoDB          │         │  GiantBomb API    │
         │   Database         │         │  (External)       │
         │                    │         │                   │
         │  - users           │         │  - Game Search    │
         │  - games           │         │  - Game Details   │
         │  - gamelists       │         │  - Trending       │
         │  - friendships     │         │                   │
         └────────────────────┘         └───────────────────┘


┌──────────────────────────────────────────────────────────────────────┐
│                          External Services                           │
│                                                                       │
│  ┌─────────────────────────────┐  ┌───────────────────────────┐    │
│  │   Clerk Authentication      │  │   GiantBomb API           │    │
│  │   - User Sign Up/Login      │  │   - Game Database         │    │
│  │   - JWT Token Generation    │  │   - Game Search           │    │
│  │   - User Management         │  │   - Game Metadata         │    │
│  └─────────────────────────────┘  └───────────────────────────┘    │
└──────────────────────────────────────────────────────────────────────┘


═══════════════════════════════════════════════════════════════════════
                            DATA FLOW EXAMPLES
═══════════════════════════════════════════════════════════════════════

Example 1: Adding a Game to Your List
───────────────────────────────────────

1. Frontend sends: POST /api/gamelists/me/games
   {
     "giantBombId": 12345,
     "status": "playing"
   }

2. Middleware: Verifies Clerk token → Extracts user ID

3. Controller: 
   - Checks if game exists in DB
   - If not, fetches from GiantBomb API
   - Saves game to DB
   - Adds to user's game list

4. Response: Returns updated game list


Example 2: Friend Request Flow
───────────────────────────────

1. User A: POST /api/friendships/request
   { "recipientId": "user_b_id" }

2. Creates Friendship document: 
   { requester: userA, recipient: userB, status: "pending" }

3. User B views: GET /api/friendships/me/requests
   Shows User A's request

4. User B accepts: PUT /api/friendships/accept/:id

5. Updates:
   - Friendship status → "accepted"
   - User A's friends array ← User B
   - User B's friends array ← User A


Example 3: Game Search & Caching
─────────────────────────────────

1. User searches: GET /api/games/search?query=zelda

2. Controller sends request to GiantBomb API

3. Returns results to user

4. If user adds game to list:
   - Game data is cached in MongoDB
   - Future lookups use cached data
   - Reduces API calls


═══════════════════════════════════════════════════════════════════════
                         AUTHENTICATION FLOW
═══════════════════════════════════════════════════════════════════════

┌─────────┐        ┌────────┐        ┌─────────┐       ┌──────────┐
│Frontend │        │ Clerk  │        │ Backend │       │ MongoDB  │
└────┬────┘        └───┬────┘        └────┬────┘       └────┬─────┘
     │                 │                   │                 │
     │ Sign In Request │                   │                 │
     ├────────────────>│                   │                 │
     │                 │                   │                 │
     │  JWT Token      │                   │                 │
     │<────────────────┤                   │                 │
     │                 │                   │                 │
     │ API Request + Token                 │                 │
     ├─────────────────┼──────────────────>│                 │
     │                 │                   │                 │
     │                 │ Verify Token      │                 │
     │                 │<──────────────────┤                 │
     │                 │                   │                 │
     │                 │ Token Valid       │                 │
     │                 ├──────────────────>│                 │
     │                 │                   │                 │
     │                 │                   │ Query User Data │
     │                 │                   ├────────────────>│
     │                 │                   │                 │
     │                 │                   │ User Data       │
     │                 │                   │<────────────────┤
     │                 │                   │                 │
     │                Response with Data   │                 │
     │<────────────────┼───────────────────┤                 │
     │                 │                   │                 │


═══════════════════════════════════════════════════════════════════════
                        TECHNOLOGY STACK
═══════════════════════════════════════════════════════════════════════

┌──────────────────────────────────────────────────────────────────┐
│                         BACKEND STACK                            │
│                                                                   │
│  Runtime:        Node.js (v18+)                                 │
│  Language:       TypeScript (5.9.3)                             │
│  Framework:      Express.js (5.2.1)                             │
│  Database:       MongoDB + Mongoose (9.1.3)                     │
│  Auth:           Clerk (@clerk/express 1.7.62)                  │
│  HTTP Client:    Axios (1.13.2)                                 │
│  CORS:           cors (2.8.5)                                   │
│  Environment:    dotenv (17.2.3)                                │
│  Dev Tools:      Nodemon, ts-node                               │
│                                                                   │
│  External APIs:  - Clerk Auth API                               │
│                  - GiantBomb Games API                           │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘


═══════════════════════════════════════════════════════════════════════
                         DATABASE SCHEMA
═══════════════════════════════════════════════════════════════════════

MongoDB Database: gamelist-db
│
├─ users
│  ├─ clerkId (unique, indexed)
│  ├─ email (unique)
│  ├─ username (unique)
│  ├─ profileImage
│  ├─ bio
│  ├─ friends [ObjectId ref: User]
│  └─ timestamps
│
├─ games
│  ├─ giantBombId (unique, indexed)
│  ├─ name
│  ├─ description
│  ├─ imageUrl
│  ├─ releaseDate
│  ├─ platforms []
│  ├─ genres []
│  ├─ developers []
│  ├─ publishers []
│  ├─ apiData
│  └─ timestamps
│
├─ gamelists
│  ├─ user (ref: User, unique, indexed)
│  ├─ games []
│  │  ├─ game (ref: Game)
│  │  ├─ status (enum: playing/completed/wishlist/dropped)
│  │  ├─ rating (0-10)
│  │  ├─ review
│  │  ├─ hoursPlayed
│  │  ├─ startedAt
│  │  ├─ completedAt
│  │  └─ addedAt
│  └─ timestamps
│
└─ friendships
   ├─ requester (ref: User)
   ├─ recipient (ref: User)
   ├─ status (enum: pending/accepted/rejected)
   ├─ timestamps
   └─ compound index: (requester, recipient)


═══════════════════════════════════════════════════════════════════════
```
