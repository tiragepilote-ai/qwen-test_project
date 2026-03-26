// State management
let currentTab = 'fiches-exam';
let currentEditId = null;
let currentAction = 'add';

// Page titles mapping
const pageTitles = {
  'fiches-exam': 'بطاقات الامتحان',
  'classes': 'الفصول',
  'jours': 'الأيام',
  'salles': 'القاعات',
  'matieres': 'المواد'
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
  modalConfirm.textContent = action === 'add' ? 'إنشاء' : 'تعديل';
  
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
    alert('حدث خطأ أثناء الحفظ.');
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
    tbody.innerHTML = '<tr><td colspan="3" class="empty-state"><div class="empty-state-icon">📭</div><h3></h3><p>انقر على "جديد" لإضافة فصل.</p></td></tr>';
    return;
  }
  
  tbody.innerHTML = classes.map(cls => `
    <tr>
      <td>${cls.id}</td>
      <td>${escapeHtml(cls.name)}</td>
      <td>
        <div class="action-btns">
          <button class="btn-action btn-edit" onclick="editClass(${cls.id}, '${escapeHtml(cls.name)}')">✏️ تعديل</button>
          <button class="btn-action btn-delete" onclick="deleteClass(${cls.id})">🗑️ حذف</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function renderJoursTable(jours) {
  const tbody = document.getElementById('jours-body');
  if (jours.length === 0) {
    tbody.innerHTML = '<tr><td colspan="3" class="empty-state"><div class="empty-state-icon">📭</div><h3></h3><p>انقر على "جديد" لإضافة يوم.</p></td></tr>';
    return;
  }
  
  tbody.innerHTML = jours.map(jour => `
    <tr>
      <td>${jour.id}</td>
      <td>${formatDate(jour.day)}</td>
      <td>
        <div class="action-btns">
          <button class="btn-action btn-edit" onclick="editJour(${jour.id}, '${jour.day}')">✏️ تعديل</button>
          <button class="btn-action btn-delete" onclick="deleteJour(${jour.id})">🗑️ حذف</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function renderSallesTable(salles) {
  const tbody = document.getElementById('salles-body');
  if (salles.length === 0) {
    tbody.innerHTML = '<tr><td colspan="3" class="empty-state"><div class="empty-state-icon">📭</div><h3></h3><p>انقر على "جديد" لإضافة قاعة.</p></td></tr>';
    return;
  }
  
  tbody.innerHTML = salles.map(salle => `
    <tr>
      <td>${salle.id}</td>
      <td>${escapeHtml(salle.name)}</td>
      <td>
        <div class="action-btns">
          <button class="btn-action btn-edit" onclick="editSalle(${salle.id}, '${escapeHtml(salle.name)}')">✏️ تعديل</button>
          <button class="btn-action btn-delete" onclick="deleteSalle(${salle.id})">🗑️ حذف</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function renderMatieresTable(matieres) {
  const tbody = document.getElementById('matieres-body');
  if (matieres.length === 0) {
    tbody.innerHTML = '<tr><td colspan="3" class="empty-state"><div class="empty-state-icon">📭</div><h3></h3><p>انقر على "جديد" لإضافة مادة.</p></td></tr>';
    return;
  }
  
  tbody.innerHTML = matieres.map(matiere => `
    <tr>
      <td>${matiere.id}</td>
      <td>${escapeHtml(matiere.name)}</td>
      <td>
        <div class="action-btns">
          <button class="btn-action btn-edit" onclick="editMatiere(${matiere.id}, '${escapeHtml(matiere.name)}')">✏️ تعديل</button>
          <button class="btn-action btn-delete" onclick="deleteMatiere(${matiere.id})">🗑️ حذف</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function renderFichesExamTable(fiches) {
  const tbody = document.getElementById('fiches-exam-body');
  if (fiches.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" class="empty-state"><div class="empty-state-icon">📭</div><h3></h3><p>انقر على "جديد" لإضافة بطاقة امتحان.</p></td></tr>';
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
          <button class="btn-action btn-edit" onclick="editFicheExam(${fiche.id})">✏️ تعديل</button>
          <button class="btn-action btn-delete" onclick="deleteFicheExam(${fiche.id})">🗑️ حذف</button>
        </div>
      </td>
    </tr>
  `).join('');
}

// Form generators
function getClassForm(data = {}) {
  return `
    <div class="form-group">
      <label class="form-label">اسم الفصل</label>
      <input type="text" id="class-name" class="form-input" placeholder="مثال: الفصل الأول" value="${escapeHtml(data.name || '')}" required>
    </div>
  `;
}

function getJourForm(data = {}) {
  return `
    <div class="form-group">
      <label class="form-label">التاريخ</label>
      <input type="date" id="jour-day" class="form-input" value="${data.day || ''}" required>
    </div>
  `;
}

function getSalleForm(data = {}) {
  return `
    <div class="form-group">
      <label class="form-label">اسم القاعة</label>
      <input type="text" id="salle-name" class="form-input" placeholder="مثال: القاعة 101" value="${escapeHtml(data.name || '')}" required>
    </div>
  `;
}

function getMatiereForm(data = {}) {
  return `
    <div class="form-group">
      <label class="form-label">اسم المادة</label>
      <input type="text" id="matiere-name" class="form-input" placeholder="مثال: الرياضيات" value="${escapeHtml(data.name || '')}" required>
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
      <label class="form-label">المادة</label>
      <select id="fiche-matiere" class="form-select" required>
        <option value="">اختر مادة</option>
        ${matieres.map(m => `<option value="${m.id}" ${data.matiere_id === m.id ? 'selected' : ''}>${escapeHtml(m.name)}</option>`).join('')}
      </select>
    </div>
    
    <div class="form-group">
      <label class="form-label">الفصل</label>
      <select id="fiche-classe" class="form-select" required>
        <option value="">اختر فصلا</option>
        ${classes.map(c => `<option value="${c.id}" ${data.classe_id === c.id ? 'selected' : ''}>${escapeHtml(c.name)}</option>`).join('')}
      </select>
    </div>
    
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">القاعة</label>
        <select id="fiche-salle" class="form-select" required>
          <option value="">اختر قاعة</option>
          ${salles.map(s => `<option value="${s.id}" ${data.salle_id === s.id ? 'selected' : ''}>${escapeHtml(s.name)}</option>`).join('')}
        </select>
      </div>
      
      <div class="form-group">
        <label class="form-label">اليوم</label>
        <select id="fiche-jour" class="form-select" required>
          <option value="">اختر يوما</option>
          ${jours.map(j => `<option value="${j.id}" ${data.day_id === j.id ? 'selected' : ''}>${formatDate(j.day)}</option>`).join('')}
        </select>
      </div>
    </div>
    
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">وقت البدء</label>
        <input type="time" id="fiche-heure-debut" class="form-input" value="${data.heure_debut || ''}" required>
      </div>
      
      <div class="form-group">
        <label class="form-label">وقت الانتهاء</label>
        <input type="time" id="fiche-heure-fin" class="form-input" value="${data.heure_fin || ''}" required>
      </div>
    </div>
  `;
}

// عمليات إدارة البيانات - الفصول
async function addClass() {
  openModal('فصل جديد', getClassForm(), 'add');
}

async function editClass(id, name) {
  openModal('تعديل فصل', getClassForm({ name }), 'edit', id);
}

async function deleteClass(id) {
  if (confirm('هل أنت متأكد من حذف هذا الفصل؟')) {
    await window.electronAPI.deleteClass(id);
    loadDataForTab('classes');
  }
}

async function handleClassSubmit() {
  const name = document.getElementById('class-name').value.trim();
  if (!name) {
    alert('الرجاء إدخال اسم الفصل.');
    return;
  }
  
  if (currentAction === 'add') {
    await window.electronAPI.addClass(name);
  } else {
    await window.electronAPI.updateClass(currentEditId, name);
  }
}

// عمليات إدارة البيانات - الأيام
async function addJour() {
  openModal('يوم جديد', getJourForm(), 'add');
}

async function editJour(id, day) {
  openModal('تعديل يوم', getJourForm({ day }), 'edit', id);
}

async function deleteJour(id) {
  if (confirm('هل أنت متأكد من حذف هذا اليوم؟')) {
    await window.electronAPI.deleteJour(id);
    loadDataForTab('jours');
  }
}

async function handleJourSubmit() {
  const day = document.getElementById('jour-day').value;
  if (!day) {
    alert('الرجاء تحديد تاريخ.');
    return;
  }
  
  if (currentAction === 'add') {
    await window.electronAPI.addJour(day);
  } else {
    await window.electronAPI.updateJour(currentEditId, day);
  }
}

// عمليات إدارة البيانات - القاعات
async function addSalle() {
  openModal('قاعة جديدة', getSalleForm(), 'add');
}

async function editSalle(id, name) {
  openModal('تعديل قاعة', getSalleForm({ name }), 'edit', id);
}

async function deleteSalle(id) {
  if (confirm('هل أنت متأكد من حذف هذه القاعة؟')) {
    await window.electronAPI.deleteSalle(id);
    loadDataForTab('salles');
  }
}

async function handleSalleSubmit() {
  const name = document.getElementById('salle-name').value.trim();
  if (!name) {
    alert('الرجاء إدخال اسم القاعة.');
    return;
  }
  
  if (currentAction === 'add') {
    await window.electronAPI.addSalle(name);
  } else {
    await window.electronAPI.updateSalle(currentEditId, name);
  }
}

// عمليات إدارة البيانات - المواد
async function addMatiere() {
  openModal('مادة جديدة', getMatiereForm(), 'add');
}

async function editMatiere(id, name) {
  openModal('تعديل مادة', getMatiereForm({ name }), 'edit', id);
}

async function deleteMatiere(id) {
  if (confirm('هل أنت متأكد من حذف هذه المادة؟')) {
    await window.electronAPI.deleteMatiere(id);
    loadDataForTab('matieres');
  }
}

async function handleMatiereSubmit() {
  const name = document.getElementById('matiere-name').value.trim();
  if (!name) {
    alert('الرجاء إدخال اسم المادة.');
    return;
  }
  
  if (currentAction === 'add') {
    await window.electronAPI.addMatiere(name);
  } else {
    await window.electronAPI.updateMatiere(currentEditId, name);
  }
}

// عمليات إدارة البيانات - بطاقات الامتحان
async function addFicheExam() {
  const formHtml = await getFicheExamForm();
  openModal('بطاقة امتحان جديدة', formHtml, 'add');
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
    openModal('تعديل بطاقة امتحان', formHtml, 'edit', id);
  }
}

async function deleteFicheExam(id) {
  if (confirm('هل أنت متأكد من حذف بطاقة الامتحان هذه؟')) {
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
    alert('الرجاء ملء جميع الحقول.');
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
  return date.toLocaleDateString('ar-MA');
}
