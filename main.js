// main.js
import { loadMenu, logout } from './menu.js';
import { auth } from './firebaseConfig.js';

document.addEventListener('DOMContentLoaded', () => {
    loadMenu();

    document.addEventListener('click', (event) => {
        if (event.target && event.target.id === 'logoutButton') {
            logout(auth);
        }
    });
});
