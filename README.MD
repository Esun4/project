# Mind Mapping Web Application

A full-stack web application that allows users to create, save, and revisit interactive mind maps. The project emphasizes clean data flow, user-specific persistence, and a modular architecture, with AI-assisted features to help users discover meaningful connections within their mind maps.

---

## Features

- **Interactive Mind Map Editor**
  - Drag-and-drop node creation and edge connections
  - Undo/redo support and real-time editing
  - Customizable visual layout

- **User Authentication & Sessions**
  - Secure user signup and login
  - Session-based authentication using cookies
  - Protected routes for user-specific data access

- **Persistent Storage**
  - Mind maps are saved to a PostgreSQL database
  - Each mind map is associated with a specific user
  - Mind map structure stored as structured JSON data

- **Dashboard**
  - Displays all saved mind maps for the authenticated user
  - Click-to-open previously saved projects
  - Clear separation between dashboard and editor views

- **AI-Assisted Insights**
  - Optional AI service that analyzes node relationships
  - Suggests meaningful connections between ideas
  - Designed as a modular service for future expansion

- **Dockerized Development Environment**
  - Consistent setup across machines
  - Separate services for frontend, backend, database, and AI service
  - Simplified local development and testing

---

## Tech Stack

**Frontend**
- React
- React Router
- React Flow (@xyflow)
- CSS

**Backend**
- Node.js
- Express
- PostgreSQL
- express-session
- bcrypt

**Infrastructure**
- Docker
- Docker Compose
- RESTful API architecture

**AI (Optional Service)**
- Python-based similarity analysis service

---

## System Architecture
- React Frontend -> Node.js / Express API -> PostgreSQL Database

- Authentication is handled via server-side sessions
- User identity is determined from the session, not client input
- Mind map data is transmitted as JSON and persisted per user

---

## Authentication Flow

1. User signs up or logs in
2. Backend creates a session and stores user ID server-side
3. Session cookie is sent automatically with future requests
4. API routes validate the session before accessing or modifying data

---

## Data Persistence

- Mind maps are stored in a `mindmaps` table
- Each record contains:
  - User ID (ownership)
  - Title
  - Mind map data (nodes, edges, configuration) stored as JSON
- Only the owning user can access or modify their data

---

## Running the Project Locally

Ensure Docker and Docker Compose are installed on your machine.

```bash
docker compose up --build
```

Once everything is runnning open your browser and navigate to:

http://localhost:5173
