FROM python:3.8-slim
WORKDIR /app
COPY dist/ /app
CMD ["python3", "-m", "http.server", "8000", "--bind", "0.0.0.0"]