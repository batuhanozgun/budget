// menu.js
import { signOut } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";

export function loadMenu() {
    fetch('menu.html')
        .then(response => response.text())
        .then(html => {
            document.getElementById('menuContainer').innerHTML = html;
            loadPageContent();
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
