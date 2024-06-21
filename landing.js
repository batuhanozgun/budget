import { auth, db } from './firebaseConfig.js';
import { signOut } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { checkAuth } from './auth.js';

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

document.querySelectorAll('.navigation button').forEach(button => {
    button.addEventListener('click', (e) => {
        e.preventDefault();
        const target = e.target.getAttribute('data-target');
        if (target) {
            const iframe = document.getElementById('contentFrame');
            iframe.src = ''; // İframe içeriğini önce boşalt
            setTimeout(() => {
                iframe.src = target; // Sayfayı yeniden yükle
            }, 100);
        }
    });
});

document.addEventListener('DOMContentLoaded', async () => {
    const user = await checkAuth();
    if (user) {
        loadUserName(user);
    }
});

async function loadUserName(user) {
    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const userData = docSnap.data();
        document.getElementById('userName').textContent = userData.firstName || '';
    } else {
        console.log("No such document!");
    }
}
