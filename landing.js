// landing.js
import { auth } from './firebaseConfig.js';
import { signOut } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";

document.getElementById('logoutButton').addEventListener('click', async () => {
    const messageDiv = document.getElementById('message');

    try {
        await signOut(auth);
        window.location.href = 'login.html';
    } catch (error) {
        console.error('Çıkış hatası: ', error);
        messageDiv.textContent = 'Çıkış hatası: ' + error.message;
        messageDiv.style.display = 'block';
    }
});
