import { TOOLS } from './tools-config.js';
import { EngineManager } from './engine-manager.js';
import pdfEngine from '../engines/pdf-engine.js';
import imageEngine from '../engines/image-engine.js';
import officeEngine from '../engines/office-engine.js';

const engineManager = new EngineManager();

document.addEventListener('DOMContentLoaded', async () => {
  // रजिस्टर करें
  await engineManager.registerEngine('pdf-engine', pdfEngine);
  await engineManager.registerEngine('image-engine', imageEngine);
  await engineManager.registerEngine('office-engine', officeEngine);

  renderToolsGrid(TOOLS);
  setupSearch();
  setupServiceWorker();
});

function renderToolsGrid(tools) {
  const grid = document.getElementById('toolsGrid');
  if (!grid) return;
  grid.innerHTML = tools.map(t => `
    <div class="tool-card" data-tool-id="${t.id}">
      <h3>${t.name}</h3>
      <p>${t.desc}</p>
    </div>
  `).join('');

  document.querySelectorAll('.tool-card').forEach(card => {
    card.addEventListener('click', () => {
      const toolId = card.getAttribute('data-tool-id');
      openToolWorkspace(toolId);
    });
  });
}

function setupSearch() {
  const searchInput = document.getElementById('searchInput');
  if (!searchInput) return;
  searchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = TOOLS.filter(t => t.name.toLowerCase().includes(term) || t.desc.toLowerCase().includes(term));
    renderToolsGrid(filtered);
  });
}

function openToolWorkspace(toolId) {
  const tool = TOOLS.find(t => t.id === toolId);
  alert(`चुना गया टूल: ${tool.name}. अब आप इसमें फाइल अपलोड कर सकते हैं।`);
  // यहाँ फाइल पिकर और प्रोसेसिंग ट्रिगर को जोड़ा जा सकता है।
}

function setupServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js')
      .then(() => console.log('Service Worker Registered'))
      .catch(err => console.error('SW Registration Failed:', err));
  }
}
