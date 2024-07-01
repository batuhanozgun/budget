import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-auth.js";
import { loadUsers } from './a_users.js';
import { loadKayitTipleri, loadKayitYonleri, addKayitTipi, addKayitYonu } from './a_kayitman.js';

const auth = getAuth();

onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("User logged in:", user);
        loadUsers();
        loadKayitTipleri();
        loadKayitYonleri();
        document.getElementById('kayitTipiForm').addEventListener('submit', (e) => {
            e.preventDefault();
            console.log("Kayıt Tipi Formu Gönderildi");
            addKayitTipi();
        });
        document.getElementById('kayitYonuForm').addEventListener('submit', (e) => {
            e.preventDefault();
            console.log("Kayıt Yönü Formu Gönderildi");
            addKayitYonu();
        });
    } else {
        // Kullanıcı oturumu kapatıldıysa login sayfasına yönlendirin
        console.log("User not logged in");
        window.location.href = 'login.html';
    }
});
