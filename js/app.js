import { TOOLS } from './tools-config.js';
import { EngineManager } from './engine-manager.js';
import pdfEngine from '../engines/pdf-engine.js';
import imageEngine from '../engines/image-engine.js';
import officeEngine from '../engines/office-engine.js';

const engineManager = new EngineManager();
let selectedFiles = [];
let currentTool = null;

document.addEventListener('DOMContentLoaded', async () => {
  // इंजन रजिस्टर करें
  await engineManager.registerEngine('pdf-engine', pdfEngine);
  await engineManager.registerEngine('image-engine', imageEngine);
  await engineManager.registerEngine('office-engine', officeEngine);

  renderToolsGrid(TOOLS);
  setupSearch();
  setupWorkspaceEvents();
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
  currentTool = TOOLS.find(t => t.id === toolId);
  if (!currentTool) return;

  document.getElementById('toolsGrid').style.display = 'none';
  const workspace = document.getElementById('toolWorkspace');
  workspace.style.display = 'flex';

  document.getElementById('activeToolTitle').innerText = currentTool.name;
  document.getElementById('activeToolDesc').innerText = currentTool.desc;
  
  selectedFiles = [];
  updateFileList();
  document.getElementById('resultContainer').innerHTML = '';
  document.getElementById('processBtn').style.display = 'none';
}

function setupWorkspaceEvents() {
  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('fileInput');
  const processBtn = document.getElementById('processBtn');
  const backButton = document.getElementById('backButton');
  const homeLink = document.getElementById('homeLink');

  dropzone.addEventListener('click', () => fileInput.click());
  
  fileInput.addEventListener('change', (e) => {
    selectedFiles = Array.from(e.target.files);
    updateFileList();
  });

  dropzone.addEventListener('dragover', (e) => { e.preventDefault(); });
  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    selectedFiles = Array.from(e.dataTransfer.files);
    updateFileList();
  });

  backButton.addEventListener('click', () => {
    document.getElementById('toolWorkspace').style.display = 'none';
    document.getElementById('toolsGrid').style.display = 'grid';
  });

  homeLink.addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('toolWorkspace').style.display = 'none';
    document.getElementById('toolsGrid').style.display = 'grid';
  });

  processBtn.addEventListener('click', async () => {
    if (selectedFiles.length === 0) return;

    const progressContainer = document.getElementById('progressContainer');
    const progressBar = document.getElementById('progressBar');
    const resultContainer = document.getElementById('resultContainer');
    
    progressContainer.style.display = 'block';
    progressBar.style.width = '30%';
    resultContainer.innerHTML = '<p>प्रोसेसिंग जारी है...</p>';

    try {
      // इंजन के माध्यम से वास्तविक प्रोसेसिंग कॉल
      const result = await engineManager.executeTool(currentTool.id, selectedFiles, {}, (progress) => {
        progressBar.style.width = `${progress}%`;
      });

      progressBar.style.width = '100%';
      
      // डाउनलोड लिंक तैयार करना
      const url = URL.createObjectURL(result.blob);
      resultContainer.innerHTML = `
        <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid #10b981; padding: 1rem; border-radius: 8px;">
          <p style="color: #34d399; margin-bottom: 0.5rem;">✔ ${result.message}</p>
          <a href="${url}" download="${result.filename}" style="display: inline-block; background: #10b981; color: white; padding: 0.5rem 1rem; border-radius: 6px; text-decoration: none; font-weight: bold;">फाइल डाउनलोड करें</a>
        </div>
      `;
    } catch (error) {
      resultContainer.innerHTML = `
        <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid #ef4444; padding: 1rem; border-radius: 8px;">
          <p style="color: #f87171;">❌ त्रुटि: ${error.message}</p>
        </div>
      `;
    } finally {
      setTimeout(() => { progressContainer.style.display = 'none'; }, 1000);
    }
  });
}

function updateFileList() {
  const fileListDiv = document.getElementById('fileList');
  const processBtn = document.getElementById('processBtn');

  if (selectedFiles.length > 0) {
    fileListDiv.innerHTML = `चुनी गई फाइलें: ${selectedFiles.map(f => f.name).join(', ')}`;
    processBtn.style.display = 'block';
  } else {
    fileListDiv.innerHTML = '';
    processBtn.style.display = 'none';
  }
}

function setupServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js').catch(err => console.error('SW Error:', err));
  }
}
