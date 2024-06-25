import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-app.js";
import { getFirestore, collection, query, getDocs, where, doc, getDoc, deleteDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-firestore.js";
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

onAuthStateChanged(auth, async (user) => {
    if (user) {
        showLoading();
        const transactions = await getTransactions(user.uid);
        const transactionsWithDetails = await addDetailsToTransactions(transactions);
        hideLoading();
        displayTransactions(transactionsWithDetails);
    } else {
        // Kullanıcı oturumu kapatıldıysa login sayfasına yönlendirin
        window.location.href = 'login.html';
    }
});

async function getTransactions(uid) {
    const q = query(collection(db, 'transactions'), where('userId', '==', uid));
    const transactionsSnapshot = await getDocs(q);
    const transactions = [];
    transactionsSnapshot.forEach(doc => {
        transactions.push({ id: doc.id, ...doc.data() });
    });
    return transactions;
}

async function addDetailsToTransactions(transactions) {
    const accountPromises = transactions.map(async transaction => {
        if (transaction.kaynakHesap) {
            const kaynakHesapDoc = await getDoc(doc(db, 'accounts', transaction.kaynakHesap));
            if (kaynakHesapDoc.exists()) {
                transaction.kaynakHesapName = kaynakHesapDoc.data().accountName;
            }
        }
        if (transaction.hedefHesap) {
            const hedefHesapDoc = await getDoc(doc(db, 'accounts', transaction.hedefHesap));
            if (hedefHesapDoc.exists()) {
                transaction.hedefHesapName = hedefHesapDoc.data().accountName;
            }
        }
        if (transaction.kategori) {
            const kategoriDoc = await getDoc(doc(db, 'categories', transaction.kategori));
            if (kategoriDoc.exists()) {
                transaction.kategoriName = kategoriDoc.data().name;
            }
        }
        if (transaction.altKategori) {
            const altKategoriDoc = await getDoc(doc(db, 'categories', transaction.kategori, 'subcategories', transaction.altKategori));
            if (altKategoriDoc.exists()) {
                transaction.altKategoriName = altKategoriDoc.data().name;
            }
        }
        return transaction;
    });
    return Promise.all(accountPromises);
}

function displayTransactions(transactions) {
    const tableBody = document.getElementById('transactionsTableBody');
    tableBody.innerHTML = '';  // Tablodaki önceki verileri temizle

    transactions.forEach(transaction => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${transaction.kayitTipi}</td>
            <td>${transaction.kayitYonu}</td>
            <td>${transaction.kaynakHesapName || transaction.kaynakHesap}</td>
            <td>${transaction.kategoriName || transaction.kategori}</td>
            <td>${transaction.altKategoriName || transaction.altKategori}</td>
            <td>${transaction.hedefHesapName || transaction.hedefHesap}</td>
            <td>${transaction.tutar}</td>
            <td>${transaction.taksitAdedi || ''}</td>
            <td>${transaction.taksitTutar || ''}</td>
            <td>${new Date(transaction.islemTarihi).toLocaleDateString()}</td>
            <td>${new Date(transaction.date.seconds * 1000).toLocaleDateString()}</td>
            <td>
                <div class="action-buttons">
                    <button onclick="editTransaction('${transaction.id}')">Düzenle</button>
                    <button onclick="deleteTransaction('${transaction.id}')">Sil</button>
                </div>
            </td>
        `;

        tableBody.appendChild(row);
    });
}

document.getElementById('searchInput').addEventListener('input', filterTransactions);

function filterTransactions() {
    const searchText = document.getElementById('searchInput').value.toLowerCase();
    const rows = document.getElementById('transactionsTableBody').getElementsByTagName('tr');

    for (const row of rows) {
        const cells = row.getElementsByTagName('td');
        let match = false;
        for (const cell of cells) {
            if (cell.textContent.toLowerCase().includes(searchText)) {
                match = true;
                break;
            }
        }
        row.style.display = match ? '' : 'none';
    }
}

window.deleteTransaction = async (transactionId) => {
    if (confirm("Bu kaydı silmek istediğinize emin misiniz?")) {
        showLoading();
        await deleteDoc(doc(db, 'transactions', transactionId));
        const transactions = await getTransactions(auth.currentUser.uid);
        const transactionsWithDetails = await addDetailsToTransactions(transactions);
        hideLoading();
        displayTransactions(transactionsWithDetails);
    }
};

window.editTransaction = async (transactionId) => {
    const newAmount = prompt("Yeni tutarı girin:");
    if (newAmount !== null) {
        showLoading();
        await updateDoc(doc(db, 'transactions', transactionId), {
            tutar: parseFloat(newAmount)
        });
        const transactions = await getTransactions(auth.currentUser.uid);
        const transactionsWithDetails = await addDetailsToTransactions(transactions);
        hideLoading();
        displayTransactions(transactionsWithDetails);
    }
};

function showLoading() {
    document.querySelector('.loading-overlay').style.display = 'flex';
}

function hideLoading() {
    document.querySelector('.loading-overlay').style.display = 'none';
}
