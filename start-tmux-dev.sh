#!/bin/bash

# Start dev server and ngrok in tmux sessions (production-ready)

cd /root/.openclaw/workspace/projects/linguauniversalis.art

echo "🚀 Starting development environment with ngrok tunnel..."
echo ""

# Kill existing sessions and processes
tmux kill-session -t dev-server 2>/dev/null || true
tmux kill-session -t ngrok-tunnel 2>/dev/null || true
pkill -f "vite.*5173" 2>/dev/null || true
pkill -f "ngrok.*5173" 2>/dev/null || true
sleep 2

# Start dev server in background
echo "1️⃣  Starting Vite dev server..."
npm run dev -- --host > /tmp/vite-dev.log 2>&1 &
VITE_PID=$!
sleep 5

# Create tmux sessions
echo "2️⃣  Creating tmux sessions..."
tmux new-session -d -s dev-server -n server "tail -f /tmp/vite-dev.log"
tmux new-session -d -s ngrok-tunnel -n tunnel "ngrok http 127.0.0.1:5173"
sleep 8

# Get ngrok URL
NGROK_OUTPUT=$(tmux capture-pane -t ngrok-tunnel -p)
NGROK_URL=$(echo "$NGROK_OUTPUT" | grep -oP 'https://[a-z0-9-]+\.ngrok-free\.(dev|app|io)' | head -n 1)

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Development environment ready!"
echo ""
echo "📡 Public URL:"
if [ -n "$NGROK_URL" ]; then
    echo "   $NGROK_URL"
else
    echo "   Check: tmux attach -t ngrok-tunnel"
fi
echo ""
echo "🏠 Local: http://localhost:5173"
echo ""
echo "📊 tmux sessions:"
echo "   dev-server   → Vite output"
echo "   ngrok-tunnel → Ngrok tunnel"
echo ""
echo "🔧 Commands:"
echo "   tmux ls                           — list sessions"
echo "   tmux attach -t dev-server         — view Vite output"
echo "   tmux attach -t ngrok-tunnel       — view ngrok output"
echo "   tmux capture-pane -t ngrok-tunnel -p  — get ngrok URL"
echo ""
echo "🛑 Stop all:"
echo "   tmux kill-server"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
