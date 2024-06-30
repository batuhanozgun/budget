import { app, auth, db, doc, getDoc } from './firebaseConfig.js';
import { collection, query, getDocs, where, deleteDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";

onAuthStateChanged(auth, async (user) => {
    if (user) {
        showLoading();
        const transactions = await getTransactions(user.uid);
        const transactionsWithDetails = await addDetailsToTransactions(transactions);
        hideLoading();
        displayTransactions(transactionsWithDetails);
    } else {
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
            <td>${new Date(transaction.islemTarihi).toLocaleDateString()}</td>
            <td>${new Date(transaction.date.seconds * 1000).toLocaleDateString()}</td>
            <td>${transaction.detay || ''}</td>
            <td>
                <div class="action-buttons">
                    <button onclick="editTransaction('${transaction.id}')">Düzenle</button>
                    <button onclick="deleteTransaction('${transaction.id}')">Sil</button>
                </div>
            </td>
        `;

        tableBody.appendChild(row);
    });

    // DataTables başlatma
    $(document).ready(function() {
        $('#transactionsTable').DataTable({
            "paging": true,
            "searching": true,
            "ordering": true,
            "info": true
        });
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

window.changeFontSize = (increase) => {
    const body = document.body;
    let currentSize = parseFloat(window.getComputedStyle(body, null).getPropertyValue('font-size'));
    if (increase) {
        body.style.fontSize = (currentSize + 1) + 'px';
    } else {
        body.style.fontSize = (currentSize - 1) + 'px';
    }
};
