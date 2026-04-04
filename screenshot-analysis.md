{
  "timestamp": "2026-02-19T09:10:03.060Z",
  "visualElements": [
    {
      "type": "cave-exit-animation",
      "description": "Cave exit visual effects present",
      "status": "observed"
    }
  ],
  "scrollBehavior": "likely-pinned",
  "forkSection": {
    "visible": false,
    "location": "after-ancient-art",
    "visions": {
      "left": false,
      "right": false
    }
  },
  "issues": [
    {
      "severity": "P0",
      "description": "Scroll pinning detected in ExitFlight (fragility issue)",
      "evidence": "ExitFlight has `pin: root, scrub: 1` ScrollTrigger"
    },
    {
      "severity": "P0",
      "description": "ForkSection in wrong location (after Ancient Art, not at Manifesto end)",
      "evidence": "Cave.tsx renders <ForkSection /> after <div id=\"ancient\">"
    }
  ]
}