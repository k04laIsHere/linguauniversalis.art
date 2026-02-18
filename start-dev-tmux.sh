#!/bin/bash

# Start dev server and ngrok in tmux sessions

cd /root/.openclaw/workspace/projects/linguauniversalis.art

echo "🚀 Starting dev server and ngrok in tmux sessions..."
echo ""

# Kill any existing processes
tmux kill-session -t dev-server 2>/dev/null || true
tmux kill-session -t ngrok-tunnel 2>/dev/null || true
pkill -f "vite.*5173" 2>/dev/null || true
pkill -f "ngrok.*5173" 2>/dev/null || true
sleep 2

# Create tmux sessions (detached)
echo "1️⃣  Creating dev-server session..."
tmux new-session -d -s dev-server -n server "npm run dev -- --host"
echo "   Session: dev-server"

echo ""
echo "2️⃣  Creating ngrok-tunnel session..."
tmux new-session -d -s ngrok-tunnel -n tunnel "ngrok http 5173"
echo "   Session: ngrok-tunnel"

# Wait for ngrok to start
sleep 8

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Sessions:"
echo "   dev-server  → Vite on http://localhost:5173"
echo "   ngrok-tunnel → ngrok tunnel"

echo ""
echo "📡 Ngrok URL:"
NGROK_OUTPUT=$(tmux capture-pane -t ngrok-tunnel -p)
NGROK_URL=$(echo "$NGROK_OUTPUT" | grep -oP 'https://[a-z0-9-]+\.ngrok-free\.app' | head -n 1)

if [ -n "$NGROK_URL" ]; then
    echo "   $NGROK_URL"
else
    echo "   Loading... check: tmux attach -t ngrok-tunnel"
fi

echo ""
echo "🔧 Management:"
echo "   tmux ls              — list all sessions"
echo "   tmux attach -t dev-server    — attach to dev server"
echo "   tmux attach -t ngrok-tunnel  — attach to ngrok"
echo "   tmux capture-pane -t ngrok-tunnel -p  — see output"
echo ""
echo "🛑 Stop all:"
echo "   tmux kill-server"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
