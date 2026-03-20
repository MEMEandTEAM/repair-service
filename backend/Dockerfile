FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .

# Принудительно ставим таймаут 1000 секунд и указываем прямой сервер pypi
RUN pip install --default-timeout=1000 --no-cache-dir -r requirements.txt -i https://pypi.org/simple/

COPY . .
CMD ["sh", "-c", "sleep 5 && python seed.py && uvicorn app.main:app --host 0.0.0.0 --port 8000"]