FROM python:3.10-slim
WORKDIR /bot
RUN pip install --upgrade pip
COPY requirements .
RUN pip install -r requirements
COPY school_filter .
COPY bot.py .
CMD ["python", "bot.py"]
