#!/bin/bash

# Start dev server with ngrok tunnel
# Usage: ./start-dev-with-tunnel.sh

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR" || exit 1

echo "🚀 Starting dev server with ngrok tunnel..."
echo "Project: $PROJECT_DIR"
echo ""

# Check if dev server is already running
if pgrep -f "vite.*5173" > /dev/null; then
    echo "⚠️  Dev server already running on port 5173"
    echo "   Killing existing instance..."
    pkill -f "vite.*5173"
    sleep 2
fi

# Check if ngrok is already running
if pgrep -f "ngrok.*http.*5173" > /dev/null; then
    echo "⚠️  Ngrok already running for port 5173"
    echo "   Killing existing instance..."
    pkill -f "ngrok.*http.*5173"
    sleep 2
fi

# Start dev server in background
echo "1️⃣  Starting dev server (npm run dev -- --host)..."
npm run dev -- --host > /tmp/vite-dev.log 2>&1 &
VITE_PID=$!
echo "   PID: $VITE_PID"

# Wait for dev server to start
echo "   Waiting for dev server to be ready..."
sleep 5

# Start ngrok in background
echo ""
echo "2️⃣  Starting ngrok tunnel..."
ngrok http 5173 --log=stdout > /tmp/ngrok.log 2>&1 &
NGROK_PID=$!
echo "   PID: $NGROK_PID"

# Wait a bit for ngrok to start and get the URL
sleep 5

# Try to extract the URL from ngrok
NGROK_URL=$(grep -oP 'https://[a-z0-9-]+\.ngrok-free\.app' /tmp/ngrok.log | head -n 1)

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 Ready!"
echo ""
if [ -n "$NGROK_URL" ]; then
    echo "📡 Public URL: $NGROK_URL"
else
    echo "📡 URL may still be loading. Check: cat /tmp/ngrok.log"
fi
echo "🏠 Local URL: http://localhost:5173"
echo ""
echo "PIDs:"
echo "   Vite: $VITE_PID"
echo "   Ngrok: $NGROK_PID"
echo ""
echo "Logs:"
echo "   Vite: tail -f /tmp/vite-dev.log"
echo "   Ngrok: tail -f /tmp/ngrok.log"
echo ""
echo "To stop:"
echo "   kill $VITE_PID $NGROK_PID"
echo "   Or: pkill -f 'vite.*5173' && pkill -f 'ngrok.*5173'"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
