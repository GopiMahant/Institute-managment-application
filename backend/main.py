from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from backend.database import engine, Base
import backend.models as models

# Create all tables in the database
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Institute Management App API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "app://"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve storage directory as static files
app.mount("/static", StaticFiles(directory="storage"), name="static")

# Import routers (to be created)
from backend.routes import employees, inventory, files, dashboard

# Include routers
app.include_router(employees.router, prefix="/employees", tags=["employees"])
app.include_router(inventory.router, prefix="/inventory", tags=["inventory"])
app.include_router(files.router, tags=["files"])
app.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])

@app.get("/")
def read_root():
    return {"message": "Institute Management API is running"}
