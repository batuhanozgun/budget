// register.js
import { auth } from './firebaseConfig.js';
import { createUserWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";

document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await updateProfile(user, {
            displayName: username
        });

        alert('Kayıt başarılı!');
        window.location.href = 'landing.html';
    } catch (error) {
        console.error('Kayıt hatası: ', error);
        alert('Kayıt hatası: ' + error.message);
    }
});
