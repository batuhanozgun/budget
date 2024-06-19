import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";

// Firebase konfigürasyonu
const firebaseConfig = {
    apiKey: "AIzaSyDidWK1ghqKTzokhT-YoqGb7Tz9w5AFjhM",
    authDomain: "batusbudget.firebaseapp.com",
    projectId: "batusbudget",
    storageBucket: "batusbudget.appspot.com",
    messagingSenderId: "1084998760222",
    appId: "1:1084998760222:web:d28492021d0ccefaf2bb0f"
};

// Firebase'i başlat
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export function loadMenu() {
    fetch('menu.html')
        .then(response => response.text())
        .then(html => {
            document.getElementById('menuContainer').innerHTML = html;
            eval(document.getElementById('menuContainer').querySelector('script').textContent);
        })
        .catch(error => console.error('Menü yükleme hatası: ', error));
}

window.logout = function() {
    signOut(auth).then(() => {
        alert('Başarıyla çıkış yaptınız.');
        window.location.href = 'login.html';
    }).catch((error) => {
        console.error('Çıkış hatası: ', error);
        alert('Çıkış hatası: ' + error.message);
    });
}
