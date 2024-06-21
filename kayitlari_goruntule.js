import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-app.js";
import { getFirestore, collection, query, getDocs, where, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-auth.js";

// Firebase yapılandırmanızı buraya ekleyin
const firebaseConfig = {
    apiKey: "AIzaSyDidWK1ghqKTzokhT-YoqGb7Tz9w5AFjhM",
    authDomain: "batusbudget.firebaseapp.com",
    projectId: "batusbudget",
    storageBucket: "batusbudget.appspot.com",
    messagingSenderId: "1084998760222",
    appId: "1:1084998760222:web:d28492021d0ccefaf2bb0f"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

onAuthStateChanged(auth, (user) => {
    if (user) {
        loadTransactions(user.uid);
    } else {
        // Kullanıcı oturumu kapatıldıysa login sayfasına yönlendirin
        window.location.href = 'login.html';
    }
});

async function loadTransactions(uid) {
    const q = query(collection(db, 'transactions'), where("userId", "==", uid));
    const querySnapshot = await getDocs(q);

    const tableBody = document.getElementById('transactionsTableBody');
    tableBody.innerHTML = '';

    for (const transactionDoc of querySnapshot.docs) {
        const data = transactionDoc.data();

        let kategoriName = 'N/A';
        let altKategoriName = 'N/A';
        let kaynakHesapName = 'N/A';
        let hedefHesapName = 'N/A';

        // Kategori verisini alırken hata kontrolü
        try {
            if (data.kategori) {
                const kategoriDoc = await getDoc(doc(db, 'categories', data.kategori));
                if (kategoriDoc.exists()) {
                    kategoriName = kategoriDoc.data().name;
                } else {
                    console.warn('Kategori belgesi bulunamadı:', data.kategori);
                }
            } else {
                console.warn('Kategori ID eksik:', data);
            }
        } catch (error) {
            console.error('Kategori verisi alınamadı:', error);
        }

        // Alt Kategori verisini alırken hata kontrolü
        if (data.altKategori) {
            try {
                const altKategoriDoc = await getDoc(doc(db, 'categories', data.kategori, 'subcategories', data.altKategori));
                if (altKategoriDoc.exists()) {
                    altKategoriName = altKategoriDoc.data().name;
                } else {
                    console.warn('Alt Kategori belgesi bulunamadı:', data.altKategori);
                }
            } catch (error) {
                console.error('Alt Kategori verisi alınamadı:', error);
            }
        }

        // Kaynak Hesap verisini alırken hata kontrolü
        try {
            if (data.kaynakHesap) {
                const kaynakHesapDoc = await getDoc(doc(db, 'accounts', data.kaynakHesap));
                if (kaynakHesapDoc.exists()) {
                    kaynakHesapName = kaynakHesapDoc.data().accountName;
                } else {
                    console.warn('Kaynak Hesap belgesi bulunamadı:', data.kaynakHesap);
                }
            } else {
                console.warn('Kaynak Hesap ID eksik:', data);
            }
        } catch (error) {
            console.error('Kaynak Hesap verisi alınamadı:', error);
        }

        // Hedef Hesap verisini alırken hata kontrolü
        if (data.hedefHesap) {
            try {
                const hedefHesapDoc = await getDoc(doc(db, 'accounts', data.hedefHesap));
                if (hedefHesapDoc.exists()) {
                    hedefHesapName = hedefHesapDoc.data().accountName;
                } else {
                    console.warn('Hedef Hesap belgesi bulunamadı:', data.hedefHesap);
                }
            } catch (error) {
                console.error('Hedef Hesap verisi alınamadı:', error);
            }
        }

        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${data.kayitTipi}</td>
            <td>${data.kayitYonu}</td>
            <td>${kaynakHesapName}</td>
            <td>${kategoriName}</td>
            <td>${altKategoriName}</td>
            <td>${hedefHesapName}</td>
            <td>${data.tutar}</td>
            <td>${data.taksitAdedi || ''}</td>
            <td>${data.taksitTutar || ''}</td>
            <td>${new Date(data.date.seconds * 1000).toLocaleDateString()}</td>
        `;

        tableBody.appendChild(row);
    }
}

document.getElementById('searchInput').addEventListener('input', filterTransactions);

function filterTransactions() {
    const searchText = document.getElementById('searchInput').value.toLowerCase();
    const rows = document.querySelectorAll('#transactionsTableBody tr');

    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        const rowText = Array.from(cells).map(cell => cell.textContent.toLowerCase()).join(' ');
        row.style.display = rowText.includes(searchText) ? '' : 'none';
    });
}
