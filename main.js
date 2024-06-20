// main.js
import { loadMenu, logout } from './menu.js';
import { auth } from './firebaseConfig.js';

document.addEventListener('DOMContentLoaded', () => {
    loadMenu();

    document.getElementById('logoutButton').addEventListener('click', () => {
        logout(auth);
    });
});
