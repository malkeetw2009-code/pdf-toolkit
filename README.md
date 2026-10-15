# PDF Toolkit - Setup & Deployment Guide

## 📁 Repository Structure
- `index.html`: मुख्य यूजर इंटरफेस
- `js/`: मॉड्युलर JavaScript कोड (App, Engine Manager आदि)
- `engines/`: अलग-अलग प्रोसेसिंग इंजन (PDF, Image, Office आदि)
- `service-worker.js` & `manifest.json`: PWA और ऑफलाइन समर्थन

## 🚀 GitHub Pages पर Deploy कैसे करें?
1. इस रिपॉजिटरी में सभी फाइलों को सही फोल्डर स्ट्रक्चर के साथ अपलोड करें।
2. GitHub Repository के **Settings > Pages** में जाएं।
3. Branch को `main` (या `master`) और फोल्डर को `/ (root)` पर सेट करके Save करें।
4. आपकी वेबसाइट `https://<username>.github.io/pdf-toolkit/` पर लाइव हो जाएगी।

## 🧪 परीक्षण (Testing)
- **Merge PDF:** कम से कम दो PDF फाइलें चुनकर मर्ज करें।
- **Rotate PDF:** किसी भी PDF को 90 डिग्री घुमाकर आउटपुट डाउनलोड करें।
- **Offline Mode:** एक बार वेबसाइट लोड होने के बाद, इंटरनेट बंद करके भी स्थानीय टूल्स का उपयोग किया जा सकता है।
