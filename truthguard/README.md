# TruthGuard 🛡️

**A browser extension that keeps users safe by warning when they are viewing fake news, misinformation, disinformation, scams, and other harmful material.**

![TruthGuard Shield](icons/icon128.png)

## Features

### 🔍 Real-Time Content Analysis
TruthGuard automatically scans every webpage you visit, analyzing content for:

- **Fake News** - Known unreliable sources and sensationalized claims
- **Misinformation** - Content that spreads false information
- **Disinformation** - Deliberately misleading content
- **Scams & Phishing** - Attempts to steal your information or money
- **Clickbait** - Sensationalized headlines designed to manipulate
- **Propaganda** - Biased content pushing specific agendas

### ⚠️ Intelligent Warning System
- **Visual Badges** - See at a glance if a page is safe (✓), suspicious (⚠), or dangerous (!)
- **Detailed Threat Breakdown** - Understand exactly what was detected
- **Severity Scoring** - Each threat rated 0-100% severity
- **Full-Page Warnings** - For high-severity threats, get a blocking overlay before the page loads

### 📊 Statistics Tracking
- Track how many pages you've scanned
- See how many threats have been blocked
- Monitor your browsing safety over time

### ⚙️ Easy Controls
- Toggle protection on/off with one click
- Manual scan button for re-analyzing pages
- Clean, modern UI that doesn't get in the way

## How It Works

TruthGuard uses multiple detection methods:

1. **Domain Reputation** - Cross-references against known unreliable sources
2. **Pattern Matching** - Detects phrases commonly used in fake news and scams
3. **Behavioral Analysis** - Identifies suspicious forms, login prompts, and payment requests
4. **Content Quality Scoring** - Flags excessive capitalization, exclamation marks, and other red flags
5. **Security Checks** - Verifies HTTPS and warns about insecure pages

## Installation

### Chrome / Brave / Edge
1. Download or clone this repository
2. Open `chrome://extensions` in your browser
3. Enable "Developer mode" (top right)
4. Click "Load unpacked"
5. Select the `truthguard` folder

### Firefox
1. Open `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on"
3. Select the `manifest.json` file

## Privacy

TruthGuard operates **entirely locally**. Your browsing data:
- ❌ Is NOT sent to any external servers
- ❌ Is NOT stored or logged
- ❌ Is NOT shared with anyone
- ✅ Stays completely on your device

## Technical Details

- **Manifest Version**: 3 (latest Chrome extension standard)
- **Permissions**: 
  - `activeTab` - Access current tab content
  - `storage` - Save settings locally
- **Size**: < 50KB total

## Future Roadmap

- [ ] Machine learning-based content analysis
- [ ] Community-sourced threat intelligence
- [ ] Integration with fact-checking APIs
- [ ] Browser sync for settings
- [ ] Detailed reporting dashboard
- [ ] Mobile browser support

## Built For

**NEARCON Agent Wars Hackathon 2026** - The Pitch Challenge

*Built by Jim, an AI agent, demonstrating what autonomous agents can create.*

## License

MIT License - Use freely, stay safe online!

---

**Stay safe. Stay informed. Trust TruthGuard.** 🛡️
