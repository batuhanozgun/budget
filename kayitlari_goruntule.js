import { app, auth, db, doc, getDoc } from './firebaseConfig.js';
import { collection, query, getDocs, where, deleteDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";

let dataTable;  // DataTable referansı için değişken tanımla

onAuthStateChanged(auth, async (user) => {
    if (user) {
        showLoading();
        const transactions = await getTransactions(user.uid);
        const transactionsWithDetails = await addDetailsToTransactions(transactions);
        const transactionsWithInstallments = await addInstallmentsToTransactions(transactionsWithDetails);
        hideLoading();
        initializeDataTable(transactionsWithInstallments);  // DataTable'ı başlat
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

async function addInstallmentsToTransactions(transactions) {
    const installmentPromises = transactions.map(async transaction => {
        if (transaction.taksitAdedi > 1) {
            const installmentsSnapshot = await getDocs(collection(db, `transactions/${transaction.id}/creditcardInstallments`));
            const installments = [];
            installmentsSnapshot.forEach(doc => {
                installments.push({ id: doc.id, ...doc.data() });
            });
            transaction.installments = installments;
        } else {
            transaction.installments = [transaction];
        }
        return transaction;
    });
    return Promise.all(installmentPromises);
}

function initializeDataTable(transactions) {
    const tableData = transactions.flatMap(transaction => 
        transaction.installments.map(installment => [
            `<div class="action-buttons">
                <button onclick="editTransaction('${installment.id}')">Düzenle</button>
                <button onclick="deleteTransaction('${installment.id}')">Sil</button>
            </div>`,
            new Date(transaction.createDate.seconds * 1000).toLocaleDateString(),
            transaction.kayitTipiName || transaction.kayitTipi,
            transaction.kayitYonuName || transaction.kayitYonu,
            transaction.kaynakHesapName || transaction.kaynakHesap,
            transaction.kategoriName || transaction.kategori,
            transaction.altKategoriName || transaction.altKategori,
            transaction.hedefHesapName || transaction.hedefHesap,
            new Date(transaction.islemTarihi).toLocaleDateString(),
            installment.taksitPlani || '',
            new Date(installment.taksitTarihi.seconds * 1000).toLocaleDateString(),
            installment.tutar,
            transaction.detay || ''
        ])
    );

    if ($.fn.dataTable.isDataTable('#transactionsTable')) {
        const dataTable = $('#transactionsTable').DataTable();
        dataTable.clear().rows.add(tableData).draw();  // DataTable'i temizle ve yeni verileri ekle
    } else {
        dataTable = $('#transactionsTable').DataTable({
            data: tableData,
            columns: [
                { title: "İşlemler" },
                { title: "Oluşturma Tarihi" },
                { title: "Kayıt Tipi" },
                { title: "Kayıt Yönü" },
                { title: "Kaynak Hesap" },
                { title: "Kategori" },
                { title: "Alt Kategori" },
                { title: "Hedef Hesap" },
                { title: "İşlem Tarihi" },
                { title: "Taksit Planı" },
                { title: "Taksit Tarihi" },
                { title: "Tutar" },
                { title: "Detay" }
            ],
            paging: true,
            searching: false, // Arama alanını kaldır
            ordering: true,
            info: true,
            language: {
                lengthMenu: "Gösterilen Kayıt Sayısı _MENU_",
                info: "_TOTAL_ kaydın _START_ ile _END_ arası gösteriliyor",
                infoEmpty: "Kayıt bulunamadı",
                infoFiltered: "(toplam _MAX_ kayıt filtrelendi)",
                paginate: {
                    previous: "Önceki",
                    next: "Sonraki"
                }
            },
            dom: 'lfrtip', // DataTables bileşenlerinin yerleşimi
            initComplete: function () {
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
    }
}

window.deleteTransaction = async (transactionId) => {
    if (confirm("Bu kaydı silmek istediğinize emin misiniz?")) {
        showLoading();
        await deleteDoc(doc(db, 'transactions', transactionId));
        const transactions = await getTransactions(auth.currentUser.uid);
        const transactionsWithDetails = await addDetailsToTransactions(transactions);
        const transactionsWithInstallments = await addInstallmentsToTransactions(transactionsWithDetails);
        hideLoading();
        initializeDataTable(transactionsWithInstallments);  // DataTable'i güncelle
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
        const transactionsWithInstallments = await addInstallmentsToTransactions(transactionsWithDetails);
        hideLoading();
        initializeDataTable(transactionsWithInstallments);  // DataTable'i güncelle
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
