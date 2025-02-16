from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import resume
from .database import engine, Base

app = FastAPI(title="CV Parser API")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3002"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(resume.router, prefix="/api/cv", tags=["CV Processing"])

# Create database tables
@app.on_event("startup")
async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

@app.get("/")
async def root():
    return {"message": "CV Parser API is running"}
