from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional

class EmployeeCreate(BaseModel):
    name: str
    email: str
    phone: str
    role: str
    joining_date: date

class EmployeeUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    role: Optional[str] = None
    joining_date: Optional[date] = None

class EmployeeOut(EmployeeCreate):
    id: int
    class Config:
        from_attributes = True

class InventoryCreate(BaseModel):
    name: str
    category: str
    quantity: int
    condition: str
    added_date: date

class InventoryUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    quantity: Optional[int] = None
    condition: Optional[str] = None

class InventoryOut(InventoryCreate):
    id: int
    class Config:
        from_attributes = True

class FileOut(BaseModel):
    id: int
    filename: str
    category: str
    uploaded_at: datetime
    class Config:
        from_attributes = True
