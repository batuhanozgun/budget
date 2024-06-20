// main.js
import { loadMenu, logout } from './menu.js';
import { auth } from './firebaseConfig.js';

document.addEventListener('DOMContentLoaded', () => {
    loadMenu();

    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            logout(auth);
        });
    }
});
