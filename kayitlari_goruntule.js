import { app, auth, db, doc, getDoc } from './firebaseConfig.js';
import { collection, query, getDocs, where, deleteDoc, updateDoc, orderBy } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
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
        if (transaction.hedefHesap && transaction.hedefHesap !== "-") {
            const hedefHesapDoc = await getDoc(doc(db, 'accounts', transaction.hedefHesap));
            if (hedefHesapDoc.exists()) {
                transaction.hedefHesapName = hedefHesapDoc.data().accountName;
            }
        } else {
            transaction.hedefHesapName = "-";
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
        if (transaction.kayitTipi) {
            const kayitTipiDoc = await getDoc(doc(db, 'kayitTipleri', transaction.kayitTipi));
            if (kayitTipiDoc.exists()) {
                transaction.kayitTipiName = kayitTipiDoc.data().name;
            }
        }
        if (transaction.kayitYonu) {
            const kayitYonuDoc = await getDoc(doc(db, 'kayitYonleri', transaction.kayitYonu));
            if (kayitYonuDoc.exists()) {
                transaction.kayitYonuName = kayitYonuDoc.data().name;
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
            <td>
                <div class="action-buttons">
                    <button onclick="editTransaction('${transaction.id}')">Düzenle</button>
                    <button onclick="deleteTransaction('${transaction.id}')">Sil</button>
                </div>
            </td>
            <td>${new Date(transaction.createDate.seconds * 1000).toLocaleDateString()}</td>
            <td>${transaction.kayitTipiName || transaction.kayitTipi}</td>
            <td>${transaction.kayitYonuName || transaction.kayitYonu}</td>
            <td>${transaction.kaynakHesapName || transaction.kaynakHesap}</td>
            <td>${transaction.kategoriName || transaction.kategori}</td>
            <td>${transaction.altKategoriName || transaction.altKategori}</td>
            <td>${transaction.hedefHesapName || transaction.hedefHesap}</td>
            <td>${new Date(transaction.islemTarihi).toLocaleDateString()}</td>
            <td>${transaction.taksitPlani || ''}</td>
            <td>${new Date(transaction.taksitTarihi.seconds * 1000).toLocaleDateString()}</td>
            <td>${transaction.tutar}</td>
            <td>${transaction.detay || ''}</td>
        `;

        tableBody.appendChild(row);
    });

    // DataTables başlatma
    $(document).ready(function() {
        $('#transactionsTable').DataTable({
            "paging": true,
            "searching": false, // Arama alanını kaldır
            "ordering": true,
            "info": true,
            "language": {
                "lengthMenu": "Gösterilen Kayıt Sayısı _MENU_",
                "info": "_TOTAL_ kaydın _START_ ile _END_ arası gösteriliyor",
                "infoEmpty": "Kayıt bulunamadı",
                "infoFiltered": "(toplam _MAX_ kayıt filtrelendi)",
                "paginate": {
                    "previous": "Önceki",
                    "next": "Sonraki"
                }
            },
            "dom": 'lfrtip', // DataTables bileşenlerinin yerleşimi
            "initComplete": function () {
                // DataTables bileşenlerini manuel olarak yerleştir
                const dataTableWrapper = document.querySelector('.dataTables_wrapper');
                const dataTableLength = dataTableWrapper.querySelector('.dataTables_length');
                const dataTableInfo = dataTableWrapper.querySelector('.dataTables_info');
                const dataTablePaginate = dataTableWrapper.querySelector('.dataTables_paginate');
                const container = document.querySelector('.container');

                container.insertBefore(dataTableLength, container.querySelector('.table-container'));
                container.appendChild(dataTableInfo);
                container.appendChild(dataTablePaginate);
            }
        });
    });
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
    const transaction = await getDoc(doc(db, 'transactions', transactionId));
    if (transaction.exists()) {
        const transactionData = transaction.data();
        document.getElementById('editKayitTipi').value = transactionData.kayitTipi;
        document.getElementById('editKayitYonu').value = transactionData.kayitYonu;
        document.getElementById('editKaynakHesap').value = transactionData.kaynakHesap;
        document.getElementById('editKategori').value = transactionData.kategori;
        document.getElementById('editAltKategori').value = transactionData.altKategori;
        document.getElementById('editHedefHesap').value = transactionData.hedefHesap;
        document.getElementById('editTutar').value = transactionData.tutar;
        document.getElementById('editTaksitAdedi').value = transactionData.taksitAdedi;
        document.getElementById('editIslemTarihi').value = transactionData.islemTarihi;
        document.getElementById('editDetay').value = transactionData.detay;
        document.getElementById('editTransactionId').value = transactionId;
        
        document.getElementById('editTransactionModal').style.display = 'block';
    }
};

document.getElementById('editTransactionForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const transactionId = document.getElementById('editTransactionId').value;
    const updatedTransaction = {
        kayitTipi: document.getElementById('editKayitTipi').value,
        kayitYonu: document.getElementById('editKayitYonu').value,
        kaynakHesap: document.getElementById('editKaynakHesap').value,
        kategori: document.getElementById('editKategori').value,
        altKategori: document.getElementById('editAltKategori').value,
        hedefHesap: document.getElementById('editHedefHesap').value,
        tutar: parseFloat(document.getElementById('editTutar').value),
        taksitAdedi: parseInt(document.getElementById('editTaksitAdedi').value),
        islemTarihi: document.getElementById('editIslemTarihi').value,
        detay: document.getElementById('editDetay').value
    };

    showLoading();
    await updateDoc(doc(db, 'transactions', transactionId), updatedTransaction);
    const transactions = await getTransactions(auth.currentUser.uid);
    const transactionsWithDetails = await addDetailsToTransactions(transactions);
    hideLoading();
    displayTransactions(transactionsWithDetails);
    document.getElementById('editTransactionModal').style.display = 'none';
});

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

async function loadKayitTipleri() {
    const kayitTipiSelect = document.getElementById('editKayitTipi');
    kayitTipiSelect.innerHTML = '<option value="">Seçiniz</option>';

    const q = query(collection(db, 'kayitTipleri'), orderBy('line'));
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((doc) => {
        const option = document.createElement('option');
        option.value = doc.id;
        option.textContent = doc.data().name;
        kayitTipiSelect.appendChild(option);
    });
}

async function loadKayitYonleri() {
    const kayitYonuSelect = document.getElementById('editKayitYonu');
    kayitYonuSelect.innerHTML = '<option value="">Seçiniz</option>';

    const q = query(collection(db, 'kayitYonleri'), orderBy('line'));
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((doc) => {
        const option = document.createElement('option');
        option.value = doc.id;
        option.textContent = doc.data().name;
        kayitYonuSelect.appendChild(option);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    loadKayitTipleri();
    loadKayitYonleri();
});
