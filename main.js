const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const Database = require('better-sqlite3');

// Initialize database
const db = new Database(path.join(__dirname, 'exam.db'));

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS classes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS jours (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    day DATE NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS salles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS matieres (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS profs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    matiere_id INTEGER,
    FOREIGN KEY (matiere_id) REFERENCES matieres(id)
  );
  
  CREATE TABLE IF NOT EXISTS fiches_exam (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    matiere_id INTEGER,
    classe_id INTEGER,
    salle_id INTEGER,
    day_id INTEGER,
    heure_debut TEXT,
    heure_fin TEXT,
    FOREIGN KEY (matiere_id) REFERENCES matieres(id),
    FOREIGN KEY (classe_id) REFERENCES classes(id),
    FOREIGN KEY (salle_id) REFERENCES salles(id),
    FOREIGN KEY (day_id) REFERENCES jours(id)
  );
`);

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    backgroundColor: '#1a1a2e',
    frame: true,
    titleBarStyle: 'default'
  });

  mainWindow.loadFile('index.html');
  mainWindow.setMenu(null);
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC Handlers for Classes
ipcMain.handle('get-classes', () => {
  return db.prepare('SELECT * FROM classes').all();
});

ipcMain.handle('add-class', (event, name) => {
  const stmt = db.prepare('INSERT INTO classes (name) VALUES (?)');
  const result = stmt.run(name);
  return { id: result.lastInsertRowid, name };
});

ipcMain.handle('update-class', (event, id, name) => {
  const stmt = db.prepare('UPDATE classes SET name = ? WHERE id = ?');
  stmt.run(name, id);
  return { id, name };
});

ipcMain.handle('delete-class', (event, id) => {
  const stmt = db.prepare('DELETE FROM classes WHERE id = ?');
  stmt.run(id);
  return true;
});

// IPC Handlers for Jours
ipcMain.handle('get-jours', () => {
  return db.prepare('SELECT * FROM jours').all();
});

ipcMain.handle('add-jour', (event, day) => {
  const stmt = db.prepare('INSERT INTO jours (day) VALUES (?)');
  const result = stmt.run(day);
  return { id: result.lastInsertRowid, day };
});

ipcMain.handle('update-jour', (event, id, day) => {
  const stmt = db.prepare('UPDATE jours SET day = ? WHERE id = ?');
  stmt.run(day, id);
  return { id, day };
});

ipcMain.handle('delete-jour', (event, id) => {
  const stmt = db.prepare('DELETE FROM jours WHERE id = ?');
  stmt.run(id);
  return true;
});

// IPC Handlers for Salles
ipcMain.handle('get-salles', () => {
  return db.prepare('SELECT * FROM salles').all();
});

ipcMain.handle('add-salle', (event, name) => {
  const stmt = db.prepare('INSERT INTO salles (name) VALUES (?)');
  const result = stmt.run(name);
  return { id: result.lastInsertRowid, name };
});

ipcMain.handle('update-salle', (event, id, name) => {
  const stmt = db.prepare('UPDATE salles SET name = ? WHERE id = ?');
  stmt.run(name, id);
  return { id, name };
});

ipcMain.handle('delete-salle', (event, id) => {
  const stmt = db.prepare('DELETE FROM salles WHERE id = ?');
  stmt.run(id);
  return true;
});

// IPC Handlers for Matières
ipcMain.handle('get-matieres', () => {
  return db.prepare('SELECT * FROM matieres').all();
});

ipcMain.handle('add-matiere', (event, name) => {
  const stmt = db.prepare('INSERT INTO matieres (name) VALUES (?)');
  const result = stmt.run(name);
  return { id: result.lastInsertRowid, name };
});

ipcMain.handle('update-matiere', (event, id, name) => {
  const stmt = db.prepare('UPDATE matieres SET name = ? WHERE id = ?');
  stmt.run(name, id);
  return { id, name };
});

ipcMain.handle('delete-matiere', (event, id) => {
  const stmt = db.prepare('DELETE FROM matieres WHERE id = ?');
  stmt.run(id);
  return true;
});

// IPC Handlers for Profs
ipcMain.handle('get-profs', () => {
  return db.prepare(`
    SELECT 
      p.id,
      p.name,
      p.matiere_id,
      m.name as matiere_name
    FROM profs p
    LEFT JOIN matieres m ON p.matiere_id = m.id
    ORDER BY p.id DESC
  `).all();
});

ipcMain.handle('add-prof', (event, name, matiere_id) => {
  const stmt = db.prepare('INSERT INTO profs (name, matiere_id) VALUES (?, ?)');
  const result = stmt.run(name, matiere_id);
  return { id: result.lastInsertRowid, name, matiere_id };
});

ipcMain.handle('update-prof', (event, id, name, matiere_id) => {
  const stmt = db.prepare('UPDATE profs SET name = ?, matiere_id = ? WHERE id = ?');
  stmt.run(name, matiere_id, id);
  return { id, name, matiere_id };
});

ipcMain.handle('delete-prof', (event, id) => {
  const stmt = db.prepare('DELETE FROM profs WHERE id = ?');
  stmt.run(id);
  return true;
});

// IPC Handlers for Fiches Exam
ipcMain.handle('get-fiches-exam', () => {
  return db.prepare(`
    SELECT 
      f.id,
      f.matiere_id,
      m.name as matiere_name,
      f.classe_id,
      c.name as classe_name,
      f.salle_id,
      s.name as salle_name,
      f.day_id,
      j.day as jour_day,
      f.heure_debut,
      f.heure_fin
    FROM fiches_exam f
    LEFT JOIN matieres m ON f.matiere_id = m.id
    LEFT JOIN classes c ON f.classe_id = c.id
    LEFT JOIN salles s ON f.salle_id = s.id
    LEFT JOIN jours j ON f.day_id = j.id
    ORDER BY f.id DESC
  `).all();
});

ipcMain.handle('add-fiche-exam', (event, data) => {
  const stmt = db.prepare(`
    INSERT INTO fiches_exam (matiere_id, classe_id, salle_id, day_id, heure_debut, heure_fin)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  const result = stmt.run(data.matiere_id, data.classe_id, data.salle_id, data.day_id, data.heure_debut, data.heure_fin);
  return { id: result.lastInsertRowid, ...data };
});

ipcMain.handle('update-fiche-exam', (event, id, data) => {
  const stmt = db.prepare(`
    UPDATE fiches_exam 
    SET matiere_id = ?, classe_id = ?, salle_id = ?, day_id = ?, heure_debut = ?, heure_fin = ?
    WHERE id = ?
  `);
  stmt.run(data.matiere_id, data.classe_id, data.salle_id, data.day_id, data.heure_debut, data.heure_fin, id);
  return { id, ...data };
});

ipcMain.handle('delete-fiche-exam', (event, id) => {
  const stmt = db.prepare('DELETE FROM fiches_exam WHERE id = ?');
  stmt.run(id);
  return true;
});
