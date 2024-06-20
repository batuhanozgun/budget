// login.js
import { auth } from './firebaseConfig.js';
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const messageDiv = document.getElementById('message');

    try {
        await signInWithEmailAndPassword(auth, email, password);
        window.location.href = 'landing.html';
    } catch (error) {
        console.error('Giriş hatası: ', error);
        messageDiv.textContent = 'E-Posta ya da şifre hatalı';
    }
});
