// TruthGuard Content Script
// Analyzes page content for fake news, misinformation, scams, etc.

let analysisResult = null;
let isAnalyzing = false;

// Known fake news indicators
const FAKE_NEWS_PATTERNS = [
  /BREAKING:?\s*(?:SHOCKING|EXCLUSIVE|YOU WON'T BELIEVE)/i,
  /doctors\s+(?:hate|don't want you to know)/i,
  /one\s+weird\s+trick/i,
  /(?:BIG\s+)?PHARMA\s+DOESN'T\s+WANT/i,
  /mainstream\s+media\s+(?:lies|won't\s+tell)/i,
  /(?:they|government)\s+don't\s+want\s+you\s+to\s+know/i,
  /exposed:?\s*the\s+truth/i,
  /wake\s+up\s+sheeple/i,
];

// Scam/phishing indicators
const SCAM_PATTERNS = [
  /congratulations!?\s*you(?:'ve)?\s+won/i,
  /claim\s+your\s+(?:prize|reward|bitcoin)/i,
  /(?:act|respond)\s+(?:now|immediately|fast)/i,
  /limited\s+time\s+(?:offer|only)/i,
  /verify\s+your\s+(?:account|identity|password)/i,
  /urgent:?\s*(?:action|response)\s+required/i,
  /your\s+account\s+(?:has\s+been|will\s+be)\s+(?:suspended|locked)/i,
  /(?:click|tap)\s+here\s+to\s+(?:claim|verify|unlock)/i,
  /(?:\$\d+(?:,\d{3})*|\d+\s*(?:BTC|ETH))\s+(?:waiting|available)/i,
];

// Clickbait patterns
const CLICKBAIT_PATTERNS = [
  /you\s+won't\s+believe/i,
  /what\s+happened\s+next\s+(?:will\s+)?(?:shock|amaze)/i,
  /number\s+\d+\s+will\s+(?:shock|surprise)/i,
  /(?:this|these)\s+\d+\s+(?:things|facts|secrets)/i,
  /(?:scientists|experts)\s+(?:hate|are\s+baffled)/i,
  /gone\s+(?:wrong|sexual)/i,
];

// Known unreliable domains (demo list)
const UNRELIABLE_DOMAINS = [
  'naturalnews.com',
  'infowars.com',
  'beforeitsnews.com',
  'worldnewsdailyreport.com',
  'theonion.com', // Satire
  'babylonbee.com', // Satire
];

// Satire sites (should be flagged differently)
const SATIRE_DOMAINS = [
  'theonion.com',
  'babylonbee.com',
  'clickhole.com',
  'thebeaverton.com',
];

class TruthGuard {
  constructor() {
    this.threats = [];
    this.pageText = '';
    this.domain = window.location.hostname;
  }

  async analyze() {
    this.threats = [];
    this.pageText = document.body?.innerText || '';
    
    // Check domain reputation
    this.checkDomain();
    
    // Check for fake news patterns
    this.checkFakeNewsPatterns();
    
    // Check for scam/phishing
    this.checkScamPatterns();
    
    // Check for clickbait
    this.checkClickbaitPatterns();
    
    // Check for suspicious forms
    this.checkSuspiciousForms();
    
    // Check SSL
    this.checkSSL();
    
    // Analyze content quality
    this.analyzeContentQuality();
    
    return {
      url: window.location.href,
      domain: this.domain,
      threats: this.threats,
      analyzedAt: new Date().toISOString(),
      safetyScore: this.calculateSafetyScore()
    };
  }

  checkDomain() {
    const domain = this.domain.replace(/^www\./, '');
    
    if (SATIRE_DOMAINS.some(d => domain.includes(d))) {
      this.threats.push({
        type: 'Satire Site',
        severity: 30,
        description: 'This is a known satire/parody website. Content is not meant to be taken seriously.'
      });
    } else if (UNRELIABLE_DOMAINS.some(d => domain.includes(d))) {
      this.threats.push({
        type: 'Fake News',
        severity: 85,
        description: 'This domain is known for publishing unreliable or false information.'
      });
    }
  }

  checkFakeNewsPatterns() {
    const matches = [];
    FAKE_NEWS_PATTERNS.forEach(pattern => {
      const match = this.pageText.match(pattern);
      if (match) matches.push(match[0]);
    });
    
    if (matches.length > 0) {
      this.threats.push({
        type: 'Misinformation',
        severity: Math.min(40 + matches.length * 15, 90),
        description: `Found ${matches.length} suspicious phrase(s) commonly used in fake news.`
      });
    }
  }

  checkScamPatterns() {
    const matches = [];
    SCAM_PATTERNS.forEach(pattern => {
      const match = this.pageText.match(pattern);
      if (match) matches.push(match[0]);
    });
    
    if (matches.length > 0) {
      this.threats.push({
        type: 'Scam',
        severity: Math.min(60 + matches.length * 10, 95),
        description: `Detected ${matches.length} scam/phishing indicator(s). Be very careful!`
      });
    }
  }

  checkClickbaitPatterns() {
    const matches = [];
    CLICKBAIT_PATTERNS.forEach(pattern => {
      const match = this.pageText.match(pattern);
      if (match) matches.push(match[0]);
    });
    
    if (matches.length > 0) {
      this.threats.push({
        type: 'Clickbait',
        severity: Math.min(20 + matches.length * 10, 50),
        description: `Found ${matches.length} clickbait pattern(s). Content may be sensationalized.`
      });
    }
  }

  checkSuspiciousForms() {
    const forms = document.querySelectorAll('form');
    const passwordFields = document.querySelectorAll('input[type="password"]');
    const creditCardPatterns = document.querySelectorAll('input[name*="card"], input[name*="credit"], input[placeholder*="card"]');
    
    // Check for password fields on non-HTTPS
    if (passwordFields.length > 0 && !window.location.protocol.includes('https')) {
      this.threats.push({
        type: 'Phishing',
        severity: 90,
        description: 'Password field detected on non-secure (HTTP) page. Never enter passwords here!'
      });
    }
    
    // Check for credit card fields on suspicious domains
    if (creditCardPatterns.length > 0) {
      const trustedPayment = /paypal|stripe|square|braintree|shopify/i.test(this.domain);
      if (!trustedPayment) {
        this.threats.push({
          type: 'Scam',
          severity: 70,
          description: 'Credit card input detected. Verify this is a legitimate payment page before entering details.'
        });
      }
    }
  }

  checkSSL() {
    if (!window.location.protocol.includes('https')) {
      this.threats.push({
        type: 'Security',
        severity: 40,
        description: 'This page is not using HTTPS encryption. Your data may not be secure.'
      });
    }
  }

  analyzeContentQuality() {
    // Check for excessive capitalization (shouting)
    const capsRatio = (this.pageText.match(/[A-Z]/g) || []).length / this.pageText.length;
    if (capsRatio > 0.3) {
      this.threats.push({
        type: 'Low Quality',
        severity: 25,
        description: 'Excessive capitalization detected. This is often used in sensationalized content.'
      });
    }
    
    // Check for excessive exclamation marks
    const exclamationCount = (this.pageText.match(/!/g) || []).length;
    if (exclamationCount > 10 && exclamationCount / this.pageText.length > 0.002) {
      this.threats.push({
        type: 'Clickbait',
        severity: 20,
        description: 'Excessive exclamation marks detected. Content may be overly sensationalized.'
      });
    }
  }

  calculateSafetyScore() {
    if (this.threats.length === 0) return 100;
    const maxSeverity = Math.max(...this.threats.map(t => t.severity));
    const avgSeverity = this.threats.reduce((a, t) => a + t.severity, 0) / this.threats.length;
    return Math.max(0, Math.round(100 - (maxSeverity * 0.6 + avgSeverity * 0.4)));
  }
}

// Show warning overlay for dangerous pages
function showWarningOverlay(analysis) {
  if (!analysis.threats.some(t => t.severity >= 70)) return;
  
  const overlay = document.createElement('div');
  overlay.id = 'truthguard-warning';
  overlay.innerHTML = `
    <div class="tg-warning-content">
      <div class="tg-warning-icon">⚠️</div>
      <h2>TruthGuard Warning</h2>
      <p>This page contains potentially harmful content:</p>
      <ul>
        ${analysis.threats.filter(t => t.severity >= 50).map(t => 
          `<li><strong>${t.type}:</strong> ${t.description}</li>`
        ).join('')}
      </ul>
      <div class="tg-buttons">
        <button id="tg-leave">Leave Page</button>
        <button id="tg-continue">Continue Anyway</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  
  document.getElementById('tg-leave').addEventListener('click', () => {
    window.history.back();
  });
  
  document.getElementById('tg-continue').addEventListener('click', () => {
    overlay.remove();
  });
}

// Initialize
async function init() {
  const settings = await chrome.storage.local.get(['protectionEnabled']);
  if (settings.protectionEnabled === false) return;
  
  const guard = new TruthGuard();
  analysisResult = await guard.analyze();
  
  // Update stats
  const stats = (await chrome.storage.local.get(['stats'])).stats || { scanned: 0, blocked: 0 };
  stats.scanned++;
  if (analysisResult.threats.some(t => t.severity >= 70)) {
    stats.blocked++;
    showWarningOverlay(analysisResult);
  }
  await chrome.storage.local.set({ stats });
  
  // Notify background script
  chrome.runtime.sendMessage({
    action: 'analysisComplete',
    result: analysisResult
  });
}

// Message handler
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getAnalysis') {
    sendResponse(analysisResult);
    return true;
  }
  
  if (message.action === 'scan') {
    init().then(() => sendResponse({ success: true }));
    return true;
  }
});

// Run on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
