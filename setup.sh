#!/bin/bash
# LexVault.ch - Local Development Setup

set -e

echo "🏛️  LexVault.ch - Setup"
echo "========================"

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found. Please install Docker first."
    exit 1
fi

if ! command -v docker compose &> /dev/null; then
    echo "❌ Docker Compose not found. Please install Docker Compose."
    exit 1
fi

# Check .env
if [ ! -f .env ]; then
    echo "⚠️  No .env file found."
    echo "   Copying .env.example → .env"
    cp .env.example .env
    echo ""
    echo "📝 IMPORTANT: Edit .env with your Azure OpenAI credentials"
    echo "   - AZURE_OPENAI_ENDPOINT_CH (Switzerland North!)"
    echo "   - AZURE_OPENAI_KEY"
    echo ""
    read -p "Press Enter after editing .env, or Ctrl+C to exit..."
fi

# Validate Azure endpoint is Swiss
source .env
if [[ ! "$AZURE_OPENAI_ENDPOINT_CH" =~ switzerlandnorth|switzerland ]]; then
    echo "⚠️  WARNING: Your Azure endpoint doesn't appear to be in Switzerland."
    echo "   For data sovereignty, use Switzerland North region."
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo ""
echo "🚀 Starting containers..."
docker compose up -d

echo ""
echo "⏳ Waiting for Weaviate to be ready..."
timeout=60
while [ $timeout -gt 0 ]; do
    if curl -s http://localhost:8080/v1/.well-known/ready > /dev/null 2>&1; then
        echo "✅ Weaviate is ready"
        break
    fi
    sleep 2
    timeout=$((timeout - 2))
done

if [ $timeout -le 0 ]; then
    echo "❌ Weaviate failed to start. Check logs: docker compose logs weaviate"
    exit 1
fi

echo ""
echo "⏳ Waiting for Verba to be ready..."
timeout=90
while [ $timeout -gt 0 ]; do
    if curl -s http://localhost:8000 > /dev/null 2>&1; then
        echo "✅ Verba is ready"
        break
    fi
    sleep 2
    timeout=$((timeout - 2))
done

if [ $timeout -le 0 ]; then
    echo "❌ Verba failed to start. Check logs: docker compose logs verba"
    exit 1
fi

echo ""
echo "=========================================="
echo "✅ LexVault.ch is running!"
echo ""
echo "📊 Weaviate:  http://localhost:8080"
echo "🔍 Verba UI:  http://localhost:8000"
echo ""
echo "To process legal documents:"
echo "  python scripts/ingest_legal.py data/input/"
echo ""
echo "To stop:"
echo "  docker compose down"
echo "=========================================="
