# RCA Management System

A modern, AI-powered Root Cause Analysis (RCA) Management System built with the MERN stack. This system helps teams document, search, and learn from past incidents with intelligent AI-assisted suggestions.

![MERN Stack](https://img.shields.io/badge/Stack-MERN-green)
![AI Powered](https://img.shields.io/badge/AI-Claude%20API-purple)
![License](https://img.shields.io/badge/License-MIT-blue)

## 🎯 Features

### Core Features
- **🆘 Problem Solver**: Get AI-powered solutions from the knowledge base
- **Create RCAs**: Structured forms for documenting incidents
- **Knowledge Base**: Searchable repository of all RCAs
- **Advanced Search**: Full-text search with category and severity filters
- **Statistics Dashboard**: Visual overview of incident patterns

### AI-Powered Features
- **Intelligent Problem Matching**: Find solutions from similar past incidents
- **Chat-Based Diagnosis**: Conversational troubleshooting assistant
- **Similar Issue Detection**: Automatically finds related past incidents
- **Root Cause Validation**: Checks if stated cause is actually a symptom
- **Self-Learning**: Users can contribute solutions back to the knowledge base
- **Executive Summaries**: Auto-generated incident reports

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

## 🤖 AI Prompts Used

### Similarity Search Prompt
```
You are an IT incident analyst assistant. Your job is to help identify 
similar past issues and suggest solutions based on historical data.

Analyze the new issue and compare with existing RCAs:
1. Are any existing RCAs similar? (Yes/No with explanation)
2. What was the likely root cause?
3. What solution would you suggest?
4. Any additional investigation steps?
```

### Root Cause Validation Prompt
```
You are an IT incident analysis expert. Determine if a stated "root cause" 
is actually a root cause or if it's really just a symptom.

Format your response as:
VERDICT: [Root Cause / Symptom / Unclear]
CONFIDENCE: [High/Medium/Low]
REASONING: [Brief explanation]
SUGGESTION: [What to do next]
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

### The Learning Cycle
```
    ┌─────────────────────────────────────────────┐
    │                                             │
    │   ┌───────────┐      ┌───────────────┐     │
    │   │  Problem  │      │  Knowledge    │     │
    │   │  Occurs   │─────►│  Base Search  │     │
    │   └───────────┘      └───────┬───────┘     │
    │                              │             │
    │                    ┌─────────┴─────────┐   │
    │                    │                   │   │
    │               Found Match         No Match │
    │                    │                   │   │
    │                    ▼                   ▼   │
    │             ┌───────────┐      ┌───────────┐
    │             │   Apply   │      │   Debug   │
    │             │  Solution │      │  & Solve  │
    │             └─────┬─────┘      └─────┬─────┘
    │                   │                  │     │
    │                   ▼                  ▼     │
    │             ┌───────────┐      ┌───────────┐
    │             │ Feedback  │      │Create New │
    │             │ (Helpful?)│      │   RCA     │
    │             └─────┬─────┘      └─────┬─────┘
    │                   │                  │     │
    │                   └────────┬─────────┘     │
    │                            │               │
    │                            ▼               │
    │                   ┌───────────────┐        │
    │                   │  Knowledge    │        │
    │                   │  Base Grows   │◄───────┘
    │                   └───────────────┘
    │                            │
    └────────────────────────────┘
              (Continuous Learning)
```

## 🎨 Screenshots

### Dashboard
- Total RCAs count
- Get Help CTA banner
- Category distribution chart
- Severity breakdown
- Recent RCAs list

### Problem Solver (🆕 Main Feature!)
- Quick Search mode with autocomplete
- Chat-based diagnosis mode
- AI-powered solution matching
- Step-by-step guided solutions
- Feedback and learning mechanism
- Option to contribute new solutions

### Create RCA (with AI)
- Structured input form
- AI similarity suggestions panel
- Root cause validation
- Field improvement suggestions

### Knowledge Base
- Full-text search
- Category/severity filters
- Paginated results
- Quick preview cards

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, React Router v6, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB with Mongoose |
| AI | Anthropic Claude API |
| Build | Vite |
| Icons | Lucide React |

## 🔧 Configuration Options

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Backend server port | No (default: 5000) |
| `MONGODB_URI` | MongoDB connection string | Yes |
| `ANTHROPIC_API_KEY` | Claude API key | No (AI features disabled) |
| `NODE_ENV` | Environment mode | No |

### Without AI API Key
The system works fully without an AI API key - AI features will gracefully degrade to:
- Database-only similarity search
- Static validation hints
- Basic suggestions

## 📈 Future Enhancements

- [ ] User authentication
- [ ] Team/organization support
- [ ] Export to PDF/Word
- [ ] Slack/Teams integration
- [ ] Automated incident import
- [ ] Analytics and trend analysis
- [ ] Custom RCA templates

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

MIT License - feel free to use this project for learning or commercial purposes.

## 💡 Interview Tips

This project demonstrates:
- **Full-stack development**: Complete MERN application
- **API design**: RESTful endpoints with proper status codes
- **Database modeling**: MongoDB schema design with indexes
- **AI integration**: Practical use of LLM APIs for real problem-solving
- **Modern React**: Hooks, functional components, routing
- **UI/UX**: Clean, responsive design with Tailwind
- **Error handling**: Graceful degradation, user feedback
- **Code organization**: Separation of concerns, modular structure

### Key Talking Points for Interviews

1. **Problem Solver Feature**: "The system doesn't just store RCAs - it actively helps users solve problems by matching their issues against the knowledge base and providing AI-guided solutions."

2. **Self-Learning System**: "When users find new solutions, they can contribute them back, so the knowledge base grows organically. This creates a positive feedback loop."

3. **AI as Assistant, Not Replacement**: "AI suggests and guides, but humans make the decisions. This keeps the system practical and trustworthy."

4. **Graceful Degradation**: "The system works fully without an AI API key - it falls back to database searches and static suggestions. AI enhances but isn't required."

5. **Real-World Value**: "This solves a real problem - teams often solve the same issues repeatedly because knowledge isn't captured or searchable."

---

Built with ❤️ using MERN Stack + AI
# RAC-PROJECT
# RAC-PROJECT
# RAC-PROJECT
# RAC-Project_today
# RAC-Project_today
