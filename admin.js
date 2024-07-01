import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { loadUsers } from './a_users.js';
import { loadKayitTipleri, loadKayitYonleri, addKayitTipi, addKayitYonu } from './a_kayitman.js';
import { auth } from './firebaseConfig.js';

onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("User logged in:", user);
        loadUsers();
        loadKayitTipleri();
        loadKayitYonleri();
        const kayitTipiForm = document.getElementById('kayitTipiForm');
        const kayitYonuForm = document.getElementById('kayitYonuForm');

        if (kayitTipiForm && kayitYonuForm) {
            console.log("Forms found");
            kayitTipiForm.addEventListener('submit', (e) => {
                e.preventDefault();
                console.log("Kayıt Tipi Formu Gönderildi");
                addKayitTipi();
            });
            kayitYonuForm.addEventListener('submit', (e) => {
                e.preventDefault();
                console.log("Kayıt Yönü Formu Gönderildi");
                addKayitYonu();
            });
        } else {
            console.error("Forms not found");
        }
    } else {
        // Kullanıcı oturumu kapatıldıysa login sayfasına yönlendirin
        console.log("User not logged in");
        window.location.href = 'login.html';
    }
});
