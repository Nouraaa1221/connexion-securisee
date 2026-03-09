const SecurityCore = (() => {
    let attempts = 0;
    const maxAttempts = 3;

    const checkStrength = (password) => {
        let entropy = 0;
        if (password.length >= 12) entropy += 25;
        if (/[A-Z]/.test(password)) entropy += 25;
        if (/[0-9]/.test(password)) entropy += 25;
        if (/[^A-Za-z0-9]/.test(password)) entropy += 25;
        
        const lenLi = document.getElementById('len');
        const specLi = document.getElementById('spec');
        
        if(lenLi) lenLi.className = password.length >= 12 ? 'valid' : 'invalid';
        if(specLi) specLi.className = (/[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)) ? 'valid' : 'invalid';
        
        return entropy;
    };

    const hashData = async (data) => {
        const encoder = new TextEncoder();
        const msgBuffer = encoder.encode(data + "S-CORE-SALT-2026");
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
    };

    const addLog = (msg) => {
        const log = document.getElementById('system-logs');
        if(log) log.innerHTML = `<div>[${new Date().toLocaleTimeString()}] ${msg}</div>` + log.innerHTML;
    };

    const triggerLockout = () => {
        const screen = document.getElementById('lockout-screen');
        const timerDisplay = document.getElementById('lockout-timer');
        let sec = 30;
        
        if(screen) screen.classList.remove('hidden');
        
        const itv = setInterval(() => {
            sec--;
            if(timerDisplay) timerDisplay.textContent = `00:${sec.toString().padStart(2, '0')}`;
            if (sec <= 0) {
                clearInterval(itv);
                if(screen) screen.classList.add('hidden');
                attempts = 0;
            }
        }, 1000);
    };

    return {
        init: () => {
            const passInput = document.getElementById('password');
            const bar = document.getElementById('strength-bar');
            const form = document.getElementById('loginForm');

            if(passInput) {
                passInput.addEventListener('input', (e) => {
                    const score = checkStrength(e.target.value);
                    if(bar) {
                        bar.style.width = score + "%";
                        bar.style.backgroundColor = score < 50 ? "#991b1b" : (score < 100 ? "#b45309" : "#166534");
                    }
                });
            }

            if(form) {
                form.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    if (checkStrength(passInput.value) < 75) {
                        addLog("ÉCHEC : Politique de sécurité insuffisante");
                        return;
                    }
                    
                    attempts++;
                    if (attempts >= maxAttempts) {
                        triggerLockout();
                        addLog("ALERTE : Verrouillage système activé");
                        return;
                    }
                    
                    const h = await hashData(passInput.value);
                    addLog(`CHIFFREMENT RÉUSSI : ${h.substring(0, 16)}...`);
                    
                    document.getElementById('step-1').classList.add('hidden');
                    document.getElementById('step-2').classList.remove('hidden');
                });
            }

            const verifyBtn = document.getElementById('verifyMFA');
            if(verifyBtn) {
                verifyBtn.addEventListener('click', () => {
                    addLog("VALIDATION MFA EN COURS...");
                    setTimeout(() => {
                        alert("ACCÈS RÉSEAU AUTORISÉ");
                        location.reload();
                    }, 1000);
                });
            }
        }
    };
})();


document.addEventListener('DOMContentLoaded', () => {
    SecurityCore.init();
});
