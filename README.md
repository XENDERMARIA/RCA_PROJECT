# RCA Management System

A modern, AI-powered Root Cause Analysis (RCA) Management System built with the MERN stack. This system helps teams document, search, and learn from past incidents with intelligent AI-assisted suggestions.
## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (React)                         │
│  ┌─────────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐  │
│  │ProblemSolver│  │ CreateRCA │  │  RCAList  │  │ Dashboard │  │
│  │ (Get Help)  │  │           │  │           │  │           │  │
│  └─────────────┘  └───────────┘  └───────────┘  └───────────┘  │
│         │                │               │             │        │
│         └────────────────┴───────────────┴─────────────┘        │
│                              │                                   │
│                    ┌─────────┴─────────┐                        │
│                    │   API Service     │                        │
└────────────────────┼───────────────────┼────────────────────────┘
                     │                   │
                     ▼                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Backend (Express.js)                        │
│  ┌───────────────────────┐    ┌───────────────────────┐        │
│  │     RCA Routes        │    │    Solver Routes      │        │
│  │  POST /api/rca        │    │  POST /api/solver/    │        │
│  │  GET  /api/rca        │    │       search          │        │
│  │  GET  /api/rca/:id    │    │  POST /api/solver/    │        │
│  │  PUT  /api/rca/:id    │    │       chat            │        │
│  │  DELETE /api/rca/:id  │    │  POST /api/solver/    │        │
│  │  GET /api/rca/search  │    │       feedback        │        │
│  └───────────────────────┘    └───────────────────────┘        │
│              │                          │                       │
│              │               ┌──────────┴──────────┐            │
│              │               │                     │            │
│              │               ▼                     ▼            │
│              │    ┌───────────────────┐  ┌─────────────────┐   │
│              │    │   Claude API      │  │  AI Analysis    │   │
│              │    │   (Anthropic)     │  │  & Learning     │   │
│              │    └───────────────────┘  └─────────────────┘   │
│              ▼                                                  │
│  ┌───────────────────────────────────────────────┐              │
│  │              MongoDB Database                  │              │
│  │  ┌─────────────────────────────────────────┐  │              │
│  │  │            RCA Collection                │  │              │
│  │  │  - title, category, symptoms            │  │              │
│  │  │  - rootCause, solution, prevention      │  │              │
│  │  │  - severity, status, tags               │  │              │
│  │  └─────────────────────────────────────────┘  │              │
│  └───────────────────────────────────────────────┘              │
└─────────────────────────────────────────────────────────────────┘
```

## 📁 Project Structure

```
rca-system/
├── backend/
│   ├── config/                 # Configuration files
│   ├── controllers/
│   │   ├── rcaController.js    # RCA CRUD operations
│   │   ├── aiController.js     # AI integration logic
│   │   └── solverController.js # Problem Solver logic
│   ├── models/
│   │   └── RCA.js              # Mongoose schema
│   ├── routes/
│   │   ├── rcaRoutes.js        # RCA API routes
│   │   ├── aiRoutes.js         # AI API routes
│   │   └── solverRoutes.js     # Problem Solver routes
│   ├── utils/
│   │   └── seedData.js         # Sample data seeder
│   ├── .env.example            # Environment variables template
│   ├── package.json
│   └── server.js               # Express app entry point
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.jsx          # Main layout with nav
│   │   │   ├── SearchBar.jsx       # Reusable search
│   │   │   └── AISuggestionBox.jsx # AI suggestion display
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx       # Stats overview
│   │   │   ├── ProblemSolver.jsx   # 🆕 Get Help interface
│   │   │   ├── CreateRCA.jsx       # New RCA form
│   │   │   ├── RCAList.jsx         # Knowledge base
│   │   │   ├── RCADetails.jsx      # Single RCA view
│   │   │   └── EditRCA.jsx         # Edit RCA form
│   │   ├── services/
│   │   │   └── api.js              # Axios API client
│   │   ├── App.jsx                 # Router setup
│   │   ├── main.jsx                # React entry point
│   │   └── index.css               # Tailwind styles
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── vite.config.js
│
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- MongoDB (local or Atlas)
- Anthropic API key (optional, for AI features)

### Installation

1. **Clone and setup backend**
```bash
cd rca-system/backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and API key
```

2. **Setup frontend**
```bash
cd ../frontend
npm install
```

3. **Configure environment variables**

Edit `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/rca-system
ANTHROPIC_API_KEY=your_api_key_here  # Optional
```

4. **Seed sample data (optional)**
```bash
cd backend
npm run seed
```

5. **Start the application**

Terminal 1 - Backend:
```bash
cd backend
npm run dev
```

Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

6. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 📡 API Reference

### RCA Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/rca` | Get all RCAs (with pagination) |
| GET | `/api/rca/:id` | Get single RCA |
| POST | `/api/rca` | Create new RCA |
| PUT | `/api/rca/:id` | Update RCA |
| DELETE | `/api/rca/:id` | Delete RCA |
| GET | `/api/rca/search?q=` | Search RCAs |
| GET | `/api/rca/stats` | Get statistics |

### Problem Solver Endpoints (🆕 Main Feature!)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/solver/search` | Search for solutions based on problem |
| POST | `/api/solver/guide` | Get step-by-step guidance for a specific RCA |
| POST | `/api/solver/chat` | Chat-based diagnosis conversation |
| POST | `/api/solver/feedback` | Submit feedback & create new RCAs |
| GET | `/api/solver/suggest` | Get autocomplete suggestions |

### AI Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/similarity` | Find similar past RCAs |
| POST | `/api/ai/assist` | Get AI writing assistance |
| POST | `/api/ai/validate-rootcause` | Validate root cause |
| POST | `/api/ai/summarize` | Generate executive summary |

### Example API Calls

**Search for Solutions (Problem Solver):**
```bash
curl -X POST http://localhost:5000/api/solver/search \
  -H "Content-Type: application/json" \
  -d '{
    "problem": "Database connection timeout during peak hours",
    "category": "Database",
    "additionalDetails": "Seeing 504 errors in the API gateway"
  }'
```

**Chat-Based Diagnosis:**
```bash
curl -X POST http://localhost:5000/api/solver/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "My application is running slow and I see high memory usage"}
    ]
  }'
```

**Submit Feedback & Create New RCA:**
```bash
curl -X POST http://localhost:5000/api/solver/feedback \
  -H "Content-Type: application/json" \
  -d '{
    "helpful": false,
    "problemDescription": "Redis cache failing intermittently",
    "actualSolution": "Increased replica count and fixed Sentinel quorum settings",
    "createNewRCA": true
  }'
```

**Create RCA:**
```bash
curl -X POST http://localhost:5000/api/rca \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Database connection timeout",
    "category": "Database",
    "symptoms": "Users unable to login, 504 errors",
    "rootCause": "Connection pool exhaustion",
    "solution": "Increased pool size, fixed connection leaks",
    "prevention": "Added connection monitoring",
    "severity": "High"
  }'
```

**Search RCAs:**
```bash
curl "http://localhost:5000/api/rca/search?q=database&category=Server"
```

**Find Similar Issues:**
```bash
curl -X POST http://localhost:5000/api/ai/similarity \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Server not responding",
    "symptoms": "High CPU usage, memory at 95%"
  }'
```



## 👤 User Flows

### Flow 1: Getting Help (Problem Solver)
```
┌──────────────────────────────────────────────────────────────────┐
│                   GETTING HELP WORKFLOW                          │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  1. USER HAS A PROBLEM                                           │
│     │                                                             │
│     ▼                                                             │
│  2. OPENS "GET HELP" / PROBLEM SOLVER                            │
│     │                                                             │
│     ├──────────────────┬─────────────────┐                       │
│     │                  │                 │                       │
│     ▼                  ▼                 ▼                       │
│  QUICK SEARCH      CHAT MODE        BROWSE RCAs                  │
│     │                  │                 │                       │
│     ▼                  ▼                 │                       │
│  3. DESCRIBES PROBLEM                    │                       │
│     │                                    │                       │
│     ▼                                    │                       │
│  4. AI SEARCHES KNOWLEDGE BASE           │                       │
│     │                                    │                       │
│     ├── MATCHES FOUND ──────────────────►│                       │
│     │   │                                │                       │
│     │   ▼                                │                       │
│     │  5. SHOWS SIMILAR PAST ISSUES      │                       │
│     │   │                                │                       │
│     │   ▼                                │                       │
│     │  6. USER SELECTS RELEVANT RCA      │                       │
│     │   │                                │                       │
│     │   ▼                                │                       │
│     │  7. AI PROVIDES STEP-BY-STEP GUIDE │                       │
│     │   │                                │                       │
│     │   ▼                                │                       │
│     │  8. PROBLEM SOLVED? ───────────────┤                       │
│     │      │         │                   │                       │
│     │     YES        NO                  │                       │
│     │      │         │                   │                       │
│     │      ▼         ▼                   │                       │
│     │   FEEDBACK  USER PROVIDES          │                       │
│     │             THEIR SOLUTION         │                       │
│     │                │                   │                       │
│     │                ▼                   │                       │
│     │          9. NEW RCA CREATED ◄──────┘                       │
│     │             (LEARNING!)                                    │
│     │                                                             │
│     └── NO MATCHES ──► GENERAL AI GUIDANCE                       │
│                        │                                         │
│                        ▼                                         │
│                     USER SOLVES IT                               │
│                        │                                         │
│                        ▼                                         │
│                  10. CREATES NEW RCA                             │
│                      (KNOWLEDGE BASE GROWS!)                     │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

### Flow 2: Creating RCAs (Documentation)
```
┌──────────────────────────────────────────────────────────────────┐
│                    RCA CREATION WORKFLOW                         │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  1. INCIDENT RESOLVED                                            │
│     │                                                             │
│     ▼                                                             │
│  2. USER OPENS "CREATE RCA"                                      │
│     │                                                             │
│     ▼                                                             │
│  3. ENTERS TITLE + SYMPTOMS                                      │
│     │                                                             │
│     ├──────────────────────────────────────┐                     │
│     │                                      │                     │
│     ▼                                      ▼                     │
│  4. AI SEARCHES FOR                    USER CONTINUES            │
│     SIMILAR PAST ISSUES                DOCUMENTING               │
│     │                                      │                     │
│     │ Similar found?                       │                     │
│     │                                      │                     │
│     ├── YES ──► Show past solution         │                     │
│     │           (avoid duplicates)         │                     │
│     │                                      │                     │
│     └── NO ───► Continue normally          │                     │
│                                            │                     │
│                                            ▼                     │
│  5. USER ENTERS ROOT CAUSE ◄───────────────┘                     │
│     │                                                             │
│     ▼                                                             │
│  6. AI VALIDATES: Is this really a root cause?                   │
│     │                                                             │
│     ├── Looks like symptom ──► Suggest digging deeper            │
│     │                                                             │
│     └── Valid root cause ──► Continue                            │
│                                                                   │
│     ▼                                                             │
│  7. USER COMPLETES SOLUTION + PREVENTION                         │
│     │                                                             │
│     ▼                                                             │
│  8. RCA SAVED TO KNOWLEDGE BASE                                  │
│     │                                                             │
│     ▼                                                             │
│  9. AVAILABLE FOR FUTURE PROBLEM SOLVING!                        │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

