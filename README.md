# Uddog — Backend

**Small actions. Shared impact.**

Uddog (উদ্যোগ) is a community-driven social development and event management platform that encourages people to participate in meaningful activities and create positive changes in their communities.

This repository contains the backend REST API for Uddog, built with Express.js and MongoDB. It handles event management, event registrations, and authenticated user operations.

## 🚀 Live Demo

- **Frontend:** [Uddog](https://uddog-client-wheat.vercel.app/)
- **Backend API:** [Uddog Server](https://uddog-server.onrender.com)
- **Frontend Repository:** [uddog-client](https://github.com/Soha-Tabassom-Supre/uddog-client)

## ✨ Features

- RESTful API built with Express.js.
- MongoDB integration for persistent data storage.
- Retrieve upcoming events sorted by event date.
- Retrieve featured upcoming events.
- Create, update, and delete events.
- View events created by the authenticated user.
- Register for upcoming events.
- Cancel event registrations.
- View events joined by the authenticated user.
- Prevent duplicate event registrations.
- Validate event data, dates, locations, and image URLs.
- Verify authentication using Better Auth JWT and JOSE.
- Restrict event modifications to their creators.
- Automatically remove registrations when an event is deleted.

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
│   ├── middleware/
│   │   └── requireAuth.js
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

**Important:** Never commit your `.env` file or expose database credentials or authentication secrets in your repository.

### 5. Run the Server


npm start


The backend should be available at:


http://localhost:5000


## 🔗 API Documentation

The backend provides the following event management endpoints.

**Base URL (Local):**


http://localhost:5000/api/events


**Base URL (Production):**


https://uddog-server.onrender.com/api/events


### Event Endpoints

| Method | Endpoint | Description | Authentication |
|---|---|---|---|
| GET | `/api/events` | Retrieve upcoming events | No |
| GET | `/api/events/featured` | Retrieve up to 6 featured upcoming events | No |
| GET | `/api/events/my-events` | Retrieve events created by the current user | Required |
| GET | `/api/events/joined` | Retrieve events joined by the current user | Required |
| GET | `/api/events/:id` | Retrieve a specific event | No |
| POST | `/api/events` | Create a new event | Required |
| PATCH | `/api/events/:id` | Update an existing event | Required |
| DELETE | `/api/events/:id` | Delete an event | Required |

### Event Registration Endpoints

| Method | Endpoint | Description | Authentication |
|---|---|---|---|
| POST | `/api/events/:id/register` | Register for an event | Required |
| DELETE | `/api/events/:id/register` | Cancel event registration | Required |

### Creating an Event

**Endpoint:**


POST /api/events


**Request Body:**


{
  "title": "Community Clean-up Day",
  "description": "Join us to make our community cleaner.",
  "category": "Environment",
  "imageUrl": "https://example.com/event-image.jpg",
  "location": {
    "division": "Khulna",
    "city": "Jashore",
    "area": "Sadar",
    "address": "Example location"
  },
  "eventDate": "2027-01-15T09:00:00.000Z"
}


The event date must be in the future, and all required fields must contain valid values.

### Updating an Event

**Endpoint:**


PATCH /api/events/:id


Allows the event creator to update valid event fields.

Only the event creator can update their event.

### Deleting an Event

**Endpoint:**


DELETE /api/events/:id


Only the event creator can delete an event.

Associated event registrations are also removed when the event is deleted.

### Registering for an Event

**Endpoint:**


POST /api/events/:id/register


An authenticated user can register for an upcoming event.

The API prevents duplicate registrations and updates the event's participant count.

### Cancelling Registration

**Endpoint:**


DELETE /api/events/:id/register


Allows an authenticated user to cancel their registration. The participant count is updated accordingly.

## 🔐 Authentication & Authorization

Uddog uses Better Auth for frontend authentication and JWT-based authentication for backend API protection.

The backend uses JOSE to verify JWT tokens through the Better Auth JWKS endpoint.

The authentication process works as follows:

1. Users authenticate through the frontend using Better Auth.
2. Better Auth provides a JWT token.
3. The frontend sends the token with requests to protected API endpoints.
4. The backend verifies the token using JOSE and the Better Auth JWKS endpoint.
5. If the token is valid, the authenticated user's information is attached to the request.
6. Protected routes allow the request to continue.

The backend also checks event ownership before allowing users to update or delete events.

## 🗄️ Database

Uddog uses MongoDB for data storage.

The backend works with the following collections:

- **events:** Stores event information, creator details, event dates, locations, and participant counts.
- **eventRegistrations:** Stores event registration records, including event IDs, user IDs, and registration timestamps.

The MongoDB connection is managed through a dedicated configuration module.

## ⚠️ Error Handling & Validation

The API includes validation and error handling for common situations, including:

- Invalid event IDs.
- Missing or invalid event information.
- Invalid image URLs.
- Invalid or past event dates.
- Events that do not exist.
- Duplicate event registrations.
- Unauthorized event modifications.
- Missing authentication.
- Database or server errors.

Appropriate HTTP status codes are returned to indicate the result of each request.

## 🌐 Deployment

The backend is deployed on Render.

**Production URL:** [https://uddog-server.onrender.com](https://uddog-server.onrender.com)

Deployment configuration:

- **Build Command:** `npm install`
- **Start Command:** `npm start`

Configure all required environment variables in the Render dashboard before deployment.

## 🔗 Related Repository

- **Frontend:** [Uddog Client](https://github.com/Soha-Tabassom-Supre/uddog-client)



Developed as part of a Social Development Events Platform project.

**Uddog — Small actions. Shared impact.**