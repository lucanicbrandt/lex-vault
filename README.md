# LexVault.ch - Sovereign AI for Swiss Legal Firms

Private RAG infrastructure that never leaves Swiss jurisdiction.

## Stack

- **Weaviate** - Vector database
- **Verba** - RAG UI and retrieval engine
- **Azure OpenAI (Switzerland North)** - LLM & embeddings

## Quick Start

```bash
# 1. Configure Azure credentials
cp .env.example .env
# Edit .env with your Switzerland North Azure OpenAI credentials

# 2. Start the stack
./setup.sh

# 3. Access Verba UI
open http://localhost:8000
```

## Processing Legal Documents

The `ingest_legal.py` script pre-processes Swiss legal documents with awareness of legal structure:

```bash
# Single file
python scripts/ingest_legal.py document.pdf

# Folder of PDFs
python scripts/ingest_legal.py data/input/
```

**Features:**
- Chunks on Article boundaries (Art., §)
- Respects paragraph markers (Abs., Ziff., lit.)
- Preserves legal citation context
- Outputs clean text for Verba ingestion

Processed files go to `data/processed/` and can be imported via Verba's UI.

## Data Sovereignty

⚠️ **Important:** This stack is designed for Swiss data sovereignty.

- Azure OpenAI must use **Switzerland North** region
- All processing happens locally or in Swiss datacenters
- No data routes through US-based services

## Commands

```bash
# Start
docker compose up -d

# Stop
docker compose down

# View logs
docker compose logs -f

# Reset everything
docker compose down -v
```

## Deployment

For Infomaniak Jelastic deployment, see `deploy/` (coming soon).
