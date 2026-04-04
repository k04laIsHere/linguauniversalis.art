#!/bin/bash
# scripts/setup_tunnel.sh
# Usage: ./setup_tunnel.sh <hostname> <local_port>

HOSTNAME=$1
PORT=$2
CLOUDFLARED_BIN="/home/andrew/.openclaw/workspace/cloudflared"

if [ -z "$HOSTNAME" ] || [ -z "$PORT" ]; then
    echo "Usage: $0 <hostname> <local_port>"
    exit 1
fi

echo "Starting Cloudflare Quick Tunnel (HTTP2 protocol) for $HOSTNAME -> localhost:$PORT"
# Using --url and --protocol http2 to avoid QUIC/UDP buffer issues
$CLOUDFLARED_BIN tunnel --protocol http2 --url http://localhost:$PORT
