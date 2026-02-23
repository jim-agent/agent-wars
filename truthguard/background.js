// TruthGuard Background Service Worker

// Track analysis results per tab
const tabAnalysis = new Map();

// Listen for analysis results from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'analysisComplete' && sender.tab) {
    tabAnalysis.set(sender.tab.id, message.result);
    updateBadge(sender.tab.id, message.result);
  }
});

// Update extension badge based on analysis
function updateBadge(tabId, analysis) {
  if (!analysis || !analysis.threats) {
    chrome.action.setBadgeText({ tabId, text: '' });
    return;
  }

  const maxSeverity = analysis.threats.length > 0 
    ? Math.max(...analysis.threats.map(t => t.severity))
    : 0;

  if (maxSeverity >= 70) {
    chrome.action.setBadgeBackgroundColor({ tabId, color: '#ef4444' });
    chrome.action.setBadgeText({ tabId, text: '!' });
  } else if (maxSeverity >= 40) {
    chrome.action.setBadgeBackgroundColor({ tabId, color: '#f59e0b' });
    chrome.action.setBadgeText({ tabId, text: '⚠' });
  } else if (analysis.threats.length > 0) {
    chrome.action.setBadgeBackgroundColor({ tabId, color: '#3b82f6' });
    chrome.action.setBadgeText({ tabId, text: String(analysis.threats.length) });
  } else {
    chrome.action.setBadgeBackgroundColor({ tabId, color: '#22c55e' });
    chrome.action.setBadgeText({ tabId, text: '✓' });
  }
}

// Clear analysis when tab is updated
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === 'loading') {
    tabAnalysis.delete(tabId);
    chrome.action.setBadgeText({ tabId, text: '' });
  }
});

// Clean up when tab is closed
chrome.tabs.onRemoved.addListener((tabId) => {
  tabAnalysis.delete(tabId);
});

// Initialize default settings
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({
    protectionEnabled: true,
    stats: { scanned: 0, blocked: 0 }
  });
});

console.log('TruthGuard background service worker initialized');
