import asyncio
from app.database import engine, Base, AsyncSessionLocal
from app.models import RepairRequest, StatusEnum

async def seed_data():
    # Создаем таблицы
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    # Добавляем тестовую заявку (если база пустая)
    async with AsyncSessionLocal() as db:
        new_req = RepairRequest(
            client_name="Антон(тест)",
            phone="+79991234567",
            address="ул. Проверки, 42",
            problem_text="Нужно починить срочно",
            status=StatusEnum.assigned,
            assigned_to=1
        )
        new_req_2 = RepairRequest(
            client_name="Олег(тест)",
            phone="+7999999999",
            address="ул. Починки, 52",
            problem_text="Компьтер не работает",
            status=StatusEnum.in_progress,
            assigned_to=1
        )
        db.add(new_req)
        db.add(new_req_2)
        await db.commit()
        print("База данных успешно инициализирована тестовыми данными!")

if __name__ == "__main__":
    asyncio.run(seed_data())