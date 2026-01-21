@echo off
echo ===================================================
echo       STARTING JARVIS - LOCAL AI ASSISTANT
echo ===================================================

echo [1/2] Launching Backend (FastAPI + Pinecone + Ollama)...
start "Jarvis Backend" cmd /k "cd backend && venv\Scripts\activate && uvicorn main:app --reload --port 8000"

echo [2/2] Launching Frontend (React UI)...
cd frontend
echo Installing missing dependencies if any...
call npm install
echo Starting Frontend Server...
start "Jarvis UI" cmd /k "npm run dev"

echo ===================================================
echo  Startup Initiated!
echo  Please wait for the windows to open.
echo  Access UI at: http://localhost:5173
echo ===================================================
pause
