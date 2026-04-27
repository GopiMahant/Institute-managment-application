import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List, Optional
import aiofiles

from backend.database import get_db
from backend.models import UploadedFile
from backend.schemas import FileOut

router = APIRouter()

ALLOWED_EXTENSIONS = {".pdf", ".jpg", ".jpeg", ".png", ".docx", ".xlsx"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB
STORAGE_BASE = "storage"

@router.post("/upload", response_model=FileOut)
async def upload_file(
    file: UploadFile = File(...), 
    category: str = Form(...), 
    db: Session = Depends(get_db)
):
    if category not in ["employee_docs", "inventory_docs", "general"]:
        raise HTTPException(status_code=400, detail="Invalid category")

    # Validate extension
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"Extension {ext} not allowed")

    # Read and validate file size
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large. Max 10MB allowed")

    # Generate safe filename
    safe_filename = f"{uuid.uuid4()}{ext}"
    filepath = os.path.join(STORAGE_BASE, category, safe_filename)

    # Save to disk
    async with aiofiles.open(filepath, 'wb') as out_file:
        await out_file.write(content)

    # Insert metadata
    db_file = UploadedFile(
        filename=file.filename,
        filepath=filepath,
        category=category
    )
    db.add(db_file)
    db.commit()
    db.refresh(db_file)

    return db_file

@router.get("/files", response_model=List[FileOut])
def list_files(category: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(UploadedFile)
    if category and category.lower() != "all":
        query = query.filter(UploadedFile.category == category)
    return query.all()

@router.get("/files/{id}")
def download_file(id: int, db: Session = Depends(get_db)):
    db_file = db.query(UploadedFile).filter(UploadedFile.id == id).first()
    if not db_file:
        raise HTTPException(status_code=404, detail="File not found")
    
    if not os.path.exists(db_file.filepath):
        raise HTTPException(status_code=404, detail="File missing on disk")
        
    return FileResponse(path=db_file.filepath, filename=db_file.filename)

@router.delete("/files/{id}")
def delete_file(id: int, db: Session = Depends(get_db)):
    db_file = db.query(UploadedFile).filter(UploadedFile.id == id).first()
    if not db_file:
        raise HTTPException(status_code=404, detail="File not found")
    
    # Delete from disk
    if os.path.exists(db_file.filepath):
        try:
            os.remove(db_file.filepath)
        except Exception as e:
            print(f"Error deleting file from disk: {e}")
            
    # Delete from DB
    db.delete(db_file)
    db.commit()
    return {"deleted": True}
