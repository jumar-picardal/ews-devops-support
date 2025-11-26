# EWS DevOps Support Application

Modern React 19 + TypeScript application for Extended Warranty Service (EWS) DevOps support operations.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm (or yarn)
- PostgreSQL (GCP)
- Oracle Database access (KB & SEMS)

### Installation & Running

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env
# Edit .env with your credentials

# 3. Start the application (Frontend + Backend)
npm run dev:all          # Starts both servers concurrently
                         # Frontend: http://localhost:3000
                         # Backend:  http://localhost:3001
```

### Development Commands

```bash
# 🚀 RECOMMENDED: Start both frontend and backend together
npm run dev:all          # Runs both servers with live reload

# OR run them separately:
npm run dev              # Frontend only (Vite) - http://localhost:3000
npm run server:watch     # Backend only (Express) - http://localhost:3001

# Other commands:
npm run build            # Build frontend for production
npm run type-check       # TypeScript type checking
npm run lint             # Run ESLint
```

## 📁 Project Structure

```
ews-devops-support/
├── docs/                          # 📚 Documentation
│   ├── README.md                  # Detailed project documentation
│   ├── NAMING_CONVENTIONS.md      # Coding standards & naming rules
│   ├── DESIGN_SYSTEM.md           # UI/UX design system guide
│   └── TELUS_DESIGN_GUIDE.md      # TELUS brand guidelines
│
├── server/                        # 🔧 Backend (Express + TypeScript)
│   ├── routes/                    # API endpoints
│   │   └── *.routes.ts
│   ├── services/                  # Business logic
│   │   └── *.service.ts
│   └── middleware/                # Express middleware
│
├── src/                           # ⚛️ Frontend (React + TypeScript)
│   ├── components/                # React components
│   ├── services/api/              # API service layer
│   ├── hooks/                     # Custom React hooks
│   ├── styles/                    # CSS & design system
│   └── utils/                     # Utility functions
│
├── proxy-server.ts                # Main backend entry point
└── package.json                   # Dependencies & scripts
```

## 📚 Documentation

All detailed documentation is located in the [`docs/`](./docs) folder:

- **[Project Documentation](./docs/README.md)** - Complete project overview, architecture, and setup
- **[Naming Conventions](./docs/NAMING_CONVENTIONS.md)** - File naming standards and coding conventions
- **[Design System](./docs/DESIGN_SYSTEM.md)** - UI components and styling guidelines
- **[TELUS Design Guide](./docs/TELUS_DESIGN_GUIDE.md)** - TELUS brand and design standards

## 🎯 Features

### Current Features
- ✅ **Retry Contracts** - Bulk retry failed warranty contracts
- ✅ **TypeScript** - Full type safety across frontend and backend
- ✅ **Modern Architecture** - Modular service layer with explicit naming
- ✅ **TELUS Design System** - Brand-compliant UI components

### Upcoming Features
- 🔄 **Activate Warranty** - Warranty activation interface
- 🔄 **Reconcile Tender** - Tender status reconciliation
- 🔄 **Contract Management** - View and manage warranty contracts

## 🛠️ Tech Stack

### Frontend
- **React 19 RC** - Modern React with Compiler, Actions, and new hooks
- **React Router v6** - Client-side routing
- **TypeScript** - Full type safety
- **Vite** - Build tooling and dev server
- **Tailwind CSS** - Utility-first styling
- **Axios** - HTTP client

### Backend
- **Node.js 18+** - Runtime environment
- **Express.js** - Web framework for REST API
- **TypeScript** - Type safety
- **PostgreSQL (pg)** - GCP PostgreSQL database (EWS)
- **Oracle DB (oracledb)** - KB and SEMS databases
- **OAuth2TokenManager** - Centralized OAuth2 token management

## 🔐 Environment Variables

Required environment variables (see `.env.example`):

```bash
# Frontend
VITE_BACKEND_URL=http://localhost:3001

# Backend - PostgreSQL (EWS Database)
DB_HOST=
DB_PORT=
DB_NAME=
DB_USER=
DB_PASSWORD=

# Backend - Oracle (KB Database)
KB_ORACLE_USER=
KB_ORACLE_PASSWORD=
KB_ORACLE_CONNECT_STRING=

# Backend - OAuth Configuration
ACCESS_TOKEN_URL=
TOKEN_EXPIRY_IN_SECS=300
TOKEN_REFRESH_BEFORE_EXPIRY_IN_SECS=30

# Backend - EW Maintenance API
EW_MAINTENANCE_API_BASE_URL=
EW_MAINTENANCE_API_ENVIRONMENT=
EWSMA_OAUTH_CLIENT_ID=
EWSMA_OAUTH_CLIENT_SECRET=
EW_MAINTENANCE_OAUTH_SCOPE=

# Backend - Asurion API
ASURION_API_BASE_URL=
ASURION_API_ENVIRONMENT=
ASURION_OAUTH_CLIENT_ID=
ASURION_OAUTH_CLIENT_SECRET=
ASURION_OAUTH_SCOPE=

# Backend - WLS API
WLS_API_BASE_URL=
WLS_API_ENVIRONMENT=
WLS_OAUTH_CLIENT_ID=
WLS_OAUTH_CLIENT_SECRET=
WLS_OAUTH_SCOPE=
```

## 📝 Available Scripts

```bash
# Development
npm run dev:all          # 🚀 Start both frontend and backend (RECOMMENDED)
npm run dev              # Start frontend only (Vite dev server)
npm run server:watch     # Start backend only (Express with auto-reload)

# Type Checking & Linting
npm run type-check       # TypeScript type checking
npm run lint             # Run ESLint

# Building
npm run build            # Build frontend for production
npm run preview          # Preview production build
```

## 🤝 Contributing

1. Follow the [Naming Conventions](./docs/NAMING_CONVENTIONS.md)
2. Use TypeScript for all new files
3. Follow the [Design System](./docs/DESIGN_SYSTEM.md) for UI components
4. Write meaningful commit messages
5. Test your changes before committing

## 📄 License

Internal TELUS project - All rights reserved

## 👥 Team

DevOps Support Team - TELUS

---

For detailed documentation, please refer to the [`docs/`](./docs) folder.
