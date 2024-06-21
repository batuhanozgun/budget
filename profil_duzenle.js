import { auth, db } from './firebaseConfig.js';
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { updateEmail, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { checkAuth } from './auth.js';

document.addEventListener('DOMContentLoaded', async () => {
    const user = await checkAuth();
    if (user) {
        loadProfile(user);
    }
});

async function loadProfile(user) {
    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const userData = docSnap.data();
        document.getElementById('firstName').value = userData.firstName || '';
        document.getElementById('lastName').value = userData.lastName || '';
        document.getElementById('birthDate').value = userData.birthDate || '';
        document.getElementById('email').value = user.email || '';
    } else {
        console.log("No such document!");
    }
}

document.getElementById('profileForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const user = await checkAuth();
    if (!user) {
        return;
    }

    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const birthDate = document.getElementById('birthDate').value;

    const docRef = doc(db, "users", user.uid);

    try {
        await setDoc(docRef, {
            firstName: firstName,
            lastName: lastName,
            birthDate: birthDate
        }, { merge: true });
        alert("Profil bilgileri başarıyla güncellendi!");
    } catch (error) {
        console.error("Profil güncelleme hatası: ", error);
        alert("Profil güncelleme hatası: " + error.message);
    }
});

document.getElementById('loginInfoForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const user = await checkAuth();
    if (!user) {
        return;
    }

    const newEmail = document.getElementById('email').value;
    try {
        await updateEmail(user, newEmail);
        alert("E-posta başarıyla güncellendi!");
    } catch (error) {
        console.error("E-posta güncelleme hatası: ", error);
        alert("E-posta güncelleme hatası: " + error.message);
    }
});

document.getElementById('passwordForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const user = await checkAuth();
    if (!user) {
        return;
    }

    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmNewPassword = document.getElementById('confirmNewPassword').value;

    if (newPassword !== confirmNewPassword) {
        alert("Yeni şifreler uyuşmuyor!");
        return;
    }

    const credential = EmailAuthProvider.credential(user.email, currentPassword);

    try {
        await reauthenticateWithCredential(user, credential);
        await updatePassword(user, newPassword);
        alert("Şifre başarıyla güncellendi!");
    } catch (error) {
        console.error("Şifre güncelleme hatası: ", error);
        alert("Şifre güncelleme hatası: " + error.message);
    }
});
