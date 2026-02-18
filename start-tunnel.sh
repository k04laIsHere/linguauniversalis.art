#!/bin/bash

# Simple wrapper for OpenClaw to start dev server + ngrok
# Run this from OpenClaw exec: /path/to/start-tunnel.sh

cd /root/.openclaw/workspace/projects/linguauniversalis.art

# Kill any existing processes on port 5173
pkill -f "vite.*5173" 2>/dev/null || true
pkill -f "ngrok.*http.*5173" 2>/dev/null || true
sleep 2

# Start dev server in background
npm run dev -- --host > /tmp/vite-dev.log 2>&1 &
VITE_PID=$!

# Wait for it to start
sleep 5

# Start ngrok
ngrok http 5173 > /tmp/ngrok.log 2>&1 &
NGROK_PID=$!

# Wait for ngrok URL
sleep 5

# Get URL
NGROK_URL=$(grep -oP 'https://[a-z0-9-]+\.ngrok-free\.app' /tmp/ngrok.log 2>/dev/null | head -n 1)

echo "DEV_SERVER_PID=$VITE_PID"
echo "NGROK_PID=$NGROK_PID"
if [ -n "$NGROK_URL" ]; then
    echo "PUBLIC_URL=$NGROK_URL"
else
    echo "PUBLIC_URL=Loading... check /tmp/ngrok.log"
fi
echo "LOCAL_URL=http://localhost:5173"
