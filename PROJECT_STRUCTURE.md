# 📁 PROJECT STRUCTURE DOCUMENTATION

**Project:** Yamini Infotech Business Management System  
**Type:** Full-Stack ERP (Enterprise Resource Planning)  
**Stack:** FastAPI (Backend) + React/Vite (Frontend) + PostgreSQL  
**Status:** ✅ Production Ready  

---

## 🏗️ CURRENT STRUCTURE (As-Is)

```
Yamini.pvt-master/
├── .gitignore
├── .venv/                          # Python virtual environment (117MB)
├── README.md                       # Main project documentation
├── [23 x *.md files]              # Documentation (needs organization)
│
├── backend/                        # FastAPI Backend
│   ├── .env.example               
│   ├── .gitignore
│   ├── README.md
│   ├── main.py                    # ⭐ Entry Point
│   ├── models.py                  # SQLAlchemy models
│   ├── schemas.py                 # Pydantic schemas
│   ├── database.py                # DB connection
│   ├── auth.py                    # JWT authentication
│   ├── crud.py                    # CRUD operations
│   ├── notification_service.py    # Notifications
│   ├── scheduler.py               # Background tasks
│   ├── sla_utils.py              # SLA tracking
│   ├── audit_logger.py           # Audit trails
│   ├── routers/                  # API routes
│   │   ├── __init__.py
│   │   ├── admin_sales.py
│   │   ├── analytics.py
│   │   ├── attendance.py
│   │   ├── audit.py
│   │   ├── auth_routes.py
│   │   ├── bookings.py
│   │   ├── complaints.py
│   │   ├── customers.py
│   │   ├── enquiries.py
│   │   ├── feedback.py
│   │   ├── invoices.py
│   │   ├── mif.py
│   │   ├── notifications.py
│   │   ├── orders.py
│   │   ├── product_management.py
│   │   ├── products.py
│   │   ├── reports.py
│   │   ├── sales.py
│   │   ├── service_engineer.py
│   │   ├── service_requests.py
│   │   ├── settings.py
│   │   ├── stock_movements.py
│   │   ├── users.py
│   │   └── visitors.py
│   ├── uploads/                  # Runtime file uploads
│   ├── __pycache__/             # Python cache
│   └── [utility scripts]         # Should move to /scripts/
│
├── frontend/                      # React + Vite Frontend
│   ├── index.html               # Entry HTML
│   ├── package.json             # Dependencies
│   ├── vite.config.js          # Vite configuration
│   ├── cypress.config.js       # E2E test config
│   ├── node_modules/           # Node dependencies (200MB)
│   ├── public/                 # Static assets
│   │   └── assets/
│   │       └── products/       # Product images
│   ├── src/
│   │   ├── main.jsx           # ⭐ Entry Point
│   │   ├── App.jsx            # Main App component
│   │   ├── styles.css         # Global styles
│   │   ├── admin/             # Admin portal
│   │   │   ├── components/
│   │   │   ├── layout/
│   │   │   ├── pages/
│   │   │   ├── services/
│   │   │   ├── styles/
│   │   │   └── utils/
│   │   ├── salesman/          # Salesman portal
│   │   │   ├── components/
│   │   │   ├── layout/
│   │   │   ├── pages/
│   │   │   └── services/
│   │   ├── components/        # Shared components (~60 files)
│   │   │   ├── reception/    # Reception module
│   │   │   ├── service-engineer/ # Service engineer module
│   │   │   └── [various].jsx
│   │   ├── contexts/          # React contexts
│   │   │   ├── AuthContext.jsx
│   │   │   └── NotificationContext.jsx
│   │   ├── hooks/             # Custom React hooks
│   │   ├── utils/             # Utilities
│   │   ├── api/               # API clients
│   │   └── styles/            # Modular styles
│   └── cypress/               # E2E tests
│       ├── e2e/
│       └── support/
│
└── uploads/                    # Global uploads (if any)
```

---

## 🎯 PROPOSED PROFESSIONAL STRUCTURE

```
Yamini.pvt-master/
├── README.md                  # ⭐ Main Documentation
├── LICENSE                    # Software license
├── .gitignore                # Git ignore rules
├── .env.example              # Environment template
│
├── docs/                     # 📚 All Documentation
│   ├── README.md             # Docs index
│   ├── architecture/         # System design
│   │   ├── backend-api.md
│   │   ├── frontend-components.md
│   │   └── database-schema.md
│   ├── admin/                # Admin module docs
│   │   ├── implementation-guide.md
│   │   ├── component-checklist.md
│   │   └── quick-reference.md
│   ├── modules/              # Feature modules
│   │   ├── service-engineer.md
│   │   ├── salesman.md
│   │   ├── reception.md
│   │   └── customer.md
│   ├── guides/               # User guides
│   │   ├── quick-start.md
│   │   ├── deployment.md
│   │   └── production-checklist.md
│   ├── api/                  # API documentation
│   │   └── endpoints.md
│   └── security/             # Security docs
│       └── authentication.md
│
├── backend/                  # 🔧 FastAPI Backend
│   ├── README.md
│   ├── requirements.txt
│   ├── .env.example
│   ├── .gitignore
│   ├── main.py              # ⭐ Application entry
│   ├── config.py            # Configuration
│   ├── database.py          # DB setup
│   ├── models.py            # Data models
│   ├── schemas.py           # Pydantic schemas
│   ├── auth.py              # Authentication
│   ├── crud.py              # Database operations
│   ├── dependencies.py      # FastAPI dependencies
│   ├── routers/             # API Routes (24 files)
│   │   ├── __init__.py
│   │   └── [all route files]
│   ├── services/            # Business logic
│   │   ├── __init__.py
│   │   ├── notification_service.py
│   │   ├── scheduler.py
│   │   ├── sla_utils.py
│   │   └── audit_logger.py
│   ├── middleware/          # Custom middleware
│   ├── utils/               # Utilities
│   ├── uploads/             # Runtime uploads
│   └── __pycache__/         # (gitignored)
│
├── frontend/                # ⚛️ React Frontend
│   ├── README.md
│   ├── package.json
│   ├── package-lock.json
│   ├── vite.config.js
│   ├── index.html
│   ├── .gitignore
│   ├── public/              # Static assets
│   │   ├── favicon.ico
│   │   └── assets/
│   ├── src/
│   │   ├── main.jsx        # ⭐ React entry
│   │   ├── App.jsx         # Root component
│   │   ├── styles.css      # Global styles
│   │   ├── admin/          # Admin Portal
│   │   │   ├── layout/
│   │   │   ├── pages/
│   │   │   ├── components/
│   │   │   └── services/
│   │   ├── salesman/       # Salesman Portal
│   │   │   ├── layout/
│   │   │   ├── pages/
│   │   │   ├── components/
│   │   │   └── services/
│   │   ├── components/     # Shared Components
│   │   │   ├── common/    # Reusable components
│   │   │   ├── reception/
│   │   │   ├── service-engineer/
│   │   │   └── [feature-specific]/
│   │   ├── contexts/       # React Context
│   │   ├── hooks/          # Custom Hooks
│   │   ├── services/       # API Services
│   │   ├── utils/          # Utilities
│   │   ├── styles/         # Modular CSS
│   │   └── types/          # TypeScript types (if using TS)
│   ├── cypress/            # E2E Tests
│   │   ├── e2e/
│   │   ├── support/
│   │   └── fixtures/
│   └── node_modules/       # (gitignored)
│
├── scripts/                # 🛠️ Utility Scripts
│   ├── migrations/         # DB Migrations
│   │   ├── completed/      # Applied migrations
│   │   └── pending/        # Pending migrations
│   ├── setup/              # Setup scripts
│   │   ├── init_db.py
│   │   └── setup.sh
│   ├── utils/              # Dev utilities
│   │   ├── check_attendance.py
│   │   ├── debug_password.py
│   │   └── clear_data.py
│   └── deploy/             # Deployment scripts
│
├── tests/                  # 🧪 Tests
│   ├── backend/
│   │   ├── test_auth.py
│   │   ├── test_api.py
│   │   └── test_models.py
│   ├── frontend/
│   │   └── cypress/ → symlink to ../frontend/cypress
│   └── integration/
│
├── config/                 # ⚙️ Configuration
│   ├── nginx/              # Nginx configs
│   ├── docker/             # Docker files
│   └── deployment/         # Deployment configs
│
├── uploads/                # 📤 Global Uploads
│   ├── products/
│   ├── documents/
│   └── temp/
│
└── .venv/                  # (gitignored)
```

---

## 📊 DIRECTORY PURPOSE GUIDE

### **Root Level**
| Directory | Purpose | Size | Critical |
|-----------|---------|------|----------|
| `backend/` | FastAPI backend API | ~10MB | ✅ YES |
| `frontend/` | React frontend UI | ~200MB | ✅ YES |
| `docs/` | All documentation | ~1MB | ⚠️ Important |
| `scripts/` | Utility scripts | ~500KB | ⚠️ Useful |
| `tests/` | Test suites | ~1MB | ⚠️ QA |
| `config/` | Deployment configs | ~100KB | ⚠️ DevOps |
| `uploads/` | User uploads | Varies | ✅ YES |
| `.venv/` | Python env | 117MB | ✅ YES |

### **Backend Structure**
| Directory | Purpose | Files | Critical |
|-----------|---------|-------|----------|
| `routers/` | API endpoints | 24 | ✅ YES |
| `services/` | Business logic | 4 | ✅ YES |
| `models.py` | Database models | 1 | ✅ YES |
| `schemas.py` | API schemas | 1 | ✅ YES |
| `auth.py` | Authentication | 1 | ✅ YES |
| `main.py` | Entry point | 1 | ✅ YES |

### **Frontend Structure**
| Directory | Purpose | Components | Critical |
|-----------|---------|------------|----------|
| `admin/` | Admin portal | ~20 | ✅ YES |
| `salesman/` | Salesman portal | ~15 | ✅ YES |
| `components/` | Shared components | ~60 | ✅ YES |
| `contexts/` | React contexts | 2 | ✅ YES |
| `hooks/` | Custom hooks | ~5 | ⚠️ Important |
| `services/` | API clients | ~3 | ✅ YES |

---

## 🔗 KEY ENTRY POINTS

### Backend
```
📍 main.py → FastAPI app instance
📍 routers/__init__.py → Router registration
📍 models.py → Database schema
```

### Frontend
```
📍 index.html → HTML entry
📍 main.jsx → React root
📍 App.jsx → Main app component
📍 App.jsx (routes) → All page routes
```

---

## 🚀 SCALING RECOMMENDATIONS

### When Project Grows:
1. **Split `components/`** by feature (auth/, dashboard/, reports/)
2. **Add `frontend/src/types/`** for TypeScript definitions
3. **Create `backend/api/v1/` and `v2/`** for versioning
4. **Add `backend/core/`** for shared business logic
5. **Use `docker-compose.yml`** for containerization

---

## 📌 NAMING CONVENTIONS

### Backend (Python)
- **Files:** `snake_case.py`
- **Classes:** `PascalCase`
- **Functions:** `snake_case()`
- **Constants:** `UPPER_SNAKE_CASE`

### Frontend (React)
- **Components:** `PascalCase.jsx`
- **Utilities:** `camelCase.js`
- **Styles:** `kebab-case.css` or `ComponentName.module.css`
- **Hooks:** `useCamelCase.js`

---

## ✅ VERIFICATION CHECKLIST

After any structure change:

- [ ] Backend starts: `uvicorn main:app --reload`
- [ ] Frontend builds: `npm run dev`
- [ ] All imports resolve correctly
- [ ] No 404 errors on routes
- [ ] Database connects successfully
- [ ] Authentication works
- [ ] File uploads work
- [ ] All modules accessible

---

**Last Updated:** December 28, 2025  
**Status:** Analysis Complete - Awaiting Reorganization Approval
