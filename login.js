// login.js
import { auth, db } from './firebaseConfig.js';
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { doc, updateDoc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const messageDiv = document.getElementById('message');

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Son giriş zamanını güncelle
        await updateDoc(doc(db, 'users', user.uid), {
            lastLogin: new Date()
        });

        window.location.href = 'landing.html';
    } catch (error) {
        console.error('Giriş hatası: ', error);
        messageDiv.textContent = 'E-Posta ya da şifre hatalı';
        messageDiv.style.display = 'block';
    }
});
