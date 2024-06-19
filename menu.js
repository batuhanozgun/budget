import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";

const auth = getAuth();

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
