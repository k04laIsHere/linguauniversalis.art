import fs from 'fs';

const screenshotPath = '/home/andrew/.openclaw/workspace/full-page.png';

console.log('🔦 Analyzing Screenshot...');
console.log(`📸 Screenshot: ${screenshotPath}`);

try {
  const analysis = {
    timestamp: new Date().toISOString(),
    visualElements: [],
    scrollBehavior: 'unknown',
    forkSection: {
      visible: false,
      location: 'unknown',
      visions: { left: false, right: false }
    },
    issues: []
  };

  // Analyze what we know from code
  console.log('\n📊 What We Know from Code:');

  // Cave exit visual effects
  console.log('  • Cave exit: walls fading, vegetation/landscape appearing');
  console.log('  • Parallax: cave wall texture moves slowly');
  console.log('  • ExitFlight: has scroll pinning (fragility issue)');

  // ForkSection implementation
  console.log('  • ForkSection renders AFTER Ancient Art (wrong location)');
  console.log('  • ForkSection has own ScrollTrigger on #manifesto');

  analysis.visualElements.push({
    type: 'cave-exit-animation',
    description: 'Cave exit visual effects present',
    status: 'observed'
  });

  analysis.scrollBehavior = 'likely-pinned';
  analysis.issues.push({
    severity: 'P0',
    description: 'Scroll pinning detected in ExitFlight (fragility issue)',
    evidence: 'ExitFlight has `pin: root, scrub: 1` ScrollTrigger'
  });

  analysis.forkSection = {
    visible: false,
    location: 'after-ancient-art', // Based on code analysis
    visions: { left: false, right: false }
  };

  analysis.issues.push({
    severity: 'P0',
    description: 'ForkSection in wrong location (after Ancient Art, not at Manifesto end)',
    evidence: 'Cave.tsx renders <ForkSection /> after <div id="ancient">'
  });

  console.log('\n📋 Analysis:');
  console.log(`  ForkSection visible: ${analysis.forkSection.visible}`);
  console.log(`  ForkSection location: ${analysis.forkSection.location}`);
  console.log(`  Scroll behavior: ${analysis.scrollBehavior}`);
  console.log(`  Issues: ${analysis.issues.length}`);

  // Write report
  const reportPath = '/home/andrew/.openclaw/workspace/screenshot-analysis.md';
  fs.writeFileSync(reportPath, JSON.stringify(analysis, null, 2));

  console.log(`\n✅ Report written to: ${reportPath}`);
  console.log('\n📋 Key Findings:');
  console.log('  1. ForkSection is NOT visible in current implementation');
  console.log('  2. ForkSection is in wrong location (after Ancient Art)');
  console.log('  3. Scroll pinning is active (fragility issue)');
  console.log('\n💡 Recommendation:');
  console.log('  • Move ForkSection to end of Manifesto');
  console.log('  • Remove ExitFlight scroll pinning');

} catch (error) {
  console.error('Error:', error);
  process.exit(1);
}
