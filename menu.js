// menu.js
import { signOut } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { auth } from './firebaseConfig.js';

export function loadMenu() {
    fetch('menu.html')
        .then(response => response.text())
        .then(html => {
            document.getElementById('menuContainer').innerHTML = html;
            loadPageContent();

            // Kullanıcının oturum açma durumunu kontrol et
            onAuthStateChanged(auth, (user) => {
                const logoutButton = document.getElementById('logoutButton');
                if (user) {
                    // Kullanıcı oturum açmışsa logoutButton'ı göster
                    if (logoutButton) {
                        logoutButton.style.display = 'inline';
                    }
                } else {
                    // Kullanıcı oturum açmamışsa logoutButton'ı gizle
                    if (logoutButton) {
                        logoutButton.style.display = 'none';
                    }
                }
            });
        })
        .catch(error => console.error('Menü yükleme hatası: ', error));
}

function loadPageContent() {
    const page = document.body.getAttribute('data-page');
    if (page) {
        fetch(`${page}.html`)
            .then(response => response.text())
            .then(html => {
                document.getElementById('contentContainer').innerHTML = html;
            })
            .catch(error => console.error('Sayfa içeriği yükleme hatası: ', error));
    }
}

export function logout(auth) {
    signOut(auth).then(() => {
        alert('Başarıyla çıkış yaptınız.');
        window.location.href = 'login.html';
    }).catch((error) => {
        console.error('Çıkış hatası: ', error);
        alert('Çıkış hatası: ' + error.message);
    });
}
