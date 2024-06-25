import { auth } from './firebaseConfig.js';

export function checkAuth() {
    return new Promise((resolve, reject) => {
        auth.onAuthStateChanged((user) => {
            if (user) {
                resolve(user);
            } else {
                window.location.href = 'login.html';
                reject('Kullanıcı oturumu açık değil.');
            }
        });
    });
}

export function getCurrentUser() {
    return auth.currentUser;
}
