# ConnectHub — Real-Time MERN Chat Application

A full-stack real-time chat application built with the **MERN stack** and **Socket.IO**. It uses a clean **MVC architecture** on the backend, JWT authentication with HTTP-only cookies, private and group conversations, typing indicators, and read receipts.

## Features

- **Authentication** — register, login, logout, and session restore with JWT stored in an HTTP-only cookie
- **Private chats** — start a one-to-one conversation with any registered user
- **Group chats** — create groups with a name, multiple members, and an admin
- **Real-time messaging** — Socket.IO rooms deliver messages instantly
- **Typing indicators** — see when other participants are typing
- **Read receipts** — single check for sent, double check for read
- **User search** — find people by name or email
- **Responsive UI** — works on desktop and mobile
- **MVC backend** — models, controllers, routes, middleware, and services kept separate
- **ES Module backend** — every backend source and script uses native Node.js `import`/`export`

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 18, Vite, React Router, Axios, Socket.IO Client |
| Backend | Node.js ES Modules, Express, Socket.IO |
| Database | MongoDB, Mongoose |
| Auth | JWT, bcryptjs, HTTP-only cookies |
| Styling | Hand-written CSS (no UI framework) |

## Getting Started

### Prerequisites

- Node.js 20.19 or newer
- No database installation needed for the quick start — the backend can run with a temporary in-memory MongoDB

### Quick start (recommended)

You need **two terminals**.

**Terminal 1 — backend**

```bash
cd server
npm install
npm run dev:memory
```

`npm run dev:memory` starts a temporary in-memory MongoDB and the API at `http://localhost:5000`. Data resets when you stop the process.

**Terminal 2 — frontend**

```bash
cd client
npm install
npm run dev
```

Open `http://localhost:5173`. Vite proxies `/api` and `/socket.io` to the backend in development.

### Using a real MongoDB (optional)

Create `server/.env` from `server/.env.example` and set your values:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/connecthub
JWT_SECRET=replace-this-with-a-long-random-string
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

Then start the backend normally:

```bash
cd server
npm run dev
```

### Production frontend configuration

Set these Vite variables when the frontend and backend use different hosts:

```env
VITE_API_URL=https://your-api.com/api
VITE_SOCKET_URL=https://your-api.com
```

The backend `CLIENT_URL` accepts a comma-separated list of allowed frontend origins.

## API Reference

All routes except `register`, `login`, and `logout` require the `token` cookie or an `Authorization: Bearer <token>` header.

### Auth

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/api/auth/register` | Create an account |
| POST | `/api/auth/login` | Log in and set the cookie |
| POST | `/api/auth/logout` | Clear the cookie |
| GET | `/api/auth/me` | Get the current user |

### Users

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/users/search?q=` | Search users by name or email |
| PATCH | `/api/users/profile` | Update name, about, or avatar |

### Conversations

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/conversations` | List the current user's conversations |
| POST | `/api/conversations` | Get or create a private chat (`userId`) |
| POST | `/api/conversations/group` | Create a group (`name`, `userIds[]`) |
| GET | `/api/conversations/:id` | Get one conversation |
| PUT | `/api/conversations/:id/rename` | Rename a group (admin) |
| PUT | `/api/conversations/:id/add` | Add a member (admin) |
| PUT | `/api/conversations/:id/remove` | Remove a member or leave |

### Messages

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/api/messages` | Send a message (`conversationId`, `content`) |
| GET | `/api/messages/:conversationId?page=1&limit=50` | Paginated message history |
| PUT | `/api/messages/:conversationId/read` | Mark messages as read |

## Data Models

**User** — `name`, `email` (unique), `password` (bcrypt hashed, `select: false`), `avatar`, `about`

**Conversation** — `participants[]`, `isGroup`, `groupName`, `groupAdmin`, `lastMessage`

**Message** — `conversation`, `sender`, `content`, `readBy[]`, timestamps

## Security Notes

- Passwords are hashed with bcrypt (12 rounds) and never returned by the API.
- JWTs are stored in `httpOnly` cookies, which are not accessible to JavaScript.
- Production cookies use `sameSite: none` and `secure`; serve the app over HTTPS.
- Every conversation and message route verifies that the current user is a participant.
- User search input is escaped before being used in a regular expression.
