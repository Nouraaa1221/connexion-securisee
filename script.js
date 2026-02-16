
async function hashPassword(password) {
    const encoder = new TextEncoder(); // encode le texte en tableau de bytes
    const data = encoder.encode(password); // encode le mot de passe
    const hashBuffer = await crypto.subtle.digest('SHA-256', data); // calcule le hash
    const hashArray = Array.from(new Uint8Array(hashBuffer)); // transforme en tableau de nombres
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join(''); // convertit en chaîne hexadécimale
}

const form = document.getElementById("loginForm");
const message = document.getElementById("message");
const button = form.querySelector("button");

const MAX_ATTEMPTS = 3;
let attempts = 0;
let blocked = false;


form.addEventListener("submit", function (e) {
    e.preventDefault(); // empêche le rechargement de la page

    if (blocked) {
        message.style.color = "red";
        message.textContent = "Blocage temporaire après trop de tentatives.";
        return;
    }

    const password = document.getElementById("password").value;
    attempts++; // compte toutes les tentatives


    if (attempts > MAX_ATTEMPTS) {
        blocked = true;
        button.disabled = true;
        message.style.color = "red";
        message.textContent = "Blocage temporaire après trop de tentatives.";

        setTimeout(() => {
            attempts = 0;
            blocked = false;
            button.disabled = false;
            message.textContent = "";
        }, 30000);

        return;
    }


    if (!isStrongPassword(password)) {
        message.style.color = "red";
        message.textContent = "Mot de passe trop faible.";
        return;
    }


    hashPassword(password).then(hash => {
        console.log("Hash du mot de passe :", hash); // affichage dans la console
        message.style.color = "green";
        message.textContent = "Connexion simulée réussie (mot de passe sécurisé)";
    });
});

function isStrongPassword(password) {
    return password.length >= 8 &&
           /[A-Z]/.test(password) &&
           /[0-9]/.test(password);
}

