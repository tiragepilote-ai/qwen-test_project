const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Classes
  getClasses: () => ipcRenderer.invoke('get-classes'),
  addClass: (name) => ipcRenderer.invoke('add-class', name),
  updateClass: (id, name) => ipcRenderer.invoke('update-class', id, name),
  deleteClass: (id) => ipcRenderer.invoke('delete-class', id),
  
  // Jours
  getJours: () => ipcRenderer.invoke('get-jours'),
  addJour: (day) => ipcRenderer.invoke('add-jour', day),
  updateJour: (id, day) => ipcRenderer.invoke('update-jour', id, day),
  deleteJour: (id) => ipcRenderer.invoke('delete-jour', id),
  
  // Salles
  getSalles: () => ipcRenderer.invoke('get-salles'),
  addSalle: (name) => ipcRenderer.invoke('add-salle', name),
  updateSalle: (id, name) => ipcRenderer.invoke('update-salle', id, name),
  deleteSalle: (id) => ipcRenderer.invoke('delete-salle', id),
  
  // Matières
  getMatieres: () => ipcRenderer.invoke('get-matieres'),
  addMatiere: (name) => ipcRenderer.invoke('add-matiere', name),
  updateMatiere: (id, name) => ipcRenderer.invoke('update-matiere', id, name),
  deleteMatiere: (id) => ipcRenderer.invoke('delete-matiere', id),
  
  // Fiches Exam
  getFichesExam: () => ipcRenderer.invoke('get-fiches-exam'),
  addFicheExam: (data) => ipcRenderer.invoke('add-fiche-exam', data),
  updateFicheExam: (id, data) => ipcRenderer.invoke('update-fiche-exam', id, data),
  deleteFicheExam: (id) => ipcRenderer.invoke('delete-fiche-exam', id),
});
