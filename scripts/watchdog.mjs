import fs from 'fs';
import path from 'path';

const STATE_PATH = 'subagents/state.json';
const LOG_PATH = 'subagents/watchdog.log';

function log(msg) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${msg}`);
    fs.appendFileSync(LOG_PATH, `[${timestamp}] ${msg}\n`);
}

async function runCycle() {
    log('Starting watchdog cycle...');
    if (!fs.existsSync(STATE_PATH)) {
        log('Error: state.json not found.');
        return;
    }

    const state = JSON.parse(fs.readFileSync(STATE_PATH, 'utf8'));
    state.cycleCount += 1;
    
    // Check if time is up (6 hours)
    const now = Date.now() / 1000;
    if (now > state.startTime + (state.durationHours * 3600)) {
        log('6-hour window completed. Watchdog stopping.');
        process.exit(0);
    }

    log(`Cycle ${state.cycleCount} processing...`);

    // We rely on the Orchestrator (main agent) to send actual messages via sessions_send 
    // since the watchdog script is a simple CLI tool.
    // This script will output the "Nudge List" which the main agent will process.
    
    const nudges = [];
    const audits = [];

    state.tasks.forEach(task => {
        if (task.status === 'developing' || task.status === 'fixing') {
            const lastUpdate = task.lastUpdate || 0;
            if (now - lastUpdate > 1800) { // 30 minutes
                nudges.push(task);
            }
        }
        if (task.status === 'ready_for_audit') {
            audits.push(task);
        }
    });

    fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2));
    
    console.log(JSON.stringify({ nudges, audits, cycleCount: state.cycleCount }));
}

runCycle();
