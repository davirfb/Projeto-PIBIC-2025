import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base, engine
from app.routers import auth, usuarios, cursos, questionarios, respostas, relatorio_cpa

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Sistema de Avaliação IFB",
    version="1.0.0",
    description="API REST para avaliação periódica de cursos — IFB Campus Brasília",
)

_origins_env = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173")
_allowed_origins = [o.strip() for o in _origins_env.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(usuarios.router)
app.include_router(cursos.router)
app.include_router(questionarios.router)
app.include_router(respostas.router)
app.include_router(relatorio_cpa.router)


@app.get("/health")
def health():
    return {"status": "ok"}
