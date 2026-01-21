import os
import time
from typing import List, Dict
import logging
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("rag")

# Configuration
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY", "")
PINECONE_INDEX_NAME = "jarvis-memory"
OLLAMA_MODEL = "llama3"

class JarvisBrain:
    def __init__(self):
        self.mock_mode = False
        self.pc = None
        self.index = None
        self.llm = None
        self.embeddings = None
        
        # 1. Initialize Embeddings (Local)
        try:
            from langchain_huggingface import HuggingFaceEmbeddings
            logger.info("Loading embedding model...")
            self.embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
        except ImportError:
            logger.warning("langchain_huggingface not installed. Running in MOCK mode.")
            self.mock_mode = True
        except Exception as e:
            logger.error(f"Failed to load embeddings: {e}")
            self.mock_mode = True

        # 2. Initialize Pinecone
        if not PINECONE_API_KEY:
            logger.warning("PINECONE_API_KEY not found. Running in MOCK mode (no memory).")
            self.mock_mode = True
        else:
            try:
                from pinecone import Pinecone, ServerlessSpec
                self.pc = Pinecone(api_key=PINECONE_API_KEY)
                # Check if index exists, else create
                existing_indexes = [i.name for i in self.pc.list_indexes()]
                if PINECONE_INDEX_NAME not in existing_indexes:
                    logger.info(f"Creating index {PINECONE_INDEX_NAME}...")
                    self.pc.create_index(
                        name=PINECONE_INDEX_NAME,
                        dimension=384,
                        metric="cosine",
                        spec=ServerlessSpec(cloud="aws", region="us-east-1")
                    )
                self.index = self.pc.Index(PINECONE_INDEX_NAME)
            except ImportError:
                logger.warning("pinecone-client not installed. Running in MOCK mode.")
                self.mock_mode = True
            except Exception as e:
                logger.error(f"Pinecone connection failed: {e}. Switching to MOCK mode.")
                self.mock_mode = True

        # 3. Initialize LLM (Ollama)
        try:
            from langchain_community.llms import Ollama
            self.llm = Ollama(model=OLLAMA_MODEL)
        except ImportError:
             logger.warning("langchain_community not installed. LLM disabled.")
        except Exception as e:
            logger.error(f"Failed to connect to Ollama: {e}")

    def ingest(self, text: str):
        """Store text in vector DB"""
        if self.mock_mode or not self.index or not self.embeddings:
            return "Mock Ingestion: stored (memory volatile) - Install dependencies for persistence."
        
        try:
            vector = self.embeddings.embed_query(text)
            doc_id = str(time.time())
            metadata = {"text": text}
            self.index.upsert(vectors=[(doc_id, vector, metadata)])
            return "Ingested into Pinecone."
        except Exception as e:
            return f"Ingestion failed: {e}"

    def chat(self, user_query: str) -> str:
        """RAG Pipeline: Retrieve -> Augment -> Generate"""
        context = ""
        
        # Retrieval
        if not self.mock_mode and self.index and self.embeddings:
            try:
                query_vec = self.embeddings.embed_query(user_query)
                results = self.index.query(vector=query_vec, top_k=3, include_metadata=True)
                contexts = [match["metadata"]["text"] for match in results["matches"] if "metadata" in match]
                context = "\n".join(contexts)
            except Exception as e:
                logger.error(f"Retrieval error: {e}")
            
        # Generation
        prompt = f"""You are Jarvis, a helpful AI assistant.
        Context from memory:
        {context}
        
        User Question: {user_query}
        
        Answer:"""
        
        try:
            if self.llm:
                return self.llm.invoke(prompt)
            else:
                return f"[Mock Jarvis]: I received: '{user_query}'. \n\n(Note: Ollama/LangChain not detected. Real LLM disabled. Install dependencies to fix.)"
        except Exception as e:
             return f"Error communicating with LLM: {str(e)}"

# Singleton instance
jarvis = JarvisBrain()
