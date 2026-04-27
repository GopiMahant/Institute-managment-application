from sqlalchemy import Column, Integer, String, Date, DateTime
from datetime import datetime
from backend.database import Base

class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    phone = Column(String)
    role = Column(String, nullable=False)
    joining_date = Column(Date, nullable=False)

class Inventory(Base):
    __tablename__ = "inventory"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    category = Column(String, nullable=False)
    quantity = Column(Integer, nullable=False, default=0)
    condition = Column(String, nullable=False)
    added_date = Column(Date, nullable=False)

class UploadedFile(Base):
    __tablename__ = "files"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    filepath = Column(String, nullable=False)
    category = Column(String, nullable=False)
    uploaded_at = Column(DateTime, default=datetime.utcnow)
