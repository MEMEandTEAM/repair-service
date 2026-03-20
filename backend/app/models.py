from sqlalchemy import Column, Integer, String, Text, Enum as SQLEnum, ForeignKey, DateTime
from sqlalchemy.sql import func
import enum
from .database import Base

class StatusEnum(str, enum.Enum):
    new = "new"
    assigned = "assigned"
    in_progress = "in_progress"
    done = "done"
    canceled = "canceled"

class RepairRequest(Base):
    __tablename__ = "repair_requests"
    
    id = Column(Integer, primary_key=True, index=True)
    client_name = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    address = Column(String, nullable=False)
    problem_text = Column(Text, nullable=False)
    status = Column(SQLEnum(StatusEnum), default=StatusEnum.new)
    assigned_to = Column(Integer, nullable=True) # ID мастера
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())