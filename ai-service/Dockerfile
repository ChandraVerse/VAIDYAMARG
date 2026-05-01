# ai-service — placeholder for future ML recommendation service
# This Dockerfile ensures `docker compose build` completes without error.
# Replace with real service code when AI recommendation feature is built.
FROM python:3.11-slim

WORKDIR /app

# Install minimal dependencies for the health stub
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY main.py .

EXPOSE 8001

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8001/health')"

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001"]
