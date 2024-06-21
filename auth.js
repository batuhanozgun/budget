import { auth } from './firebaseConfig.js';

export function checkAuth() {
    auth.onAuthStateChanged((user) => {
        if (!user) {
            window.location.href = 'login.html';
        }
    });
}
