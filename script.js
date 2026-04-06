// --- CONFIG GENERALE ---
const MAX_ESSAIS = 5;
const DUREE_BLOCAGE = 30; // secondes
const MOCK_USER = { user: 'admin@secure.com', pass: 'Admin@2024!' };

let S = {
    essais: 0,
    bloque: false,
    codeMFA: '',
    timerMFA: null
};

// Analyse force mdp - TODO: peut être ajouter plus de critères plus tard ?
function onPassInput(v) {
    const wrap = document.getElementById('strengthWrap');
    if (!v) { wrap.style.display = 'none'; return; }
    wrap.style.display = 'block';

    const score = [v.length >= 8, /[A-Z]/.test(v), /[0-9]/.test(v), /[^a-zA-Z0-9]/.test(v)].filter(Boolean).length;
    const labels = ["Invalide", "Faible", "Moyen", "Bon", "Excellent"];
    const colors = ["#d0331e", "#d0331e", "#c47d00", "#1a7f4f", "#1a7f4f"];

    const t = document.getElementById('strTxt');
    t.textContent = labels[score];
    t.style.color = colors[score];

    for (let i = 0; i < 4; i++) {
        document.getElementById('b' + i).style.background = (i < score) ? colors[score] : "#e8e6e1";
    }
}

// Gestion de la connexion
async function handleLogin() {
    if (S.bloque) return;

    const user = document.getElementById('inputUser').value.trim();
    const pass = document.getElementById('inputPass').value;
    const btn = document.getElementById('btnLogin');

    btn.classList.add('loading');
    await new Promise(r => setTimeout(r, 1000)); // Simulation delai serveur
    btn.classList.remove('loading');

    if (user === MOCK_USER.user && pass === MOCK_USER.pass) {
        // C'est bon, on passe à la suite
        lancer2FA(user);
    } else {
        // Mauvais identifiants
        S.essais++;
        const reste = MAX_ESSAIS - S.essais;
        document.getElementById('attLabel').textContent = `${reste} tentative(s) restante(s)`;
        
        document.getElementById('alertLogin').textContent = "Identifiant ou mot de passe incorrect.";
        document.getElementById('alertLogin').classList.add('show', 'danger');
        
        secouerCarte();
        if (S.essais >= MAX_ESSAIS) lancerBlocage();
    }
}

// Protection anti-brute force
function lancerBlocage() {
    S.bloque = true;
    changerEcran('screenLock');
    let t = DUREE_BLOCAGE;
    const num = document.getElementById('lockNum');
    
    const interval = setInterval(() => {
        t--;
        num.textContent = t;
        if (t <= 0) {
            clearInterval(interval);
            S.bloque = false;
            S.essais = 0;
            document.getElementById('attLabel').textContent = "5 tentatives restantes";
            changerEcran('screenLogin');
        }
    }, 1000);
}

// Logique 2FA
function lancer2FA(email) {
    S.codeMFA = String(Math.floor(100000 + Math.random() * 900000));
    document.getElementById('demoCode').textContent = S.codeMFA.split('').join(' ');
    document.getElementById('codeTarget').textContent = email;
    changerEcran('screen2FA');
    
    // Auto-focus sur les cases OTP
    const inputs = document.querySelectorAll('.otp-digit');
    inputs.forEach((inp, i) => {
        inp.value = ""; // Clean au cas ou
        inp.oninput = () => { if (inp.value && i < 5) inputs[i+1].focus(); };
    });
}

async function handleVerify() {
    const codeSaisi = Array.from(document.querySelectorAll('.otp-digit')).map(i => i.value).join('');
    if (codeSaisi === S.codeMFA) {
        // FIXME: Generer un vrai token cote serveur ici normalement
        document.getElementById('jwtDisplay').textContent = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.demo_token_conex_noura";
        changerEcran('screenSuccess');
    } else {
        secouerCarte();
        // On vide les cases si c'est faux
        document.querySelectorAll('.otp-digit').forEach(i => i.value = "");
    }
}

// Helpers UI
function changerEcran(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

function secouerCarte() {
    const c = document.getElementById('card');
    c.classList.add('shake');
    setTimeout(() => c.classList.remove('shake'), 400);
}

function resetToLogin() {
    changerEcran('screenLogin');
}
