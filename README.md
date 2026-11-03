# Uddog — Backend

**Small actions. Shared impact.**

Uddog (উদ্যোগ) is a community-driven social development and event management platform that encourages people to participate in meaningful activities and create positive changes in their communities.

This repository contains the backend REST API for Uddog. It is built with Express.js and MongoDB and uses Better Auth JWT authentication to protect authorized API routes.

## 🚀 Live Demo

- **Frontend:** [Uddog](https://uddog-client-wheat.vercel.app/)
- **Backend API:** [Uddog Server](https://uddog-server.onrender.com)
- **Frontend Repository:** [uddog-client](https://github.com/Soha-Tabassom-Supre/uddog-client)

## ✨ Features

- RESTful API built with Express.js.
- MongoDB integration for data storage.
- Event retrieval and management endpoints.
- Upcoming events retrieval with date-based filtering.
- Featured events retrieval.
- Individual event details using event IDs.
- Better Auth JWT-based authentication for protected routes.
- JWT verification using JOSE.
- CORS configuration for frontend-backend communication.
- Environment-based configuration.

## 🛠️ Technology Stack

- **Runtime:** Node.js
- **Backend Framework:** Express.js
- **Database:** MongoDB
- **Authentication:** Better Auth
- **JWT Verification:** JOSE
- **Deployment:** Render

## 📁 Project Structure


uddog-server/
│
├── src/
│   ├── config/
│   │   └── mongodb.js
│   │
│   ├── routes/
│   │   └── events.js
│   │
│   └── ...
│
├── .env
├── .gitignore
├── package.json
└── README.md


## ⚙️ Installation & Setup

Follow these steps to run the backend locally.

### 1. Clone the Repository


git clone https://github.com/Soha-Tabassom-Supre/uddog-server.git


### 2. Navigate to the Project Directory


cd uddog-server


### 3. Install Dependencies


npm install


### 4. Configure Environment Variables

Create a `.env` file in the root directory.

.env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
DB_NAME=uddog
BETTER_AUTH_URL=http://localhost:3000


Replace the placeholder values with your actual configuration.

**Important:** Never commit your `.env` file or expose database credentials and authentication secrets in your repository.

### 5. Run the Server


npm start


The backend should now be running at:


http://localhost:5000


## 🔗 API Endpoints

The following endpoints are currently available:

| Method | Endpoint | Description | Authentication |
|---|---|---|---|
| GET | `/` | Check the server response | No |
| GET | `/api/health` | Check server health | No |
| GET | `/api/events` | Retrieve upcoming events | No |
| GET | `/api/events/featured` | Retrieve featured events | No |
| GET | `/api/events/:id` | Retrieve a specific event by ID | No |

### Example Requests

**Get Upcoming Events**

GET /api/events


**Get Featured Events**


GET /api/events/featured


**Get Event Details**


GET /api/events/:id


**Check Server Health**


GET /api/health

## 🔐 Authentication

Uddog uses Better Auth for authentication on the frontend.

The backend verifies JWT tokens issued through Better Auth before allowing access to protected API routes.

The authentication flow works as follows:

1. A user authenticates through the frontend using Better Auth.
2. Better Auth issues a JWT token.
3. The frontend includes the token when making requests to protected backend endpoints.
4. The backend verifies the token using JOSE and the Better Auth JWKS endpoint.
5. If the token is valid, the request is allowed to continue.
6. If authentication is missing or invalid, the backend rejects the request.

## 🗄️ Database

Uddog uses MongoDB as its database.

The MongoDB connection is configured separately and uses environment variables to manage the database connection securely.

The database name is configurable through the `DB_NAME` environment variable.

## 🌐 Deployment

The backend is deployed on Render.

**Live Backend:** [https://uddog-server.onrender.com](https://uddog-server.onrender.com)

Deployment configuration:

- **Build Command:** `npm install`
- **Start Command:** `npm start`

Make sure to configure the required environment variables in the Render dashboard before deploying.

## 🔗 Related Repository

Frontend repository: [Uddog Client](https://github.com/Soha-Tabassom-Supre/uddog-client)


Developed as part of a Social Development Events Platform project.

**Uddog — Small actions. Shared impact.**