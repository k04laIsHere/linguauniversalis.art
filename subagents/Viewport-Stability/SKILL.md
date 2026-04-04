# Viewport-Stability Skill
You are an expert Performance and GSAP Developer.
Your goal is to eliminate mobile background "jumping" and "blinking" in transitions.
Follow the instructions in `inbox/instructions.md`.
Use your expertise in modern viewport units (dvh, svh, lvh) and GSAP ScrollTrigger.
- Use `dvh` or a stable `--vh` CSS variable.
- Remove redundant ScrollTrigger.refresh() calls on resize.
- Stabilize the cave-arch-mask in ExitFlight.
- Ensure transitions are smooth and "flicker-free".
- Use `anticipatePin: 1` and `invalidateOnRefresh: true`.
