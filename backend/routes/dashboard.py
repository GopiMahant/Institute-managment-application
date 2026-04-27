from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from backend.database import get_db
from backend.models import Employee, Inventory, UploadedFile
from backend.schemas import FileOut

router = APIRouter()

@router.get("")
def get_dashboard_summary(db: Session = Depends(get_db)):
    total_employees = db.query(func.count(Employee.id)).scalar()
    total_inventory_items = db.query(func.count(Inventory.id)).scalar()
    low_stock_items = db.query(func.count(Inventory.id)).filter(Inventory.quantity <= 5).scalar()
    total_files_uploaded = db.query(func.count(UploadedFile.id)).scalar()
    
    recent_uploads = db.query(UploadedFile).order_by(UploadedFile.uploaded_at.desc()).limit(5).all()
    
    return {
        "total_employees": total_employees,
        "total_inventory_items": total_inventory_items,
        "low_stock_items": low_stock_items,
        "total_files_uploaded": total_files_uploaded,
        "recent_uploads": [
            {
                "id": f.id,
                "filename": f.filename,
                "category": f.category,
                "uploaded_at": f.uploaded_at.isoformat()
            } for f in recent_uploads
        ]
    }
