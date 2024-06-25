import { db } from './firebaseConfig.js';
import { getDocs, collection, query, where, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";

const auth = getAuth();

document.addEventListener('DOMContentLoaded', () => {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            showLoading();
            const transactions = await getTransactions(user.uid);
            const transactionsWithDetails = await addDetailsToTransactions(transactions);
            hideLoading();
            displayTransactions(transactionsWithDetails);
            displayAccountBalances(transactionsWithDetails);
            displayCategoryBalances(transactionsWithDetails);
        } else {
            // Kullanıcı oturumu kapatıldıysa login sayfasına yönlendirin
            window.location.href = 'login.html';
        }
    });
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
    const summaryTableBody = document.getElementById('summaryTable').getElementsByTagName('tbody')[0];
    summaryTableBody.innerHTML = '';  // Tablodaki önceki verileri temizle

    transactions.forEach(transaction => {
        const row = summaryTableBody.insertRow();

        const accountNameCell = row.insertCell(0);
        const transactionDateCell = row.insertCell(1);
        const categoryCell = row.insertCell(2);
        const subCategoryCell = row.insertCell(3);
        const amountCell = row.insertCell(4);
        const transactionTypeCell = row.insertCell(5);

        accountNameCell.textContent = transaction.kaynakHesapName || transaction.kaynakHesap; // Hesap adı
        transactionDateCell.textContent = new Date(transaction.islemTarihi).toLocaleDateString(); // İşlem tarihi
        categoryCell.textContent = transaction.kategoriName || transaction.kategori; // Kategori
        subCategoryCell.textContent = transaction.altKategoriName || transaction.altKategori; // Alt kategori
        amountCell.textContent = transaction.tutar; // Tutar
        transactionTypeCell.textContent = transaction.kayitTipi; // İşlem tipi
    });
}

function displayAccountBalances(transactions) {
    const accountBalances = {};
    transactions.forEach(transaction => {
        const account = transaction.kaynakHesapName || transaction.kaynakHesap;
        const amount = parseFloat(transaction.tutar);

        if (!accountBalances[account]) {
            accountBalances[account] = 0;
        }

        if (transaction.kayitTipi === 'Gelir') {
            accountBalances[account] += amount;
        } else if (transaction.kayitTipi === 'Gider') {
            accountBalances[account] -= amount;
        }
    });

    const accountBalancesTableBody = document.getElementById('accountBalancesTable').getElementsByTagName('tbody')[0];
    accountBalancesTableBody.innerHTML = '';  // Tablodaki önceki verileri temizle

    for (const [account, balance] of Object.entries(accountBalances)) {
        const row = accountBalancesTableBody.insertRow();
        const accountNameCell = row.insertCell(0);
        const balanceCell = row.insertCell(1);

        accountNameCell.textContent = account;
        balanceCell.textContent = balance.toFixed(2);
    }
}

function displayCategoryBalances(transactions) {
    const categoryBalances = {};
    transactions.forEach(transaction => {
        const category = transaction.kategoriName || transaction.kategori;
        const amount = parseFloat(transaction.tutar);

        if (!categoryBalances[category]) {
            categoryBalances[category] = 0;
        }

        if (transaction.kayitTipi === 'Gelir') {
            categoryBalances[category] += amount;
        } else if (transaction.kayitTipi === 'Gider') {
            categoryBalances[category] -= amount;
        }
    });

    const categoryBalancesTableBody = document.getElementById('categoryBalancesTable').getElementsByTagName('tbody')[0];
    categoryBalancesTableBody.innerHTML = '';  // Tablodaki önceki verileri temizle

    for (const [category, balance] of Object.entries(categoryBalances)) {
        const row = categoryBalancesTableBody.insertRow();
        const categoryNameCell = row.insertCell(0);
        const balanceCell = row.insertCell(1);

        categoryNameCell.textContent = category;
        balanceCell.textContent = balance.toFixed(2);
    }
}

function showLoading() {
    document.querySelector('.loading-overlay').style.display = 'flex';
}

function hideLoading() {
    document.querySelector('.loading-overlay').style.display = 'none';
}
