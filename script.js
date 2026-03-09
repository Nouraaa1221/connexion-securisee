
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + "SECURE_SALT_2024"); // Ajout d'un sel
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

const form = document.getElementById("loginForm");
const passInput = document.getElementById("password");
const strengthBar = document.getElementById("strength-bar");
const btn = document.getElementById("submitBtn");
const message = document.getElementById("message");


passInput.addEventListener('input', () => {
    const val = passInput.value;
    let strength = 0;
    if (val.length >= 8) strength += 25;
    if (/[A-Z]/.test(val)) strength += 25;
    if (/[0-9]/.test(val)) strength += 25;
    if (/[^A-Za-z0-9]/.test(val)) strength += 25;

    strengthBar.style.width = strength + "%";
    
    if (strength <= 25) strengthBar.style.backgroundColor = "#ff4b5c";
    else if (strength <= 50) strengthBar.style.backgroundColor = "#ffbd2e";
    else if (strength <= 75) strengthBar.style.backgroundColor = "#3b82f6";
    else strengthBar.style.backgroundColor = "#00ff9d";
});


document.getElementById("togglePassword").addEventListener('click', function() {
    const type = passInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passInput.setAttribute('type', type);
});


let attempts = 0;

form.addEventListener("submit", async function (e) {
    e.preventDefault();
    
  
    btn.disabled = true;
    const originalText = btn.innerHTML;
    btn.innerHTML = '<span class="loader"></span> ANALYSE EN COURS...';
    message.textContent = "";

    await new Promise(r => setTimeout(r, 1500)); // Simulation délai réseau

    const password = passInput.value;
    
    if (password.length < 8) {
        showError("ERREUR : Longueur minimale non respectée.");
        resetBtn(originalText);
        return;
    }

    attempts++;
    if (attempts >= 3) {
        showError("ALERTE : Tentatives excessives. Système verrouillé 30s.");
        setTimeout(() => { attempts = 0; resetBtn(originalText); }, 30000);
        return;
    }

    const hash = await hashPassword(password);
    console.log("%c [SYSTEM] Hash généré: " + hash, "color: #00ff9d; font-weight: bold");
    
    message.style.color = "var(--primary)";
    message.textContent = "ACCÈS AUTORISÉ. BIENVENUE AGENT.";
    resetBtn(originalText);
});

function showError(txt) {
    message.style.color = "var(--error)";
    message.textContent = txt;
}

function resetBtn(oldText) {
    btn.disabled = false;
    btn.innerHTML = oldText;
}


document.getElementById('user-ip').textContent = `192.168.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}`;

