FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY ventara_ml_core.py .
EXPOSE 8000
CMD ["uvicorn", "ventara_ml_core:app", "--host", "0.0.0.0", "--port", "8000"]
