// register.js
import { auth } from './firebaseConfig.js';
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";

document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        await createUserWithEmailAndPassword(auth, email, password);
        alert('Kayıt başarılı!');
        window.location.href = 'landing.html';
    } catch (error) {
        console.error('Kayıt hatası: ', error);
        alert('Kayıt hatası: ' + error.message);
    }
});
