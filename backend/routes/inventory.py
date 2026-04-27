from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from backend.database import get_db
from backend.models import Inventory
from backend.schemas import InventoryCreate, InventoryUpdate, InventoryOut

router = APIRouter()

@router.post("", response_model=InventoryOut)
def create_inventory_item(item: InventoryCreate, db: Session = Depends(get_db)):
    db_item = Inventory(**item.dict())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.get("", response_model=List[InventoryOut])
def get_inventory_items(
    category: Optional[str] = None, 
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db)
):
    query = db.query(Inventory)
    if category:
        if category.lower() != "all":
            query = query.filter(Inventory.category == category)
    return query.offset(skip).limit(limit).all()

@router.get("/{id}", response_model=InventoryOut)
def get_inventory_item(id: int, db: Session = Depends(get_db)):
    item = db.query(Inventory).filter(Inventory.id == id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item

@router.put("/{id}", response_model=InventoryOut)
def update_inventory_item(id: int, item: InventoryUpdate, db: Session = Depends(get_db)):
    db_item = db.query(Inventory).filter(Inventory.id == id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    update_data = item.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_item, key, value)
        
    db.commit()
    db.refresh(db_item)
    return db_item

@router.delete("/{id}")
def delete_inventory_item(id: int, db: Session = Depends(get_db)):
    db_item = db.query(Inventory).filter(Inventory.id == id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    db.delete(db_item)
    db.commit()
    return {"deleted": True}
