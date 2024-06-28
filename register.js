import { auth, db } from './firebaseConfig.js';
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const messageDiv = document.getElementById('message');

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Kullanıcı bilgilerini Firestore'a kaydet
        await setDoc(doc(db, 'users', user.uid), {
            uid: user.uid,
            email: user.email,
            firstName: firstName,
            lastName: lastName,
            admin: false // Varsayılan olarak admin olmayan kullanıcı
        });

        window.location.href = 'verify_email.html';
    } catch (error) {
        console.error('Kayıt hatası: ', error);
        if (error.message.includes('auth/email-already-in-use')) {
            messageDiv.textContent = 'Zaten kayıtlısın, giriş yap';
        } else {
            messageDiv.textContent = 'Kayıt hatası: ' + error.message;
        }
        messageDiv.style.display = 'block';
    }
});
