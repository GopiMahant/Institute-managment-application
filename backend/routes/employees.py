from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from backend.database import get_db
from backend.models import Employee
from backend.schemas import EmployeeCreate, EmployeeUpdate, EmployeeOut

router = APIRouter()

@router.post("", response_model=EmployeeOut)
def create_employee(employee: EmployeeCreate, db: Session = Depends(get_db)):
    db_employee = Employee(**employee.dict())
    db.add(db_employee)
    try:
        db.commit()
        db.refresh(db_employee)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail="Email might already exist or invalid data")
    return db_employee

@router.get("", response_model=List[EmployeeOut])
def get_employees(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(Employee).offset(skip).limit(limit).all()

@router.get("/{id}", response_model=EmployeeOut)
def get_employee(id: int, db: Session = Depends(get_db)):
    employee = db.query(Employee).filter(Employee.id == id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    return employee

@router.put("/{id}", response_model=EmployeeOut)
def update_employee(id: int, employee: EmployeeUpdate, db: Session = Depends(get_db)):
    db_employee = db.query(Employee).filter(Employee.id == id).first()
    if not db_employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    update_data = employee.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_employee, key, value)
        
    try:
        db.commit()
        db.refresh(db_employee)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail="Invalid data or email already exists")
    return db_employee

@router.delete("/{id}")
def delete_employee(id: int, db: Session = Depends(get_db)):
    db_employee = db.query(Employee).filter(Employee.id == id).first()
    if not db_employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    db.delete(db_employee)
    db.commit()
    return {"deleted": True}
