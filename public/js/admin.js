// API Configuration
const API_URL = 'http://localhost:3000/api';
let isLoggedIn = false;

// Check login status on page load
window.addEventListener('DOMContentLoaded', () => {
    const loggedIn = sessionStorage.getItem('adminLoggedIn');
    if (loggedIn === 'true') {
        showDashboard();
    }
});

// Login Form Handler
document.getElementById('login-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const loginBtn = document.getElementById('login-btn');
    const loginText = document.getElementById('login-text');
    const loginSpinner = document.getElementById('login-spinner');

    loginBtn.disabled = true;
    loginText.classList.add('hidden');
    loginSpinner.classList.remove('hidden');

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Login gagal');
        }

        sessionStorage.setItem('adminLoggedIn', 'true');
        sessionStorage.setItem('adminUsername', data.admin.username);
        showDashboard();

    } catch (error) {
        showLoginAlert('error', error.message);
        loginBtn.disabled = false;
        loginText.classList.remove('hidden');
        loginSpinner.classList.add('hidden');
    }
});

// Show Dashboard
function showDashboard() {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('admin-dashboard').style.display = 'block';
    isLoggedIn = true;
    loadStatistics();
    loadTokens();
    loadCandidates();
}

// Logout
function logout() {
    sessionStorage.removeItem('adminLoggedIn');
    sessionStorage.removeItem('adminUsername');
    location.reload();
}

// Tab Switching
function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
        // Check if this tab corresponds to the tabName
        const onclickAttr = tab.getAttribute('onclick');
        if (onclickAttr && onclickAttr.includes(`'${tabName}'`)) {
            tab.classList.add('active');
        }
    });

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    document.getElementById(`tab-${tabName}`).classList.add('active');

    // Load data for the tab
    if (tabName === 'statistics') {
        loadStatistics();
    } else if (tabName === 'tokens') {
        loadTokens();
    } else if (tabName === 'candidates') {
        loadCandidates();
    }
}

// Load Statistics
async function loadStatistics() {
    try {
        const response = await fetch(`${API_URL}/votes/statistics`);
        const data = await response.json();

        if (data.success) {
            const stats = data.statistics;

            // Update stat cards
            document.getElementById('stat-total-votes').textContent = stats.totalVotes;
            document.getElementById('stat-total-tokens').textContent = stats.totalTokens;
            document.getElementById('stat-used-tokens').textContent = stats.usedTokens;
            document.getElementById('stat-remaining-tokens').textContent = stats.remainingTokens;

            // Render charts
            renderChart('osis-chart', stats.osis);
            renderChart('mpk-chart', stats.mpk);
        }
    } catch (error) {
        showAlert('error', 'Gagal memuat statistik: ' + error.message);
    }
}

// Render Chart
function renderChart(containerId, candidates) {
    const container = document.getElementById(containerId);

    if (candidates.length === 0) {
        container.innerHTML = '<p class="text-secondary">Belum ada data</p>';
        return;
    }

    const maxVotes = Math.max(...candidates.map(c => c.vote_count), 1);

    container.innerHTML = candidates.map(candidate => {
        const percentage = (candidate.vote_count / maxVotes) * 100;
        return `
      <div class="chart-bar">
        <div class="chart-label">
          <span><strong>${candidate.name}</strong></span>
          <span>${candidate.vote_count} suara</span>
        </div>
        <div class="chart-bar-bg">
          <div class="chart-bar-fill" style="width: ${percentage}%">
            ${candidate.vote_count > 0 ? candidate.vote_count : ''}
          </div>
        </div>
      </div>
    `;
    }).join('');
}

// Generate Tokens
document.getElementById('generate-token-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const count = parseInt(document.getElementById('token-count').value);
    const genText = document.getElementById('gen-text');
    const genSpinner = document.getElementById('gen-spinner');
    const submitBtn = e.target.querySelector('button[type="submit"]');

    submitBtn.disabled = true;
    genText.classList.add('hidden');
    genSpinner.classList.remove('hidden');

    try {
        const response = await fetch(`${API_URL}/tokens/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ count })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Gagal generate token');
        }

        showAlert('success', data.message);
        document.getElementById('token-count').value = '';
        loadTokens();
        loadStatistics();

    } catch (error) {
        showAlert('error', error.message);
    } finally {
        submitBtn.disabled = false;
        genText.classList.remove('hidden');
        genSpinner.classList.add('hidden');
    }
});

// Load Tokens
async function loadTokens() {
    try {
        const response = await fetch(`${API_URL}/tokens`);
        const data = await response.json();

        if (data.success) {
            renderTokens(data.tokens);
        }
    } catch (error) {
        showAlert('error', 'Gagal memuat token: ' + error.message);
    }
}

// Render Tokens
function renderTokens(tokens) {
    const container = document.getElementById('token-list');

    if (tokens.length === 0) {
        container.innerHTML = '<p class="text-secondary text-center">Belum ada token</p>';
        return;
    }

    container.innerHTML = tokens.map(token => `
    <div class="token-item">
      <div>
        <div class="token-code">${token.token_code}</div>
        <small class="text-muted">Dibuat: ${new Date(token.created_at).toLocaleString('id-ID')}</small>
      </div>
      <div class="flex gap-1" style="align-items: center;">
        ${token.is_used
            ? `<span class="badge badge-success">Terpakai</span>`
            : `<span class="badge badge-warning">Belum Dipakai</span>`
        }
        <button class="btn btn-sm btn-danger" onclick="deleteToken(${token.id})">🗑️</button>
      </div>
    </div>
  `).join('');
}

// Delete Token
async function deleteToken(tokenId) {
    if (!confirm('Yakin ingin menghapus token ini?')) return;

    try {
        const response = await fetch(`${API_URL}/tokens/${tokenId}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Gagal menghapus token');
        }

        showAlert('success', 'Token berhasil dihapus');
        loadTokens();
        loadStatistics();

    } catch (error) {
        showAlert('error', error.message);
    }
}

// Delete All Tokens
async function deleteAllTokens() {
    if (!confirm('⚠️ PERINGATAN: Yakin ingin menghapus SEMUA token? Tindakan ini tidak dapat dibatalkan!')) return;

    // Double confirmation for safety
    if (!confirm('Konfirmasi sekali lagi: Hapus semua token?')) return;

    try {
        const response = await fetch(`${API_URL}/tokens/delete-all`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Gagal menghapus semua token');
        }

        showAlert('success', `Berhasil menghapus ${data.deletedCount} token`);
        loadTokens();
        loadStatistics();

    } catch (error) {
        showAlert('error', error.message);
    }
}


// Print All Tokens
async function printAllTokens() {
    try {
        const response = await fetch(`${API_URL}/tokens`);
        const data = await response.json();

        if (!data.success || data.tokens.length === 0) {
            showAlert('error', 'Tidak ada token untuk dicetak');
            return;
        }

        const tokens = data.tokens;

        // Create print window
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Daftar Token - Pemilu OSIS & MPK</title>
                <style>
                    @media print {
                        @page { margin: 1cm; }
                        body { margin: 0; }
                    }
                    body {
                        font-family: 'Courier New', monospace;
                        padding: 20px;
                        max-width: 800px;
                        margin: 0 auto;
                    }
                    h1 {
                        text-align: center;
                        margin-bottom: 10px;
                        font-size: 24px;
                    }
                    .subtitle {
                        text-align: center;
                        margin-bottom: 30px;
                        color: #666;
                        font-size: 14px;
                    }
                    .token-grid {
                        display: grid;
                        grid-template-columns: repeat(3, 1fr);
                        gap: 15px;
                        margin-bottom: 30px;
                    }
                    .token-card {
                        border: 2px solid #333;
                        padding: 15px;
                        text-align: center;
                        border-radius: 8px;
                        background: #f9f9f9;
                        page-break-inside: avoid;
                    }
                    .token-code {
                        font-size: 24px;
                        font-weight: bold;
                        letter-spacing: 3px;
                        margin: 10px 0;
                        color: #000;
                    }
                    .token-label {
                        font-size: 12px;
                        color: #666;
                        margin-bottom: 5px;
                    }
                    .token-status {
                        font-size: 11px;
                        padding: 3px 8px;
                        border-radius: 12px;
                        display: inline-block;
                        margin-top: 8px;
                    }
                    .status-unused {
                        background: #d4edda;
                        color: #155724;
                    }
                    .status-used {
                        background: #f8d7da;
                        color: #721c24;
                    }
                    .footer {
                        text-align: center;
                        margin-top: 30px;
                        padding-top: 20px;
                        border-top: 2px solid #333;
                        font-size: 12px;
                        color: #666;
                    }
                    .print-button {
                        display: block;
                        margin: 20px auto;
                        padding: 10px 30px;
                        background: #667eea;
                        color: white;
                        border: none;
                        border-radius: 5px;
                        cursor: pointer;
                        font-size: 16px;
                    }
                    @media print {
                        .print-button { display: none; }
                    }
                </style>
            </head>
            <body>
                <h1>🎯 DAFTAR TOKEN PEMILU</h1>
                <div class="subtitle">OSIS & MPK - ${new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                
                <button class="print-button" onclick="window.print()">🖨️ Cetak Halaman Ini</button>
                
                <div class="token-grid">
                    ${tokens.map(token => `
                        <div class="token-card">
                            <div class="token-label">TOKEN VOTING</div>
                            <div class="token-code">${token.token_code}</div>
                            <div class="token-status ${token.is_used ? 'status-used' : 'status-unused'}">
                                ${token.is_used ? '✓ Terpakai' : '○ Belum Dipakai'}
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="footer">
                    <p><strong>Total Token: ${tokens.length}</strong></p>
                    <p>Token Belum Dipakai: ${tokens.filter(t => !t.is_used).length} | Token Terpakai: ${tokens.filter(t => t.is_used).length}</p>
                    <p style="margin-top: 10px; font-size: 10px;">Dicetak pada: ${new Date().toLocaleString('id-ID')}</p>
                </div>
            </body>
            </html>
        `);
        printWindow.document.close();

    } catch (error) {
        showAlert('error', 'Gagal mencetak token: ' + error.message);
    }
}

// Preview Image
function previewImage(event, previewId) {
    const file = event.target.files[0];
    const preview = document.getElementById(previewId);

    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            preview.src = e.target.result;
            preview.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
    }
}

// Add/Edit Candidate
document.getElementById('candidate-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const form = e.target;
    const isEditMode = form.dataset.editId;

    const name = document.getElementById('candidate-name').value;
    const type = document.getElementById('candidate-type').value;
    const vision = document.getElementById('candidate-vision').value;
    const mission = document.getElementById('candidate-mission').value;
    const photoFile = document.getElementById('candidate-photo').files[0];
    const coverFile = document.getElementById('candidate-cover').files[0];

    const addText = document.getElementById('add-text');
    const addSpinner = document.getElementById('add-spinner');
    const submitBtn = e.target.querySelector('button[type="submit"]');

    submitBtn.disabled = true;
    addText.classList.add('hidden');
    addSpinner.classList.remove('hidden');

    try {
        const formData = new FormData();
        formData.append('name', name);
        formData.append('type', type);
        formData.append('vision', vision);
        formData.append('mission', mission);

        if (photoFile) {
            formData.append('photo', photoFile);
        }
        if (coverFile) {
            formData.append('cover_photo', coverFile);
        }

        let url = `${API_URL}/candidates`;
        let method = 'POST';

        if (isEditMode) {
            url = `${API_URL}/candidates/${form.dataset.editId}`;
            method = 'PUT';
        }

        const response = await fetch(url, {
            method: method,
            body: formData
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || `Gagal ${isEditMode ? 'mengupdate' : 'menambah'} kandidat`);
        }

        showAlert('success', `Kandidat berhasil ${isEditMode ? 'diupdate' : 'ditambahkan'}`);

        // Reset form
        form.reset();
        delete form.dataset.editId;
        document.getElementById('photo-preview').classList.add('hidden');
        document.getElementById('cover-preview').classList.add('hidden');

        // Reset button text
        addText.textContent = 'Tambah Kandidat';

        // Remove cancel button if exists
        const cancelBtn = form.querySelector('.cancel-edit-btn');
        if (cancelBtn) {
            cancelBtn.remove();
        }

        loadCandidates();

    } catch (error) {
        showAlert('error', error.message);
    } finally {
        submitBtn.disabled = false;
        addText.classList.remove('hidden');
        addSpinner.classList.add('hidden');
    }
});

// Load Candidates
async function loadCandidates() {
    try {
        // Load OSIS candidates
        const osisRes = await fetch(`${API_URL}/candidates/osis`);
        const osisData = await osisRes.json();
        if (osisData.success) {
            renderCandidateList('osis-candidates-list', osisData.candidates);
        }

        // Load MPK candidates
        const mpkRes = await fetch(`${API_URL}/candidates/mpk`);
        const mpkData = await mpkRes.json();
        if (mpkData.success) {
            renderCandidateList('mpk-candidates-list', mpkData.candidates);
        }
    } catch (error) {
        showAlert('error', 'Gagal memuat kandidat: ' + error.message);
    }
}

// Render Candidate List
function renderCandidateList(containerId, candidates) {
    const container = document.getElementById(containerId);

    if (candidates.length === 0) {
        container.innerHTML = '<p class="text-secondary">Belum ada kandidat</p>';
        return;
    }

    container.innerHTML = candidates.map(candidate => `
    <div class="candidate-list-item">
      <img src="${candidate.photo || '/uploads/default-avatar.png'}" 
           alt="${candidate.name}" 
           class="candidate-photo-thumb"
           onerror="this.src='/uploads/default-avatar.png'">
      <div class="candidate-details" style="flex: 1;">
        <h3 style="margin: 0 0 0.5rem 0;">${candidate.name}</h3>
        <p style="margin: 0; font-size: 0.875rem; color: var(--text-secondary);">
          <strong>Visi:</strong> ${candidate.vision || '-'}
        </p>
        <p style="margin: 0; font-size: 0.875rem; color: var(--text-muted);">
          <strong>Misi:</strong> ${candidate.mission || '-'}
        </p>
      </div>
      <div class="candidate-actions" style="display: flex; gap: 0.5rem; align-items: center;">
        <button class="btn btn-sm btn-primary" onclick="editCandidate(${candidate.id})" title="Edit Kandidat">
          ✏️ Edit
        </button>
        <button class="btn btn-sm btn-danger" onclick="deleteCandidate(${candidate.id})" title="Hapus Kandidat">
          🗑️ Hapus
        </button>
      </div>
    </div>
  `).join('');
}

// Edit Candidate
async function editCandidate(candidateId) {
    try {
        // Fetch candidate data
        const response = await fetch(`${API_URL}/candidates/id/${candidateId}`);
        const data = await response.json();

        if (!data.success) {
            throw new Error('Gagal memuat data kandidat');
        }

        const candidate = data.candidate;

        // Switch to candidates tab
        switchTab('candidates');

        // Scroll to form
        document.getElementById('candidate-form').scrollIntoView({ behavior: 'smooth', block: 'start' });

        // Fill form with candidate data
        document.getElementById('candidate-name').value = candidate.name;
        document.getElementById('candidate-type').value = candidate.type;
        document.getElementById('candidate-vision').value = candidate.vision || '';
        document.getElementById('candidate-mission').value = candidate.mission || '';

        // Show current photos if available
        if (candidate.photo) {
            const photoPreview = document.getElementById('photo-preview');
            photoPreview.src = candidate.photo;
            photoPreview.classList.remove('hidden');
        }
        if (candidate.cover_photo) {
            const coverPreview = document.getElementById('cover-preview');
            coverPreview.src = candidate.cover_photo;
            coverPreview.classList.remove('hidden');
        }

        // Change form to edit mode
        const form = document.getElementById('candidate-form');
        form.dataset.editId = candidateId;

        // Update button text
        const submitBtn = form.querySelector('button[type="submit"]');
        const addText = document.getElementById('add-text');
        addText.textContent = 'Update Kandidat';

        // Add cancel button if not exists
        let cancelBtn = form.querySelector('.cancel-edit-btn');
        if (!cancelBtn) {
            cancelBtn = document.createElement('button');
            cancelBtn.type = 'button';
            cancelBtn.className = 'btn btn-secondary cancel-edit-btn';
            cancelBtn.textContent = 'Batal';
            cancelBtn.style.marginLeft = '0.5rem';
            cancelBtn.onclick = cancelEdit;
            submitBtn.parentElement.appendChild(cancelBtn);
        }

        showAlert('info', 'Mode Edit: Ubah data kandidat dan klik Update');

    } catch (error) {
        showAlert('error', error.message);
    }
}

// Cancel Edit
function cancelEdit() {
    const form = document.getElementById('candidate-form');
    form.reset();
    delete form.dataset.editId;

    // Reset button text
    document.getElementById('add-text').textContent = 'Tambah Kandidat';

    // Remove cancel button
    const cancelBtn = form.querySelector('.cancel-edit-btn');
    if (cancelBtn) {
        cancelBtn.remove();
    }

    // Hide previews
    document.getElementById('photo-preview').classList.add('hidden');
    document.getElementById('cover-preview').classList.add('hidden');
}

// Delete Candidate
async function deleteCandidate(candidateId) {
    if (!confirm('Yakin ingin menghapus kandidat ini?')) return;

    try {
        const response = await fetch(`${API_URL}/candidates/${candidateId}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Gagal menghapus kandidat');
        }

        showAlert('success', 'Kandidat berhasil dihapus');
        loadCandidates();
        loadStatistics();

    } catch (error) {
        showAlert('error', error.message);
    }
}

// Show Alert
function showAlert(type, message) {
    const container = document.getElementById('alert-container');
    const alertClass = type === 'error' ? 'alert-error' : 'alert-success';

    container.innerHTML = `<div class="alert ${alertClass}">${message}</div>`;
    setTimeout(() => container.innerHTML = '', 5000);
}

// Show Login Alert
function showLoginAlert(type, message) {
    const container = document.getElementById('login-alert');
    const alertClass = type === 'error' ? 'alert-error' : 'alert-success';

    container.innerHTML = `<div class="alert ${alertClass}">${message}</div>`;
    setTimeout(() => container.innerHTML = '', 5000);
}

// Load Settings
async function loadSettings() {
    try {
        const response = await fetch(`${API_URL}/settings/voting_mode`);
        const data = await response.json();

        if (data.success) {
            const mode = data.value;
            if (mode === 'manual') {
                document.getElementById('mode-manual').checked = true;
            } else if (mode === 'auto') {
                document.getElementById('mode-auto').checked = true;
            }
        }
    } catch (error) {
        console.error('Error loading settings:', error);
    }
}

// Save Settings
async function saveSettings() {
    try {
        const mode = document.querySelector('input[name="voting_mode"]:checked').value;

        const response = await fetch(`${API_URL}/settings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key: 'voting_mode', value: mode })
        });

        const data = await response.json();

        if (data.success) {
            showAlert('success', 'Pengaturan berhasil disimpan');
        } else {
            throw new Error(data.error || 'Gagal menyimpan pengaturan');
        }
    } catch (error) {
        showAlert('error', error.message);
    }
}
