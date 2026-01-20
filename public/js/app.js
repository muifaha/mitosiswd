// API Configuration
// Automatically detect if running locally or on remote server
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000/api'
    : `http://${window.location.hostname}:3000/api`;

// Check voting mode on page load
window.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch(`${API_URL}/settings/voting_mode`);
        const data = await response.json();

        if (data.success && data.value === 'auto') {
            // Auto mode: hide token input, show direct button
            setupAutoMode();
        }
    } catch (error) {
        console.error('Error checking voting mode:', error);
        // If error, fall back to manual mode
    }
});

// Setup auto mode UI
function setupAutoMode() {
    const tokenInputGroup = document.querySelector('.input-group');
    const tokenInput = document.getElementById('token');
    const infoBox = document.querySelector('.info-box');
    const btnText = document.getElementById('btn-text');

    // Hide token input
    if (tokenInputGroup) {
        tokenInputGroup.style.display = 'none';
    }

    // Remove required attribute to prevent validation error
    if (tokenInput) {
        tokenInput.removeAttribute('required');
    }

    // Update info text
    if (infoBox) {
        infoBox.innerHTML = '<p>💡 Klik tombol di bawah untuk memulai voting. Token akan otomatis digunakan.</p>';
    }

    // Update button text
    if (btnText) {
        btnText.textContent = 'Mulai Voting';
    }
}

// Auto assign token
async function autoAssignToken() {
    const submitBtn = document.getElementById('submit-btn');
    const btnText = document.getElementById('btn-text');
    const btnSpinner = document.getElementById('btn-spinner');

    // Show loading state
    submitBtn.disabled = true;
    btnText.classList.add('hidden');
    btnSpinner.classList.remove('hidden');

    try {
        const response = await fetch(`${API_URL}/tokens/available`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Tidak ada token tersedia');
        }

        // Store token ID and redirect
        sessionStorage.setItem('tokenId', data.tokenId);
        window.location.href = '/voting.html';

    } catch (error) {
        showAlert('error', error.message);
        submitBtn.disabled = false;
        btnText.classList.remove('hidden');
        btnSpinner.classList.add('hidden');
    }
}


// Token Form Handler
document.getElementById('token-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const tokenInput = document.getElementById('token');
    const tokenInputGroup = document.querySelector('.input-group');
    const submitBtn = document.getElementById('submit-btn');
    const btnText = document.getElementById('btn-text');
    const btnSpinner = document.getElementById('btn-spinner');

    console.log('Form submitted, checking mode...');
    console.log('Token input group display:', tokenInputGroup?.style.display);

    // Check if in auto mode (token input is hidden)
    if (tokenInputGroup && tokenInputGroup.style.display === 'none') {
        console.log('Auto mode detected, calling autoAssignToken...');
        // Auto mode: assign token automatically
        await autoAssignToken();
        return;
    }

    // Manual mode: validate token input
    const token = tokenInput ? tokenInput.value.trim() : '';

    if (!token) {
        showAlert('error', 'Mohon masukkan token');
        return;
    }

    // Disable button and show spinner
    submitBtn.disabled = true;
    btnText.classList.add('hidden');
    btnSpinner.classList.remove('hidden');

    try {
        const response = await fetch(`${API_URL}/tokens/validate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Token tidak valid');
        }

        // Store token ID in session storage
        sessionStorage.setItem('tokenId', data.tokenId);

        // Redirect to voting page
        window.location.href = '/voting.html';

    } catch (error) {
        showAlert('error', error.message);
        submitBtn.disabled = false;
        btnText.classList.remove('hidden');
        btnSpinner.classList.add('hidden');
    }
});

// Show Alert Function
function showAlert(type, message) {
    const container = document.getElementById('alert-container');
    const alertClass = type === 'error' ? 'alert-error' : type === 'success' ? 'alert-success' : 'alert-info';

    container.innerHTML = `
    <div class="alert ${alertClass}">
      ${message}
    </div>
  `;

    // Auto-hide after 5 seconds
    setTimeout(() => {
        container.innerHTML = '';
    }, 5000);
}
