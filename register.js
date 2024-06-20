// register.js
import { auth } from './firebaseConfig.js';
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";

document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const messageDiv = document.getElementById('message');

    try {
        await createUserWithEmailAndPassword(auth, email, password);
        window.location.href = 'verify_email.html';
    } catch (error) {
        console.error('Kayıt hatası: ', error);
        if (error.code === 'auth/email-already-in-use') {
            messageDiv.textContent = 'Zaten kayıtlısın, giriş yap';
        } else {
            alert('Kayıt hatası: ' + error.message);
        }
    }
});
