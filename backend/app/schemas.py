from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime
from .models import StatusEnum

# Схема для создания заявки (что шлет клиент)
class RequestCreate(BaseModel):
    client_name: str
    phone: str
    address: str
    problem_text: str

# Схема для ответа (что возвращает API)
class RequestResponse(BaseModel):
    id: int
    client_name: str
    phone: str
    address: str
    problem_text: str
    status: StatusEnum
    assigned_to: Optional[int]
    created_at: datetime
    updated_at: Optional[datetime]

    model_config = ConfigDict(from_attributes=True)