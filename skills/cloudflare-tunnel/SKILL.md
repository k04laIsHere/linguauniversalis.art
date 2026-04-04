---
name: cloudflare-tunnel
description: "Create and manage Cloudflare Tunnels (Quick/Free) for exposing local services to the web. Use when: (1) Setting up a temporary public URL for a local app, (2) Troubleshooting tunnel failures, (3) Exposing the OpenClaw workspace for testing."
---

# Cloudflare Tunnel

This skill manages Cloudflare Tunnels using the `cloudflared` binary located in the workspace.

## Quick Start: Temporary (Free) Tunnel
To quickly expose a local port (e.g., 5173 for Vite) with a random `.trycloudflare.com` URL:

```bash
/home/andrew/.openclaw/workspace/cloudflared tunnel --protocol http2 --url http://[::1]:5173
```

**Note:** We use `http://[::1]:PORT` (IPv6 loopback) because many modern local servers (like Vite) bind to IPv6 by default. Using `localhost` or `127.0.0.1` can result in 520/530 errors if the tunnel can't reach the origin. We also use `--protocol http2` for better stability.

The public URL will be printed in the output (look for `https://...trycloudflare.com`).

## Persistent Tunnels (Requires Config)
Persistent tunnels require a `cert.pem` and `config.yml`. If these are missing, use the Quick Start method.

## Troubleshooting
If you see "name not resolved", "Error 530", or "Error 520":
1. The previous tunnel process likely died, or the connection failed to handshake.
2. **Critical:** Check which port the local service is actually running on (e.g., Vite often uses 5173). Use `ss -tulpn` or `ps aux` to verify.
3. **Important:** If `127.0.0.1` or `localhost` fails with a 520 error, try using `http://[::1]:PORT`.
4. Ensure you are using `--protocol http2`.

## Skill Scripts
- `scripts/setup_tunnel.sh`: A wrapper to start a quick tunnel on a specific port.
