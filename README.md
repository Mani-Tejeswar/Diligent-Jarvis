# Jarvis - Local AI Assistant

**Diligent Jarvis** is a clear, self-hosted AI assistant that runs locally on your machine. It uses a **Local LLM** (Ollama) for privacy and zero cost, and **Pinecone** for long-term memory (RAG).

![Jarvis UI](https://via.placeholder.com/800x400?text=Jarvis+UI+Preview)

## ✨ Features

- **🧠 Local Intelligence**: Powered by `tinyllama` (or `llama3`), running 100% locally via Ollama.
- **📚 Long-Term Memory**: Stores conversations and ingested text in a Vector Database (Pinecone).
- **⚡ RAG Pipeline**: Retrieval-Augmented Generation allows Jarvis to "read" and answer questions about specific documents you provide.
- **🎨 Premium UI**: A beautiful, dark-themed React interface with glassmorphism effects.
- **🚀 One-Click Start**: Simple batch script to launch the entire stack.

## 🛠️ Tech Stack

- **Frontend**: React, Vite, TailwindCSS, Framer Motion
- **Backend**: FastAPI, Python
- **AI Engine**: Ollama (LangChain)
- **Vector DB**: Pinecone
- **Embeddings**: HuggingFace (`all-MiniLM-L6-v2`)

## 🚀 Getting Started

### Prerequisites

1.  **Ollama**: [Download Ollama](https://ollama.com/) and run `ollama pull tinyllama`.
2.  **Pinecone Account**: Get a free API Key from [Pinecone](https://app.pinecone.io/).
3.  **Python & Node.js**: Ensure these are installed on your system.

### Installation

1.  **Clone the repo**
    ```bash
    git clone https://github.com/Mani-Tejeswar/Diligent-Jarvis.git
    cd Diligent-Jarvis
    ```

2.  **Configure Credentials**
    Create a `.env` file in the `backend/` directory:
    ```env
    PINECONE_API_KEY=your_key_here
    PINECONE_INDEX_NAME=jarvis-index
    PINECONE_HOST=your_host_url
    OLLAMA_MODEL=tinyllama
    ```

3.  **Launch!**
    Double-click `start_jarvis.bat` (Windows).

    *Or manual launch:*
    - Backend: `cd backend && python -m venv venv && venv\Scripts\activate && pip install -r requirements.txt && uvicorn main:app --reload`
    - Frontend: `cd frontend && npm install && npm run dev`

## 📖 Usage

1.  **Chat**: Type standard queries in the main chat window.
2.  **Teach**:
    - Open the **Sidebar**.
    - Paste text (articles, notes, code).
    - Click **Update Database**.
    - Ask Jarvis about what you just pasted!

## 🤝 Contributing

Feel free to fork and submit PRs!
