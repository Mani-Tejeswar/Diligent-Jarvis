from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from rag import jarvis
import logging

app = FastAPI(title="Jarvis Backend")

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all for dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logger = logging.getLogger("api")

class ChatRequest(BaseModel):
    message: str

class IngestRequest(BaseModel):
    text: str

@app.get("/")
def read_root():
    return {"status": "Jarvis is online"}

@app.post("/chat")
def chat_endpoint(req: ChatRequest):
    try:
        response = jarvis.chat(req.message)
        return {"response": response}
    except Exception as e:
        logger.error(f"Chat failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ingest")
def ingest_endpoint(req: IngestRequest):
    try:
        msg = jarvis.ingest(req.text)
        return {"status": "success", "message": msg}
    except Exception as e:
        logger.error(f"Ingest failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
