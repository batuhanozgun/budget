// main.js
import { loadMenu, logout } from './menu.js';
import { auth } from './firebaseConfig.js';

document.addEventListener('DOMContentLoaded', () => {
    // Sadece index.html dışında menüyü yükle
    if (document.body.getAttribute('data-page') !== 'index') {
        loadMenu();

        document.addEventListener('click', (event) => {
            if (event.target && event.target.id === 'logoutButton') {
                logout(auth);
            }
        });
    }
});
