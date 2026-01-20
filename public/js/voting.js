// API Configuration - Automatically detect hostname
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000/api'
    : `http://${window.location.hostname}:3000/api`;

let tokenId = null;
let selectedOsis = null;
let selectedMpk = null;

// Get token from session storage
window.addEventListener('DOMContentLoaded', () => {
    tokenId = sessionStorage.getItem('tokenId');
    if (!tokenId) {
        window.location.href = '/';
        return;
    }
    loadCandidates();
});

// Load candidates
async function loadCandidates() {
    try {
        // Load OSIS candidates
        const osisRes = await fetch(`${API_URL}/candidates/osis`);
        const osisData = await osisRes.json();

        if (osisData.success) {
            renderCandidates('osis-candidates', osisData.candidates, 'osis');
        }

        // Load MPK candidates
        const mpkRes = await fetch(`${API_URL}/candidates/mpk`);
        const mpkData = await mpkRes.json();

        if (mpkData.success) {
            renderCandidates('mpk-candidates', mpkData.candidates, 'mpk');
        }
    } catch (error) {
        showAlert('error', 'Gagal memuat kandidat: ' + error.message);
    }
}

// Render candidates with 3D effect
function renderCandidates(containerId, candidates, type) {
    const container = document.getElementById(containerId);

    if (candidates.length === 0) {
        container.innerHTML = '<p class="text-center text-secondary">Belum ada kandidat</p>';
        return;
    }

    container.innerHTML = candidates.map(candidate => `
        <div class="candidate-card" onclick="selectCandidate(${candidate.id}, '${type}')">
          <div class="wrapper">
            <img src="${candidate.cover_photo || candidate.photo || '/uploads/default-avatar.png'}" 
                 alt="${candidate.name}" 
                 class="cover-image" 
                 onerror="this.src='/uploads/default-avatar.png'">
          </div>
          ${candidate.photo ? `<img src="${candidate.photo}" class="character-image" alt="${candidate.name}">` : ''}
          <div class="vision-overlay">
            ${candidate.vision ? `<div><h4>Visi</h4><p>${candidate.vision}</p></div>` : ''}
            ${candidate.mission ? `<div class="mission"><h4>Misi</h4><p>${candidate.mission}</p></div>` : ''}
          </div>
          <div class="candidate-info">
            <h3 class="candidate-name">${candidate.name}</h3>
          </div>
        </div>
      `).join('');
}

// Select candidate
function selectCandidate(candidateId, type) {
    if (type === 'osis') {
        selectedOsis = candidateId;
        document.querySelectorAll('#osis-candidates .candidate-card').forEach(card => {
            card.classList.remove('selected');
        });
        event.currentTarget.classList.add('selected');
        document.getElementById('next-to-mpk').disabled = false;
    } else {
        selectedMpk = candidateId;
        document.querySelectorAll('#mpk-candidates .candidate-card').forEach(card => {
            card.classList.remove('selected');
        });
        event.currentTarget.classList.add('selected');
        document.getElementById('submit-vote').disabled = false;
    }
}

// Navigation
document.getElementById('next-to-mpk')?.addEventListener('click', () => {
    document.getElementById('osis-section').classList.remove('active');
    document.getElementById('mpk-section').classList.add('active');
    document.getElementById('step-osis').classList.remove('active');
    document.getElementById('step-osis').classList.add('completed');
    document.getElementById('step-mpk').classList.add('active');
    window.scrollTo(0, 0);
});

document.getElementById('back-to-osis')?.addEventListener('click', () => {
    document.getElementById('mpk-section').classList.remove('active');
    document.getElementById('osis-section').classList.add('active');
    document.getElementById('step-mpk').classList.remove('active');
    document.getElementById('step-osis').classList.remove('completed');
    document.getElementById('step-osis').classList.add('active');
    window.scrollTo(0, 0);
});

// Submit votes
document.getElementById('submit-vote')?.addEventListener('click', async () => {
    const submitBtn = document.getElementById('submit-vote');
    const submitText = document.getElementById('submit-text');
    const submitSpinner = document.getElementById('submit-spinner');

    submitBtn.disabled = true;
    submitText.classList.add('hidden');
    submitSpinner.classList.remove('hidden');

    try {
        // Submit OSIS vote
        const osisRes = await fetch(`${API_URL}/votes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tokenId, candidateId: selectedOsis })
        });

        if (!osisRes.ok) {
            const error = await osisRes.json();
            throw new Error(error.error || 'Gagal mengirim suara OSIS');
        }

        // Submit MPK vote
        const mpkRes = await fetch(`${API_URL}/votes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tokenId, candidateId: selectedMpk })
        });

        if (!mpkRes.ok) {
            const error = await mpkRes.json();
            throw new Error(error.error || 'Gagal mengirim suara MPK');
        }

        // Show success screen
        document.getElementById('mpk-section').classList.remove('active');
        document.getElementById('success-section').classList.add('active');
        sessionStorage.removeItem('tokenId');

        // Start countdown and redirect after 5 seconds
        let countdown = 5;
        const countdownElement = document.getElementById('countdown');

        const countdownInterval = setInterval(() => {
            countdown--;
            if (countdownElement) {
                countdownElement.textContent = countdown;
            }

            if (countdown <= 0) {
                clearInterval(countdownInterval);
                window.location.href = '/';
            }
        }, 1000);

    } catch (error) {
        showAlert('error', error.message);
        submitBtn.disabled = false;
        submitText.classList.remove('hidden');
        submitSpinner.classList.add('hidden');
    }
});

// Show alert
function showAlert(type, message) {
    const container = document.getElementById('alert-container');
    const alertClass = type === 'error' ? 'alert-error' : 'alert-success';
    container.innerHTML = `<div class="alert ${alertClass}">${message}</div>`;
    setTimeout(() => container.innerHTML = '', 5000);
}
