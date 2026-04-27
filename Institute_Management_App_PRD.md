# Institute Management Desktop Application — AI-Ready PRD

## SYSTEM CONTEXT

This is a **desktop application** (not a web app, not a mobile app).
It runs fully offline. No cloud. No internet dependency.
All data is stored locally on the machine running the app.

### Stack (strict — do not deviate)
- **Desktop Wrapper:** Electron
- **Frontend:** Vite + React (runs inside Electron)
- **Backend:** Python FastAPI (spawned as a local subprocess by Electron)
- **Database:** SQLite via SQLAlchemy
- **File Storage:** Local filesystem under `/storage/`

### Architecture (how the pieces connect)
```
Electron
  ├── spawns Python FastAPI backend on localhost:8000
  ├── serves Vite React build as the Electron window UI
  └── React frontend calls FastAPI via http://127.0.0.1:8000
          └── FastAPI reads/writes SQLite (database.db)
                  └── File uploads saved to /storage/ directory
```

### Project Folder Layout
```
institute-app/
├── electron/               # Electron main process (main.js, preload.js)
├── frontend/               # Vite + React source
│   └── src/
│       ├── components/
│       │   ├── Navbar.jsx
│       │   ├── Sidebar.jsx
│       │   ├── Table.jsx
│       │   └── Form.jsx
│       └── pages/
│           ├── Dashboard.jsx
│           ├── Employees.jsx
│           ├── Inventory.jsx
│           └── Upload.jsx
├── backend/                # Python FastAPI source
│   ├── main.py
│   ├── database.py
│   ├── models/
│   ├── routes/
│   └── schemas/
├── storage/                # Local file storage (NOT in DB)
│   ├── employee_docs/
│   ├── inventory_docs/
│   └── general/
└── database.db             # SQLite database file (auto-created on first run)
```

---

## MODULES

There are exactly **4 modules**. Build them in this order.

---

### MODULE 1 — Employee Management

**Purpose:** CRUD interface for managing institute staff and employees.

**Who uses it:** Admin staff operating the desktop app.

**Features:**
- Add a new employee
- Edit an existing employee
- Delete an employee
- View paginated list of all employees

**SQLAlchemy Model:**
```python
class Employee(Base):
    __tablename__ = "employees"

    id           = Column(Integer, primary_key=True, index=True)
    name         = Column(String, nullable=False)
    email        = Column(String, unique=True, nullable=False)
    phone        = Column(String)
    role         = Column(String, nullable=False)
    joining_date = Column(Date, nullable=False)
```

**Pydantic Schemas:**
```python
class EmployeeCreate(BaseModel):
    name: str
    email: str
    phone: str
    role: str
    joining_date: date

class EmployeeUpdate(BaseModel):
    name: str | None
    email: str | None
    phone: str | None
    role: str | None
    joining_date: date | None

class EmployeeOut(EmployeeCreate):
    id: int
    class Config:
        orm_mode = True
```

**API Endpoints:**
```
POST   /employees        → Create employee      → Body: EmployeeCreate  → Returns: EmployeeOut
GET    /employees        → List all employees   → Query: skip, limit    → Returns: list[EmployeeOut]
GET    /employees/{id}   → Get single employee  →                       → Returns: EmployeeOut
PUT    /employees/{id}   → Update employee      → Body: EmployeeUpdate  → Returns: EmployeeOut
DELETE /employees/{id}   → Delete employee      →                       → Returns: { "deleted": true }
```

**Frontend page — `Employees.jsx`:**
- Table listing all employees (columns: Name, Email, Phone, Role, Joining Date, Actions)
- "Add Employee" button → opens modal form
- Edit icon per row → opens pre-filled modal form
- Delete icon per row → confirmation dialog → DELETE request
- Form fields: Name (text), Email (email), Phone (text), Role (text or select), Joining Date (date picker)

---

### MODULE 2 — Inventory Management

**Purpose:** Track physical assets owned by the institute across three fixed categories.

**Who uses it:** Admin staff operating the desktop app.

**Category values (fixed enum):** `books` | `lab_materials` | `sports_equipment`

**Condition values (fixed enum):** `new` | `good` | `damaged` | `lost`

**Low stock threshold:** quantity <= 5 (highlight row in amber)

**Features:**
- Add inventory item
- Edit inventory item (quantity, condition)
- Delete inventory item
- View list filtered by category
- Visual low-stock indicator for items with quantity <= 5

**SQLAlchemy Model:**
```python
class Inventory(Base):
    __tablename__ = "inventory"

    id         = Column(Integer, primary_key=True, index=True)
    name       = Column(String, nullable=False)
    category   = Column(String, nullable=False)
    quantity   = Column(Integer, nullable=False, default=0)
    condition  = Column(String, nullable=False)
    added_date = Column(Date, nullable=False)
```

**Pydantic Schemas:**
```python
class InventoryCreate(BaseModel):
    name: str
    category: str
    quantity: int
    condition: str
    added_date: date

class InventoryUpdate(BaseModel):
    name: str | None
    category: str | None
    quantity: int | None
    condition: str | None

class InventoryOut(InventoryCreate):
    id: int
    class Config:
        orm_mode = True
```

**API Endpoints:**
```
POST   /inventory        → Create item    → Body: InventoryCreate                  → Returns: InventoryOut
GET    /inventory        → List all items → Query: category (optional), skip, limit → Returns: list[InventoryOut]
GET    /inventory/{id}   → Get single     →                                         → Returns: InventoryOut
PUT    /inventory/{id}   → Update item    → Body: InventoryUpdate                  → Returns: InventoryOut
DELETE /inventory/{id}   → Delete item    →                                         → Returns: { "deleted": true }
```

**Frontend page — `Inventory.jsx`:**
- Tab or dropdown filter: All / Books / Lab Materials / Sports Equipment
- Table: Name, Category, Quantity, Condition, Added Date, Actions
- Rows with quantity <= 5 highlighted in amber
- "Add Item" button → modal form
- Edit/Delete icons per row

---

### MODULE 3 — File Upload System

**Purpose:** Upload, store, retrieve, and delete documents associated with the institute.

**Allowed file extensions:** `.pdf` `.jpg` `.jpeg` `.png` `.docx` `.xlsx`

**Max file size:** 10MB per file

**Storage rule:** Files are saved to `/storage/{category}/` on disk. Only file metadata is stored in the database.

**SQLAlchemy Model:**
```python
class UploadedFile(Base):
    __tablename__ = "files"

    id          = Column(Integer, primary_key=True, index=True)
    filename    = Column(String, nullable=False)     # original filename shown to user
    filepath    = Column(String, nullable=False)     # absolute path on local disk
    category    = Column(String, nullable=False)     # employee_docs | inventory_docs | general
    uploaded_at = Column(DateTime, default=datetime.utcnow)
```

**Pydantic Schema:**
```python
class FileOut(BaseModel):
    id: int
    filename: str
    category: str
    uploaded_at: datetime
    class Config:
        orm_mode = True
```

**API Endpoints:**
```
POST   /upload       → Upload file     → multipart/form-data: file + category → Returns: FileOut
GET    /files        → List all files  → Query: category (optional)            → Returns: list[FileOut]
GET    /files/{id}   → Download file   →                                       → Returns: FileResponse (raw bytes)
DELETE /files/{id}   → Delete file     → Also deletes from disk                → Returns: { "deleted": true }
```

**Upload logic — backend must do this in order:**
1. Validate file extension is in allowed list
2. Validate file size <= 10MB
3. Generate a safe filename: `{uuid4}{original_extension}` to avoid collisions and path traversal
4. Save binary to `/storage/{category}/`
5. Insert metadata row into `files` table
6. Return metadata as `FileOut`

**Frontend page — `Upload.jsx`:**
- Drag-and-drop upload zone + click-to-browse fallback
- Category selector before upload: Employee Docs / Inventory Docs / General
- File list table: Filename, Category, Uploaded At, Download button, Delete button
- Filter by category
- Show file type icon based on extension (PDF / image / doc)

---

### MODULE 4 — Dashboard

**Purpose:** Read-only at-a-glance overview of all key metrics. No data entry on this page.

**API Endpoint:**
```
GET /dashboard   → Returns a single JSON object with live counts and recent uploads
```

**Response schema:**
```json
{
  "total_employees": "integer — COUNT(*) from employees table",
  "total_inventory_items": "integer — COUNT(*) from inventory table",
  "low_stock_items": "integer — COUNT(*) from inventory WHERE quantity <= 5",
  "total_files_uploaded": "integer — COUNT(*) from files table",
  "recent_uploads": [
    {
      "id": "integer",
      "filename": "string",
      "category": "string",
      "uploaded_at": "ISO datetime string"
    }
  ]
}
```

`recent_uploads` returns the **5 most recent** files ordered by `uploaded_at DESC`.

**Frontend page — `Dashboard.jsx`:**
- 4 stat cards in a row: Total Employees, Total Inventory Items, Low Stock Items, Total Files Uploaded
- Low stock card uses amber/warning styling if value > 0
- Recent Uploads table below cards (columns: Filename, Category, Uploaded At)
- All data fetched on component mount via `GET /dashboard`
- No forms, no inputs, no mutations on this page

---

## BACKEND SETUP

### `backend/database.py` — complete file
```python
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

DATABASE_URL = "sqlite:///./database.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

### `backend/main.py` — responsibilities
- Import all model classes so `Base.metadata.create_all(bind=engine)` creates all tables on first run
- Include all routers with prefixes: `/employees`, `/inventory`, `/upload`, `/files`, `/dashboard`
- Enable CORS for origins: `http://localhost:5173` (Vite dev) and `app://` (Electron production)
- Serve `/storage/` directory as static files at route `/static/`

### Required Python packages
```
fastapi
uvicorn
sqlalchemy
python-multipart
aiofiles
```

---

## FRONTEND SETUP

### API service — `src/services/api.js`
- Single file handles all HTTP calls
- Base URL: `http://127.0.0.1:8000`
- Export one function per API endpoint

### State management rules
- Use `useState` + `useEffect` only — no global state manager needed
- All API calls go through `api.js` — never call `fetch` directly inside components

### Layout rules
- Persistent `Sidebar.jsx` with nav links: Dashboard, Employees, Inventory, File Upload
- `Navbar.jsx` at top showing app title
- Page content renders to the right of sidebar
- Use React Router (`BrowserRouter`) for page navigation

---

## ELECTRON INTEGRATION

### `electron/main.js` — startup sequence
1. App ready → spawn Python subprocess: `uvicorn backend.main:app --host 127.0.0.1 --port 8000`
2. Poll `GET http://127.0.0.1:8000/dashboard` every 500ms until HTTP 200 is received
3. Create `BrowserWindow` and load Vite build (`dist/index.html`) or dev server URL
4. On app `before-quit`: kill Python subprocess cleanly

### Build steps
```bash
# Step 1 — build Vite frontend
cd frontend && npm run build

# Step 2 — package with electron-builder
npx electron-builder
```

Output: `.exe` (Windows) | `.dmg` (macOS) | `.AppImage` (Linux)

---

## SECURITY RULES

- FastAPI must bind only to `127.0.0.1` — never `0.0.0.0`
- All request bodies validated with Pydantic before touching the DB
- File uploads: validate both extension AND MIME type
- Never execute uploaded files under any condition
- Sanitize all file paths stored in DB — no path traversal characters allowed (`../`)

---

## MVP SCOPE

| Feature | Include in MVP |
|---|---|
| Employee CRUD | ✅ |
| Inventory CRUD with low-stock indicator | ✅ |
| File upload / download / delete | ✅ |
| Dashboard summary with recent uploads | ✅ |
| Login / authentication system | ❌ |
| Search and advanced filters | ❌ |
| Export to CSV or PDF | ❌ |
| Database backup and restore | ❌ |
| Notifications system | ❌ |

---

## FUTURE ENHANCEMENTS (post-MVP)

- Role-based login (Admin, Staff, Viewer)
- Search and advanced filters across all modules
- Export data as CSV or PDF
- Database backup and restore UI
- In-app notifications for low stock
- Audit log: who changed what and when

---

## DEVELOPMENT PHASES

| Phase | Task |
|---|---|
| 1 | Set up SQLite DB, define all SQLAlchemy models, run `create_all` |
| 2 | Build and test all FastAPI routes — verify with Swagger UI at `/docs` |
| 3 | Build all React pages and connect to API via `api.js` |
| 4 | Electron integration: spawn backend subprocess, load frontend in window |
| 5 | End-to-end testing of full flow on desktop |
| 6 | Package to installable binary with `electron-builder` |

---

## SUCCESS CRITERIA

- App launches as a native desktop window — no browser required
- All CRUD operations persist correctly to `database.db`
- Uploaded files are saved to `/storage/` and are downloadable
- Dashboard reflects live counts directly from the database
- App works fully offline with zero internet dependency
- Packaged installer runs on a fresh machine without requiring Python or Node to be pre-installed
