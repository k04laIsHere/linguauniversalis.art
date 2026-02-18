// Консольные команды для проверки сайта Lingua Universalis
// Откройте DevTools (F12) и вставляйте эти команды

// === 1. Проверка состояния всех секций ===
function checkSections() {
  console.log('=== SECTIONS STATE ===');
  const sections = document.querySelectorAll('section[id]');
  sections.forEach(section => {
    const rect = section.getBoundingClientRect();
    const computed = getComputedStyle(section);
    console.log(`Section ${section.id}:`, {
      top: rect.top.toFixed(0),
      height: rect.height.toFixed(0),
      visible: rect.top < window.innerHeight,
      zIndex: computed.zIndex,
      position: computed.position,
      display: computed.display
    });
  });
  return sections;
}

// === 2. Проверка переходов ===
function checkScroll() {
  console.log('=== SCROLL STATE ===');
  console.log('Scroll Y:', window.scrollY);
  console.log('Viewport height:', window.innerHeight);
  console.log('Document height:', document.body.scrollHeight);
  console.log('Scroll progress:', (window.scrollY / (document.body.scrollHeight - window.innerHeight) * 100).toFixed(2) + '%');
}

// === 3. Проверка GSAP ScrollTrigger ===
function checkGSAP() {
  console.log('=== GSAP SCROLLTRIGGER ===');
  if (typeof ScrollTrigger !== 'undefined') {
    const triggers = ScrollTrigger.getAll();
    console.log('Active triggers:', triggers.length);
    triggers.forEach((trigger, i) => {
      console.log(`Trigger ${i}:`, {
        trigger: trigger.trigger,
        start: trigger.start,
        end: trigger.end,
        progress: trigger.progress.toFixed(2)
      });
    });
  } else {
    console.warn('⚠️ ScrollTrigger not loaded');
  }
}

// === 4. Проверка переполнений контента ===
function checkOverflow() {
  console.log('=== OVERFLOW CHECK ===');
  const sections = document.querySelectorAll('section[id]');
  sections.forEach(section => {
    const children = Array.from(section.children);
    const overflow = children.some(child => {
      const rect = child.getBoundingClientRect();
      const sectionRect = section.getBoundingClientRect();
      return rect.right > sectionRect.right + 50 || rect.bottom > sectionRect.bottom + 50;
    });
    if (overflow) {
      console.warn(`⚠️ ${section.id} has content overflowing!`);
    }
  });
}

// === 5. Мгновенный аудит всего ===
function fullAudit() {
  console.log('\n=== FULL AUDIT ===');
  checkSections();
  checkScroll();
  checkGSAP();
  checkOverflow();
  console.log('=== AUDIT COMPLETE ===\n');
}

// === Автоматический мониторинг (запустить один раз) ===
function startMonitoring() {
  console.log('🔍 Starting visual monitoring...');
  
  // Мониторинг переходов между секциями
  let lastActiveSection = null;
  
  setInterval(() => {
    const sections = Array.from(document.querySelectorAll('section[id]'));
    const activeSection = sections.find(section => {
      const rect = section.getBoundingClientRect();
      return rect.top >= -200 && rect.top < window.innerHeight * 0.8;
    });
    
    if (activeSection && activeSection.id !== lastActiveSection?.id) {
      console.log(`📌 Section changed: ${lastActiveSection?.id || 'start'} → ${activeSection.id}`);
      lastActiveSection = activeSection;
    }
  }, 500);

  console.log('✅ Monitoring active. Press Ctrl+Shift+C to see logs.');
  console.log('   Run fullAudit() anytime for complete check.');
}

// === Как использовать ===
console.log(`
🔧 Lingua Universalis - Visual Debug Tools

Commands:
  checkSections()      - Check all sections positions
  checkScroll()         - Check scroll state
  checkGSAP()          - Check GSAP ScrollTrigger state
  checkOverflow()       - Check for content overflow
  fullAudit()           - Run all checks
  startMonitoring()     - Start automatic monitoring

Usage:
  1. Open DevTools (F12)
  2. Paste this entire script
  3. Run commands as needed
  4. Check Console for warnings

Example:
  fullAudit();  // See everything at once
  startMonitoring();  // Watch for issues in real-time
`);
