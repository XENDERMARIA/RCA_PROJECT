# RCA Management System

A web application that helps teams document, search, and learn from technical incidents using Root Cause Analysis (RCA) reports, with AI-powered assistance for solving future problems.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Folder and File Structure](#folder-and-file-structure)
3. [Step-by-Step Setup Guide](#step-by-step-setup-guide)
4. [How the Application Works](#how-the-application-works)
5. [Core Features and Functionalities](#core-features-and-functionalities)
6. [Example Walkthrough](#example-walkthrough)
7. [Screenshots](#screenshots)
8. [Error Handling and Safety](#error-handling-and-safety)
9. [Future Improvements](#future-improvements)
10. [Final Summary](#final-summary)

---

## Project Overview

### What Problem Does This Solve?

Every technical team faces incidents - servers crash, databases slow down, applications throw errors. When these problems happen, engineers fix them and move on. But here is the issue: **the same problems often happen again**, and teams end up solving the same issues repeatedly because no one documented what went wrong or how it was fixed.

This RCA Management System solves that problem by:

- Giving teams a structured way to document incidents (what happened, why it happened, how it was fixed)
- Building a searchable knowledge base of past incidents
- Using AI to suggest solutions when similar problems occur in the future

### Why is RCA Important?

Root Cause Analysis is not just about fixing problems - it is about **learning from them**. A good RCA answers three questions:

1. What were the symptoms? (What did we observe?)
2. What was the root cause? (Why did it really happen?)
3. How do we prevent it? (What changes will stop this from happening again?)

Without proper documentation, teams lose this knowledge when people leave or forget. This system makes sure that knowledge stays accessible.

### Who Can Use This System?

- **DevOps and SRE teams** - to document production incidents
- **Development teams** - to track and learn from bugs
- **IT support teams** - to build a knowledge base for troubleshooting
- **Students and learners** - to understand full-stack development with a practical project

---

## Folder and File Structure

Understanding the project structure helps you navigate the code quickly. Here is how everything is organized:

```
rca-system/
│
├── backend/                    # Server-side code (Node.js + Express)
│   ├── controllers/            # Business logic for each feature
│   │   ├── rcaController.js    # Handles RCA create, read, update, delete
│   │   ├── aiController.js     # Handles AI-assisted features
│   │   └── solverController.js # Handles the Problem Solver chatbot
│   │
│   ├── models/                 # Database schemas
│   │   └── RCA.js              # Defines what an RCA looks like in MongoDB
│   │
│   ├── routes/                 # API endpoint definitions
│   │   ├── rcaRoutes.js        # Routes for /api/rca/*
│   │   ├── aiRoutes.js         # Routes for /api/ai/*
│   │   └── solverRoutes.js     # Routes for /api/solver/*
│   │
│   ├── utils/                  # Helper utilities
│   │   └── seedData.js         # Script to populate sample data
│   │
│   ├── server.js               # Main entry point - starts the server
│   ├── package.json            # Backend dependencies
│   └── .env.example            # Template for environment variables
│
├── frontend/                   # Client-side code (React)
│   ├── src/
│   │   ├── components/         # Reusable UI pieces
│   │   │   ├── Layout.jsx      # Main layout with navigation
│   │   │   ├── SearchBar.jsx   # Search input component
│   │   │   └── AISuggestionBox.jsx # Displays AI suggestions
│   │   │
│   │   ├── pages/              # Full page components
│   │   │   ├── Dashboard.jsx   # Home page with stats
│   │   │   ├── CreateRCA.jsx   # Form to create new RCA
│   │   │   ├── RCAList.jsx     # Browse all RCAs
│   │   │   ├── RCADetails.jsx  # View single RCA
│   │   │   ├── EditRCA.jsx     # Edit existing RCA
│   │   │   └── ProblemSolver.jsx # AI chat and search
│   │   │
│   │   ├── services/           # API communication
│   │   │   └── api.js          # All backend API calls
│   │   │
│   │   ├── App.jsx             # Route definitions
│   │   ├── main.jsx            # React entry point
│   │   └── index.css           # Global styles (Tailwind)
│   │
│   ├── index.html              # HTML template
│   ├── package.json            # Frontend dependencies
│   ├── vite.config.js          # Vite bundler configuration
│   └── tailwind.config.js      # Tailwind CSS configuration
│
└── README.md                   # This file
```

### What Each Folder Does

**Backend Folders:**

| Folder | Purpose |
|--------|---------|
| `controllers/` | Contains the actual logic. When an API is called, the controller decides what to do - fetch data, save to database, call AI, etc. |
| `models/` | Defines the shape of your data. The RCA model says "an RCA has a title, symptoms, root cause, solution, etc." |
| `routes/` | Maps URLs to controllers. When someone visits `/api/rca`, the route file says "go to rcaController and run this function." |
| `utils/` | Helper scripts that are not part of the main app but useful for development, like seeding test data. |

**Frontend Folders:**

| Folder | Purpose |
|--------|---------|
| `components/` | Small, reusable pieces of UI. Things like buttons, search bars, and suggestion boxes that appear in multiple places. |
| `pages/` | Full screens that users see. Each page is a complete view like Dashboard, Create RCA, or Problem Solver. |
| `services/` | Handles communication with the backend. Instead of writing fetch calls everywhere, we centralize them here. |

---

## Step-by-Step Setup Guide

Follow these steps to run the project on your machine. I will explain each step so you understand what is happening.

### Prerequisites

Before starting, make sure you have:

- **Node.js** (version 18 or higher) - [Download here](https://nodejs.org/)
- **MongoDB** (local installation or MongoDB Atlas account) - [Download here](https://www.mongodb.com/try/download/community)
- **Git** - [Download here](https://git-scm.com/)
- **A code editor** (VS Code recommended)

To check if Node is installed, open your terminal and run:

```bash
node --version
```

You should see something like `v18.17.0` or higher.

### Step 1: Clone the Repository

First, get the code on your machine:

```bash
git clone <your-repository-url>
cd rca-system
```

### Step 2: Set Up the Backend

Navigate to the backend folder:

```bash
cd backend
```

Install the required packages:

```bash
npm install
```

This downloads all the libraries the backend needs (Express, Mongoose, etc.).

**Create the environment file:**

The backend needs some configuration that should not be in the code (like database passwords and API keys). Copy the example file:

```bash
cp .env.example .env
```

Now open `.env` in your editor and fill in the values:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Connection
# For local MongoDB:
MONGODB_URI=mongodb://localhost:27017/rca-system

# For MongoDB Atlas (cloud):
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/rca-system

# AI Configuration (Optional - app works without this)
# Get your key from: https://console.anthropic.com/
ANTHROPIC_API_KEY=your_api_key_here
```

**Important:** The AI features are optional. If you do not have an API key, the app will still work - it will just use database search instead of AI suggestions.

**Start MongoDB** (if using local installation):

```bash
# On Mac/Linux
mongod

# On Windows (run as administrator)
net start MongoDB
```

**Seed sample data** (optional but recommended):

This adds some example RCAs so you have data to work with:

```bash
npm run seed
```

**Start the backend server:**

```bash
npm run dev
```

You should see:

```
Connected to MongoDB
Server running on port 5000
AI Features: ENABLED (or DISABLED if no API key)
```

Leave this terminal running and open a new one for the frontend.

### Step 3: Set Up the Frontend

In a new terminal, navigate to the frontend folder:

```bash
cd rca-system/frontend
```

Install dependencies:

```bash
npm install
```

Start the React development server:

```bash
npm run dev
```

You should see:

```
VITE v5.0.10  ready in 500 ms

Local:   http://localhost:3000/
```

### Step 4: Open the Application

Open your browser and go to:

```
http://localhost:3000
```

You should see the RCA Dashboard. If you ran the seed script, you will see some sample data.

### Quick Reference - All Commands

```bash
# Backend (Terminal 1)
cd backend
npm install
cp .env.example .env      # Then edit .env with your values
npm run seed              # Optional: add sample data
npm run dev               # Start server

# Frontend (Terminal 2)
cd frontend
npm install
npm run dev               # Start React app
```

---

## How the Application Works

Let me walk you through what happens when you use the application. Understanding this flow will help you see how the frontend and backend work together.

### Flow 1: Viewing the Dashboard

```
User opens http://localhost:3000
        |
        v
React loads Dashboard.jsx
        |
        v
Dashboard calls api.js -> rcaService.getStats()
        |
        v
HTTP GET request to http://localhost:5000/api/rca/stats
        |
        v
Express routes to rcaController.getRCAStats()
        |
        v
Controller queries MongoDB using Mongoose
        |
        v
MongoDB returns aggregated statistics
        |
        v
Controller sends JSON response back
        |
        v
Dashboard receives data and renders charts
```

### Flow 2: Creating a New RCA

```
User fills out the Create RCA form
        |
        v
User clicks "Save RCA"
        |
        v
React calls api.js -> rcaService.create(formData)
        |
        v
HTTP POST request with RCA data to /api/rca
        |
        v
Express routes to rcaController.createRCA()
        |
        v
Controller validates data
        |
        v
Mongoose saves new document to MongoDB
        |
        v
Success response sent back
        |
        v
React shows success message and redirects to RCA list
```

### Flow 3: Using the Problem Solver

This is where it gets interesting. The Problem Solver helps users find solutions:

```
User describes their problem: "Database is slow"
        |
        v
React sends message to /api/solver/chat
        |
        v
solverController receives the message
        |
        v
Controller searches MongoDB for similar past RCAs
        |
        v
If AI is enabled:
|   Controller sends context + message to Claude API
|   AI analyzes past incidents and generates helpful response
|
If AI is disabled:
|   Controller returns database matches with basic guidance
        |
        v
Response sent back to React
        |
        v
Chat interface displays AI response
User can continue conversation or view suggested RCAs
```

### The Learning Cycle

The real power of this system is the feedback loop:

1. **Problem occurs** - User searches for solutions
2. **Solution found** - User applies the fix
3. **Problem solved** - User creates an RCA documenting the solution
4. **Knowledge grows** - Next time someone has a similar problem, the system suggests the solution

This cycle means the system gets smarter over time as more RCAs are added.

---

## Core Features and Functionalities

### 1. Dashboard

The dashboard gives you a quick overview of your RCA knowledge base:

- **Total RCA count** - How many incidents have been documented
- **Category breakdown** - Distribution across Server, Database, Network, App, Security, Other
- **Severity distribution** - How many Critical, High, Medium, Low issues
- **Recent RCAs** - Quick access to the latest documented incidents

The dashboard also has a prominent "Get Help" button that takes users to the Problem Solver.

### 2. Create RCA

The RCA creation form captures all the important information about an incident:

| Field | Purpose |
|-------|---------|
| Title | A brief description of what happened |
| Category | What type of system was affected |
| Symptoms | What did you observe? Error messages, behavior, metrics |
| Root Cause | Why did this really happen? (The underlying reason) |
| Solution | Step-by-step description of how it was fixed |
| Prevention | What changes will prevent this from happening again |
| Severity | How critical was this incident |
| Tags | Keywords for easier searching |

**AI Assistance during creation:**

While creating an RCA, the AI can help by:
- Finding similar past incidents (to avoid duplicates)
- Validating if your "root cause" is actually a root cause or just another symptom
- Suggesting improvements to your descriptions

### 3. Knowledge Base (RCA List)

This is your searchable library of all documented incidents:

- **Full-text search** - Search across titles, symptoms, causes, and solutions
- **Category filter** - Show only Database issues, or only Network issues
- **Severity filter** - Focus on critical incidents
- **Pagination** - Browse through large numbers of RCAs

Clicking on any RCA shows the full details.

### 4. RCA Details View

Shows complete information about a single incident:

- All fields from the RCA
- Creation date and author
- Tags for context
- Option to generate an AI summary for stakeholder reports
- Edit and delete options

### 5. Problem Solver (The Key Feature)

This is what makes this system more than just a documentation tool. The Problem Solver has two modes:

**Quick Search Mode:**
- User describes their problem in a text box
- System searches the knowledge base for matching incidents
- Shows relevant past RCAs with their solutions
- AI provides analysis of how well the matches fit

**Chat Mode:**
- Conversational interface with the AI assistant
- User can describe the problem naturally
- AI asks clarifying questions
- AI suggests solutions based on past incidents
- User can have a back-and-forth conversation to narrow down the issue

**The Feedback Loop:**

After getting help, users can:
- Mark a solution as helpful (positive feedback)
- Provide their own solution if the suggestions did not work
- Automatically create a new RCA from their solution (system learns)

---

## Example Walkthrough

Let me show you a realistic scenario of how this system would be used.

### Scenario: Production Database Slowdown

**Day 1: The Incident**

Your monitoring alerts fire at 2 PM. The production database is responding slowly, and users are complaining about timeouts.

After investigation, you find the issue: the connection pool was exhausted because a recent code change forgot to close database connections properly.

**Creating the RCA:**

You go to the RCA system and click "Create RCA":

```
Title: Production Database Connection Timeout
Category: Database
Severity: High

Symptoms:
- API response times increased from 200ms to 5000ms
- Monitoring showed "Connection timeout" errors
- Database connection count at maximum (100/100)
- Users reporting login failures

Root Cause:
Connection pool exhaustion due to unclosed connections in the 
user-service module. The code change in commit abc123 removed 
the connection.release() call from the error handling path.

Solution:
1. Identified the problematic code in user-service/db.js line 45
2. Added connection.release() to the catch block
3. Deployed hotfix to production
4. Restarted all service pods to clear stale connections
5. Verified connection count returned to normal (20/100)

Prevention:
- Added automated test for connection leaks
- Set up alert for connection pool > 80% utilization
- Added code review checklist item for connection handling

Tags: database, connection-pool, timeout, user-service
```

You save the RCA. It is now part of the knowledge base.

**Day 30: A Similar Problem**

A new team member sees similar symptoms: timeouts, slow responses. They go to the Problem Solver:

```
User: "Database connections timing out, very slow API responses"

AI Assistant: "I found a similar incident from last month. It was caused 
by connection pool exhaustion due to unclosed connections. 

Here are some diagnostic steps:
1. Check your connection pool metrics - is it near maximum?
2. Look for recent code changes in database handling
3. Check if any error paths might be missing connection.release()

Would you like me to show you the full RCA from the previous incident?"

User: "Yes please"

AI Assistant: [Shows the RCA details]

"Based on that incident, I would suggest:
1. First, check current connection count
2. If it is high, look for the same pattern - connections not being released
3. The solution last time was adding release() to error handlers

Does this match what you are seeing?"
```

The new team member can now solve the problem in minutes instead of hours, because the knowledge was documented and searchable.

---

## Screenshots

Below are placeholders for screenshots. Replace these with actual images from your running application.

### Dashboard

The main overview page showing statistics and recent activity.

![Dashboard Screenshot](./screenshots/Dashboard.png)

### Create RCA Page

The form where users document new incidents with AI assistance.

![Create RCA Screenshot](./screenshots/create_RCA.png)

### Knowledge Base

The searchable list of all documented RCAs.

![Knowledge Base Screenshot](./screenshots/knowledge_base.png)


### Problem Solver - Quick Search

Search mode for finding solutions quickly.

![Problem Solver Search Screenshot](./screenshots/Help.png)

---

## Error Handling and Safety

### API Error Handling

The backend handles errors gracefully:

```javascript
// Every controller wraps logic in try-catch
try {
  // ... business logic
} catch (error) {
  res.status(500).json({
    success: false,
    message: 'Human-readable error message',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
}
```

- Errors return proper HTTP status codes (400 for bad input, 404 for not found, 500 for server errors)
- Error details are only shown in development mode, not in production
- The frontend shows user-friendly toast notifications for errors

### Input Validation

The Mongoose schema validates data before saving:

```javascript
title: {
  type: String,
  required: [true, 'Issue title is required'],
  maxlength: [200, 'Title cannot exceed 200 characters']
}
```

This prevents invalid data from entering the database.

### Environment Variables

Sensitive information is stored in `.env` files:

- `.env` files are listed in `.gitignore` - they never get committed to version control
- The `.env.example` file shows what variables are needed without exposing actual values
- The application checks for required variables on startup

### AI Safety

The AI integration is designed to be helpful but not dangerous:

- AI only suggests, it does not automatically make changes
- Users always review and confirm before taking action
- The system works without AI - it is an enhancement, not a requirement

---

## Future Improvements

This project is a solid foundation, but there are several ways it could be improved for production use:

### Authentication and Authorization

Currently, anyone can access the system. A production version should have:

- User login and registration
- Role-based access (admin, editor, viewer)
- Team/organization support
- Audit logs of who created or modified RCAs

### Performance Optimizations

For larger deployments:

- Add Redis caching for frequently accessed data
- Implement pagination with cursor-based navigation for large datasets
- Add database indexes for common query patterns
- Use connection pooling for MongoDB

### AI Improvements

The AI integration could be enhanced:

- Add conversation memory across sessions
- Implement RAG (Retrieval Augmented Generation) for better context
- Train on organization-specific terminology
- Add confidence scores to suggestions

### Production Readiness

Before deploying to production:

- Add rate limiting to prevent API abuse
- Implement request logging and monitoring
- Set up health check endpoints for load balancers
- Add Helmet.js for security headers
- Configure CORS properly for your domain

### Testing

Add comprehensive testing:

- Unit tests for controllers and utilities
- Integration tests for API endpoints
- End-to-end tests for critical user flows
- Load testing for performance benchmarks

### Deployment

For deployment, consider:

- Dockerize the application for consistent environments
- Set up CI/CD pipeline for automated testing and deployment
- Use environment-specific configurations
- Implement database backups and recovery procedures

---

## Final Summary

### What You Should Understand

After reviewing this project, you should understand:

1. **The Problem Being Solved** - Technical teams need a way to document and learn from incidents. This system provides that with structured RCAs and AI-powered search.

2. **The Architecture** - A clean separation between frontend (React) and backend (Express), with MongoDB for storage and optional AI integration.

3. **The Code Organization** - Controllers handle logic, routes handle URLs, models define data shapes, and services handle external communication.

4. **The User Flow** - From reporting a problem, to finding solutions, to documenting new fixes, the system creates a positive feedback loop.

### Why This Project is a Good Foundation

This project demonstrates:

- **Full-stack development** - Frontend, backend, and database all working together
- **RESTful API design** - Clean, predictable endpoints following conventions
- **Modern React patterns** - Functional components, hooks, and proper state management
- **Database modeling** - Appropriate schema design with indexes for search
- **AI integration** - Practical use of LLMs to enhance (not replace) user workflows
- **Error handling** - Graceful degradation when things go wrong
- **Code organization** - Separation of concerns and modular structure

