from contextlib import asynccontextmanager
from typing import Optional
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import update

from .database import engine, Base, get_db
from . import models, schemas

# таблицы
@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield

app = FastAPI(title="Repair Service API", lifespan=lifespan)

# для работы с react
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "API is running"}

# 1. Создание заявки (Клиент)
@app.post("/api/requests", response_model=schemas.RequestResponse)
async def create_request(req: schemas.RequestCreate, db: AsyncSession = Depends(get_db)):
    new_req = models.RepairRequest(**req.model_dump(), status=models.StatusEnum.new)
    db.add(new_req)
    await db.commit()
    await db.refresh(new_req)
    return new_req

# 2. Получение списка заявок (Диспетчер / Мастер) с фильтрацией
@app.get("/api/requests", response_model=list[schemas.RequestResponse])
async def get_requests(
    status: Optional[models.StatusEnum] = None, 
    assigned_to: Optional[int] = None, 
    db: AsyncSession = Depends(get_db)
):
    query = select(models.RepairRequest)
    
    if status:
        query = query.where(models.RepairRequest.status == status)
    if assigned_to:
        query = query.where(models.RepairRequest.assigned_to == assigned_to)
        
    result = await db.execute(query)
    return result.scalars().all()

# 3. Назначить мастера (Диспетчер)
@app.patch("/api/requests/{req_id}/assign")
async def assign_request(req_id: int, master_id: int, db: AsyncSession = Depends(get_db)):
    stmt = (
        update(models.RepairRequest)
        .where(models.RepairRequest.id == req_id)
        .values(status=models.StatusEnum.assigned, assigned_to=master_id)
    )
    result = await db.execute(stmt)
    await db.commit()
    
    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="Заявка не найдена")
        
    return {"message": f"Заявка {req_id} назначена на мастера {master_id}"}

# 4. Отменить заявку (Диспетчер)
@app.patch("/api/requests/{req_id}/cancel")
async def cancel_request(req_id: int, db: AsyncSession = Depends(get_db)):
    stmt = update(models.RepairRequest).where(models.RepairRequest.id == req_id).values(status=models.StatusEnum.canceled)
    await db.execute(stmt)
    await db.commit()
    return {"message": "Заявка отменена"}

# 5. Взять в работу (Мастер)
@app.post("/api/requests/{req_id}/take")
async def take_request(req_id: int, db: AsyncSession = Depends(get_db)):
    # Атомарный UPDATE: обновляем только если статус 'assigned'
    stmt = (
        update(models.RepairRequest)
        .where(models.RepairRequest.id == req_id)
        .where(models.RepairRequest.status == models.StatusEnum.assigned)
        .values(status=models.StatusEnum.in_progress)
    )
    result = await db.execute(stmt)
    await db.commit()

    # Если ни одна строка не обновилась, значит кто-то уже взял заявку (или её нет/статус другой)
    if result.rowcount == 0:
        raise HTTPException(
            status_code=409, 
            detail="Conflict: Заявка уже взята в работу другим мастером или статус изменен."
        )
    return {"message": "Заявка успешно взята в работу."}

# 6. Завершить работу (Мастер)
@app.patch("/api/requests/{req_id}/complete")
async def complete_request(req_id: int, db: AsyncSession = Depends(get_db)):
    stmt = update(models.RepairRequest).where(models.RepairRequest.id == req_id).values(status=models.StatusEnum.done)
    await db.execute(stmt)
    await db.commit()
    return {"message": "Работа по заявке завершена"}