// State management
let currentTab = 'fiches-exam';
let currentEditId = null;
let currentAction = 'add';

// Page titles mapping
const pageTitles = {
  'fiches-exam': 'Fiches d\'Examen',
  'classes': 'Classes',
  'jours': 'Jours',
  'salles': 'Salles',
  'matieres': 'Matières'
};

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initModal();
  loadCurrentTab();
});

// Navigation
function initNavigation() {
  const navBtns = document.querySelectorAll('.nav-btn');
  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      navBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentTab = btn.dataset.tab;
      loadCurrentTab();
    });
  });
}

function loadCurrentTab() {
  // Update page title
  document.getElementById('page-title').textContent = pageTitles[currentTab];
  
  // Show active tab content
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.classList.remove('active');
  });
  document.getElementById(`tab-${currentTab}`).classList.add('active');
  
  // Load data for current tab
  loadDataForTab(currentTab);
}

// Modal initialization
function initModal() {
  const modalOverlay = document.getElementById('modal-overlay');
  const modalClose = document.getElementById('modal-close');
  const modalCancel = document.getElementById('modal-cancel');
  const modalConfirm = document.getElementById('modal-confirm');
  
  // Close modal only with X button or Cancel button
  modalClose.addEventListener('click', closeModal);
  modalCancel.addEventListener('click', closeModal);
  modalConfirm.addEventListener('click', handleModalConfirm);
  
  // Prevent closing when clicking overlay (requirement: only X button closes)
  // modalOverlay.addEventListener('click', (e) => {
  //   if (e.target === modalOverlay) closeModal();
  // });
}

function openModal(title, formHtml, action = 'add', editId = null) {
  const modalOverlay = document.getElementById('modal-overlay');
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');
  const modalConfirm = document.getElementById('modal-confirm');
  
  modalTitle.textContent = title;
  modalBody.innerHTML = formHtml;
  currentAction = action;
  currentEditId = editId;
  
  // Update confirm button text
  modalConfirm.textContent = action === 'add' ? 'Créer' : 'Modifier';
  
  modalOverlay.classList.add('active');
}

function closeModal() {
  const modalOverlay = document.getElementById('modal-overlay');
  modalOverlay.classList.remove('active');
  currentEditId = null;
  currentAction = 'add';
}

async function handleModalConfirm() {
  try {
    switch (currentTab) {
      case 'classes':
        await handleClassSubmit();
        break;
      case 'jours':
        await handleJourSubmit();
        break;
      case 'salles':
        await handleSalleSubmit();
        break;
      case 'matieres':
        await handleMatiereSubmit();
        break;
      case 'fiches-exam':
        await handleFicheExamSubmit();
        break;
    }
    closeModal();
    loadDataForTab(currentTab);
  } catch (error) {
    console.error('Error saving:', error);
    alert('Une erreur est survenue lors de l\'enregistrement.');
  }
}

// Load data for current tab
async function loadDataForTab(tab) {
  let data;
  
  switch (tab) {
    case 'classes':
      data = await window.electronAPI.getClasses();
      renderClassesTable(data);
      break;
    case 'jours':
      data = await window.electronAPI.getJours();
      renderJoursTable(data);
      break;
    case 'salles':
      data = await window.electronAPI.getSalles();
      renderSallesTable(data);
      break;
    case 'matieres':
      data = await window.electronAPI.getMatieres();
      renderMatieresTable(data);
      break;
    case 'fiches-exam':
      data = await window.electronAPI.getFichesExam();
      renderFichesExamTable(data);
      break;
  }
}

// Render functions
function renderClassesTable(classes) {
  const tbody = document.getElementById('classes-body');
  if (classes.length === 0) {
    tbody.innerHTML = '<tr><td colspan="3" class="empty-state"><div class="empty-state-icon">📭</div><h3>Aucune classe</h3><p>Cliquez sur "Nouveau" pour ajouter une classe.</p></td></tr>';
    return;
  }
  
  tbody.innerHTML = classes.map(cls => `
    <tr>
      <td>${cls.id}</td>
      <td>${escapeHtml(cls.name)}</td>
      <td>
        <div class="action-btns">
          <button class="btn-action btn-edit" onclick="editClass(${cls.id}, '${escapeHtml(cls.name)}')">✏️ Modifier</button>
          <button class="btn-action btn-delete" onclick="deleteClass(${cls.id})">🗑️ Supprimer</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function renderJoursTable(jours) {
  const tbody = document.getElementById('jours-body');
  if (jours.length === 0) {
    tbody.innerHTML = '<tr><td colspan="3" class="empty-state"><div class="empty-state-icon">📭</div><h3>Aucun jour</h3><p>Cliquez sur "Nouveau" pour ajouter un jour.</p></td></tr>';
    return;
  }
  
  tbody.innerHTML = jours.map(jour => `
    <tr>
      <td>${jour.id}</td>
      <td>${formatDate(jour.day)}</td>
      <td>
        <div class="action-btns">
          <button class="btn-action btn-edit" onclick="editJour(${jour.id}, '${jour.day}')">✏️ Modifier</button>
          <button class="btn-action btn-delete" onclick="deleteJour(${jour.id})">🗑️ Supprimer</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function renderSallesTable(salles) {
  const tbody = document.getElementById('salles-body');
  if (salles.length === 0) {
    tbody.innerHTML = '<tr><td colspan="3" class="empty-state"><div class="empty-state-icon">📭</div><h3>Aucune salle</h3><p>Cliquez sur "Nouveau" pour ajouter une salle.</p></td></tr>';
    return;
  }
  
  tbody.innerHTML = salles.map(salle => `
    <tr>
      <td>${salle.id}</td>
      <td>${escapeHtml(salle.name)}</td>
      <td>
        <div class="action-btns">
          <button class="btn-action btn-edit" onclick="editSalle(${salle.id}, '${escapeHtml(salle.name)}')">✏️ Modifier</button>
          <button class="btn-action btn-delete" onclick="deleteSalle(${salle.id})">🗑️ Supprimer</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function renderMatieresTable(matieres) {
  const tbody = document.getElementById('matieres-body');
  if (matieres.length === 0) {
    tbody.innerHTML = '<tr><td colspan="3" class="empty-state"><div class="empty-state-icon">📭</div><h3>Aucune matière</h3><p>Cliquez sur "Nouveau" pour ajouter une matière.</p></td></tr>';
    return;
  }
  
  tbody.innerHTML = matieres.map(matiere => `
    <tr>
      <td>${matiere.id}</td>
      <td>${escapeHtml(matiere.name)}</td>
      <td>
        <div class="action-btns">
          <button class="btn-action btn-edit" onclick="editMatiere(${matiere.id}, '${escapeHtml(matiere.name)}')">✏️ Modifier</button>
          <button class="btn-action btn-delete" onclick="deleteMatiere(${matiere.id})">🗑️ Supprimer</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function renderFichesExamTable(fiches) {
  const tbody = document.getElementById('fiches-exam-body');
  if (fiches.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" class="empty-state"><div class="empty-state-icon">📭</div><h3>Aucune fiche d\'examen</h3><p>Cliquez sur "Nouveau" pour ajouter une fiche.</p></td></tr>';
    return;
  }
  
  tbody.innerHTML = fiches.map(fiche => `
    <tr>
      <td>${fiche.id}</td>
      <td>${escapeHtml(fiche.matiere_name || 'N/A')}</td>
      <td>${escapeHtml(fiche.classe_name || 'N/A')}</td>
      <td>${escapeHtml(fiche.salle_name || 'N/A')}</td>
      <td>${formatDate(fiche.jour_day)}</td>
      <td>${fiche.heure_debut || '--:--'}</td>
      <td>${fiche.heure_fin || '--:--'}</td>
      <td>
        <div class="action-btns">
          <button class="btn-action btn-edit" onclick="editFicheExam(${fiche.id})">✏️ Modifier</button>
          <button class="btn-action btn-delete" onclick="deleteFicheExam(${fiche.id})">🗑️ Supprimer</button>
        </div>
      </td>
    </tr>
  `).join('');
}

// Form generators
function getClassForm(data = {}) {
  return `
    <div class="form-group">
      <label class="form-label">Nom de la Classe</label>
      <input type="text" id="class-name" class="form-input" placeholder="Ex: Terminale A" value="${escapeHtml(data.name || '')}" required>
    </div>
  `;
}

function getJourForm(data = {}) {
  return `
    <div class="form-group">
      <label class="form-label">Date</label>
      <input type="date" id="jour-day" class="form-input" value="${data.day || ''}" required>
    </div>
  `;
}

function getSalleForm(data = {}) {
  return `
    <div class="form-group">
      <label class="form-label">Nom de la Salle</label>
      <input type="text" id="salle-name" class="form-input" placeholder="Ex: Salle 101" value="${escapeHtml(data.name || '')}" required>
    </div>
  `;
}

function getMatiereForm(data = {}) {
  return `
    <div class="form-group">
      <label class="form-label">Nom de la Matière</label>
      <input type="text" id="matiere-name" class="form-input" placeholder="Ex: Mathématiques" value="${escapeHtml(data.name || '')}" required>
    </div>
  `;
}

async function getFicheExamForm(data = {}) {
  const [classes, jours, salles, matieres] = await Promise.all([
    window.electronAPI.getClasses(),
    window.electronAPI.getJours(),
    window.electronAPI.getSalles(),
    window.electronAPI.getMatieres()
  ]);
  
  return `
    <div class="form-group">
      <label class="form-label">Matière</label>
      <select id="fiche-matiere" class="form-select" required>
        <option value="">Sélectionner une matière</option>
        ${matieres.map(m => `<option value="${m.id}" ${data.matiere_id === m.id ? 'selected' : ''}>${escapeHtml(m.name)}</option>`).join('')}
      </select>
    </div>
    
    <div class="form-group">
      <label class="form-label">Classe</label>
      <select id="fiche-classe" class="form-select" required>
        <option value="">Sélectionner une classe</option>
        ${classes.map(c => `<option value="${c.id}" ${data.classe_id === c.id ? 'selected' : ''}>${escapeHtml(c.name)}</option>`).join('')}
      </select>
    </div>
    
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Salle</label>
        <select id="fiche-salle" class="form-select" required>
          <option value="">Sélectionner une salle</option>
          ${salles.map(s => `<option value="${s.id}" ${data.salle_id === s.id ? 'selected' : ''}>${escapeHtml(s.name)}</option>`).join('')}
        </select>
      </div>
      
      <div class="form-group">
        <label class="form-label">Jour</label>
        <select id="fiche-jour" class="form-select" required>
          <option value="">Sélectionner un jour</option>
          ${jours.map(j => `<option value="${j.id}" ${data.day_id === j.id ? 'selected' : ''}>${formatDate(j.day)}</option>`).join('')}
        </select>
      </div>
    </div>
    
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Heure de Début</label>
        <input type="time" id="fiche-heure-debut" class="form-input" value="${data.heure_debut || ''}" required>
      </div>
      
      <div class="form-group">
        <label class="form-label">Heure de Fin</label>
        <input type="time" id="fiche-heure-fin" class="form-input" value="${data.heure_fin || ''}" required>
      </div>
    </div>
  `;
}

// CRUD Operations - Classes
async function addClass() {
  openModal('Nouvelle Classe', getClassForm(), 'add');
}

async function editClass(id, name) {
  openModal('Modifier Classe', getClassForm({ name }), 'edit', id);
}

async function deleteClass(id) {
  if (confirm('Êtes-vous sûr de vouloir supprimer cette classe ?')) {
    await window.electronAPI.deleteClass(id);
    loadDataForTab('classes');
  }
}

async function handleClassSubmit() {
  const name = document.getElementById('class-name').value.trim();
  if (!name) {
    alert('Veuillez entrer un nom de classe.');
    return;
  }
  
  if (currentAction === 'add') {
    await window.electronAPI.addClass(name);
  } else {
    await window.electronAPI.updateClass(currentEditId, name);
  }
}

// CRUD Operations - Jours
async function addJour() {
  openModal('Nouveau Jour', getJourForm(), 'add');
}

async function editJour(id, day) {
  openModal('Modifier Jour', getJourForm({ day }), 'edit', id);
}

async function deleteJour(id) {
  if (confirm('Êtes-vous sûr de vouloir supprimer ce jour ?')) {
    await window.electronAPI.deleteJour(id);
    loadDataForTab('jours');
  }
}

async function handleJourSubmit() {
  const day = document.getElementById('jour-day').value;
  if (!day) {
    alert('Veuillez sélectionner une date.');
    return;
  }
  
  if (currentAction === 'add') {
    await window.electronAPI.addJour(day);
  } else {
    await window.electronAPI.updateJour(currentEditId, day);
  }
}

// CRUD Operations - Salles
async function addSalle() {
  openModal('Nouvelle Salle', getSalleForm(), 'add');
}

async function editSalle(id, name) {
  openModal('Modifier Salle', getSalleForm({ name }), 'edit', id);
}

async function deleteSalle(id) {
  if (confirm('Êtes-vous sûr de vouloir supprimer cette salle ?')) {
    await window.electronAPI.deleteSalle(id);
    loadDataForTab('salles');
  }
}

async function handleSalleSubmit() {
  const name = document.getElementById('salle-name').value.trim();
  if (!name) {
    alert('Veuillez entrer un nom de salle.');
    return;
  }
  
  if (currentAction === 'add') {
    await window.electronAPI.addSalle(name);
  } else {
    await window.electronAPI.updateSalle(currentEditId, name);
  }
}

// CRUD Operations - Matières
async function addMatiere() {
  openModal('Nouvelle Matière', getMatiereForm(), 'add');
}

async function editMatiere(id, name) {
  openModal('Modifier Matière', getMatiereForm({ name }), 'edit', id);
}

async function deleteMatiere(id) {
  if (confirm('Êtes-vous sûr de vouloir supprimer cette matière ?')) {
    await window.electronAPI.deleteMatiere(id);
    loadDataForTab('matieres');
  }
}

async function handleMatiereSubmit() {
  const name = document.getElementById('matiere-name').value.trim();
  if (!name) {
    alert('Veuillez entrer un nom de matière.');
    return;
  }
  
  if (currentAction === 'add') {
    await window.electronAPI.addMatiere(name);
  } else {
    await window.electronAPI.updateMatiere(currentEditId, name);
  }
}

// CRUD Operations - Fiches Exam
async function addFicheExam() {
  const formHtml = await getFicheExamForm();
  openModal('Nouvelle Fiche d\'Examen', formHtml, 'add');
}

async function editFicheExam(id) {
  const fiches = await window.electronAPI.getFichesExam();
  const fiche = fiches.find(f => f.id === id);
  if (fiche) {
    const formHtml = await getFicheExamForm({
      matiere_id: fiche.matiere_id,
      classe_id: fiche.classe_id,
      salle_id: fiche.salle_id,
      day_id: fiche.day_id,
      heure_debut: fiche.heure_debut,
      heure_fin: fiche.heure_fin
    });
    openModal('Modifier Fiche d\'Examen', formHtml, 'edit', id);
  }
}

async function deleteFicheExam(id) {
  if (confirm('Êtes-vous sûr de vouloir supprimer cette fiche d\'examen ?')) {
    await window.electronAPI.deleteFicheExam(id);
    loadDataForTab('fiches-exam');
  }
}

async function handleFicheExamSubmit() {
  const matiere_id = parseInt(document.getElementById('fiche-matiere').value);
  const classe_id = parseInt(document.getElementById('fiche-classe').value);
  const salle_id = parseInt(document.getElementById('fiche-salle').value);
  const day_id = parseInt(document.getElementById('fiche-jour').value);
  const heure_debut = document.getElementById('fiche-heure-debut').value;
  const heure_fin = document.getElementById('fiche-heure-fin').value;
  
  if (!matiere_id || !classe_id || !salle_id || !day_id || !heure_debut || !heure_fin) {
    alert('Veuillez remplir tous les champs.');
    return;
  }
  
  const data = { matiere_id, classe_id, salle_id, day_id, heure_debut, heure_fin };
  
  if (currentAction === 'add') {
    await window.electronAPI.addFicheExam(data);
  } else {
    await window.electronAPI.updateFicheExam(currentEditId, data);
  }
}

// Add button handler
document.getElementById('add-btn').addEventListener('click', () => {
  switch (currentTab) {
    case 'classes':
      addClass();
      break;
    case 'jours':
      addJour();
      break;
    case 'salles':
      addSalle();
      break;
    case 'matieres':
      addMatiere();
      break;
    case 'fiches-exam':
      addFicheExam();
      break;
  }
});

// Utility functions
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML.replace(/'/g, '&#39;');
}

function formatDate(dateStr) {
  if (!dateStr) return '--/--/----';
  const date = new Date(dateStr);
  return date.toLocaleDateString('fr-FR');
}
