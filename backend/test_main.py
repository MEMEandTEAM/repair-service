import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

# тесты асинхронные
pytestmark = pytest.mark.asyncio

async def test_create_request_success():
    """Тест 1: Проверка успешного создания заявки клиентом"""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        payload = {
            "client_name": "Тестовый Клиент",
            "phone": "+79990001122",
            "address": "ул. Тестовая, 1",
            "problem_text": "Сломался утюг"
        }
        response = await client.post("/api/requests", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        assert data["client_name"] == "Тестовый Клиент"
        assert data["status"] == "new"
        assert "id" in data

async def test_race_condition_protection():
    """Тест 2: Проверка защиты от состояния гонки (Race Condition)"""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Сначала создаем заявку
        create_resp = await client.post("/api/requests", json={
            "client_name": "Артур (для гонки)",
            "phone": "+89777777777",
            "address": "ул.Водная д.7",
            "problem_text": "Проблема с принтером."
        })
        req_id = create_resp.json()["id"]

        # 2. Диспетчер назначает мастера (ID = 1)
        assign_resp = await client.patch(f"/api/requests/{req_id}/assign?master_id=1")
        assert assign_resp.status_code == 200

        # 3. Мастер 1 берет в работу (успешно)
        take_resp_1 = await client.post(f"/api/requests/{req_id}/take")
        assert take_resp_1.status_code == 200

        # 4. Мастер 2 пытается взять ТУ ЖЕ заявку (эмуляция гонки/опоздания)
        take_resp_2 = await client.post(f"/api/requests/{req_id}/take")
        
        # 5. Проверяем, что второй запрос отбит со статусом 409 Conflict
        assert take_resp_2.status_code == 409
        assert "Conflict" in take_resp_2.json()["detail"]