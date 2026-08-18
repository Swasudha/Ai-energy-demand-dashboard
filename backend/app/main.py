from fastapi import FastAPI

app = FastAPI(
    title="AI Energy Demand Dashboard",
    version="1.0.0"
)


@app.get("/")
def root():
    return {
        "message": "AI Energy Demand Dashboard API is running"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }