// TruthGuard Popup Logic
document.addEventListener('DOMContentLoaded', async () => {
  const statusIcon = document.getElementById('statusIcon');
  const statusText = document.getElementById('statusText');
  const threatsList = document.getElementById('threatsList');
  const scanBtn = document.getElementById('scanBtn');
  const protectionToggle = document.getElementById('protectionToggle');
  const statsScanned = document.getElementById('statsScanned');
  const statsBlocked = document.getElementById('statsBlocked');

  // Load settings
  const settings = await chrome.storage.local.get(['protectionEnabled', 'stats']);
  protectionToggle.checked = settings.protectionEnabled !== false;
  
  if (settings.stats) {
    statsScanned.textContent = settings.stats.scanned || 0;
    statsBlocked.textContent = settings.stats.blocked || 0;
  }

  // Toggle protection
  protectionToggle.addEventListener('change', async () => {
    await chrome.storage.local.set({ protectionEnabled: protectionToggle.checked });
    updateStatus(protectionToggle.checked ? 'protected' : 'disabled');
  });

  // Get current tab analysis
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  if (tab && tab.id) {
    try {
      const response = await chrome.tabs.sendMessage(tab.id, { action: 'getAnalysis' });
      if (response) {
        displayAnalysis(response);
      }
    } catch (e) {
      // Content script not loaded yet
      updateStatus('scanning');
    }
  }

  // Manual scan button
  scanBtn.addEventListener('click', async () => {
    scanBtn.disabled = true;
    scanBtn.innerHTML = '<span class="loading"></span> Scanning...';
    
    if (tab && tab.id) {
      await chrome.tabs.sendMessage(tab.id, { action: 'scan' });
      
      // Wait for analysis
      setTimeout(async () => {
        try {
          const response = await chrome.tabs.sendMessage(tab.id, { action: 'getAnalysis' });
          if (response) {
            displayAnalysis(response);
          }
        } catch (e) {
          console.error('Scan error:', e);
        }
        scanBtn.disabled = false;
        scanBtn.innerHTML = '🔍 Scan Page';
      }, 2000);
    }
  });

  function displayAnalysis(analysis) {
    threatsList.innerHTML = '';
    
    if (!analysis.threats || analysis.threats.length === 0) {
      updateStatus('safe');
      threatsList.innerHTML = '<div class="no-threats">✅ No threats detected on this page</div>';
      return;
    }

    const maxThreat = Math.max(...analysis.threats.map(t => t.severity));
    if (maxThreat >= 80) {
      updateStatus('danger');
    } else if (maxThreat >= 50) {
      updateStatus('warning');
    } else {
      updateStatus('safe');
    }

    analysis.threats.forEach(threat => {
      const item = document.createElement('div');
      item.className = `threat-item ${threat.severity >= 80 ? 'high' : threat.severity >= 50 ? 'medium' : 'low'}`;
      item.innerHTML = `
        <div class="threat-header">
          <span class="threat-type">${getThreatIcon(threat.type)} ${threat.type}</span>
          <span class="threat-severity">${threat.severity}%</span>
        </div>
        <div class="threat-description">${threat.description}</div>
      `;
      threatsList.appendChild(item);
    });
  }

  function updateStatus(status) {
    statusIcon.className = 'status-icon';
    switch (status) {
      case 'safe':
        statusIcon.classList.add('safe');
        statusIcon.textContent = '✓';
        statusText.textContent = 'Page is Safe';
        break;
      case 'warning':
        statusIcon.classList.add('warning');
        statusIcon.textContent = '⚠';
        statusText.textContent = 'Potential Issues Found';
        break;
      case 'danger':
        statusIcon.classList.add('danger');
        statusIcon.textContent = '✕';
        statusText.textContent = 'Threats Detected!';
        break;
      case 'scanning':
        statusIcon.classList.add('scanning');
        statusIcon.textContent = '◌';
        statusText.textContent = 'Scanning...';
        break;
      case 'disabled':
        statusIcon.classList.add('disabled');
        statusIcon.textContent = '○';
        statusText.textContent = 'Protection Disabled';
        break;
    }
  }

  function getThreatIcon(type) {
    const icons = {
      'Fake News': '📰',
      'Misinformation': '❌',
      'Disinformation': '🎭',
      'Scam': '💀',
      'Phishing': '🎣',
      'Clickbait': '🪤',
      'Propaganda': '📢',
      'Harmful Content': '⚠️'
    };
    return icons[type] || '⚠️';
  }
});
