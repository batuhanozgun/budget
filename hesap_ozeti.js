import { db } from './firebaseConfig.js';
import { getDocs, collection, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { checkAuth } from './auth.js';

document.addEventListener('DOMContentLoaded', async () => {
    showLoadingOverlay();
    const user = await checkAuth();
    if (user) {
        const transactions = await getTransactions(user.uid);
        displayAccountBalances(transactions);
        displayCategoryBalances(transactions);
        displayTransactions(transactions);
    }
    hideLoadingOverlay();
});

async function getTransactions(uid) {
    const transactionsSnapshot = await getDocs(collection(db, 'transactions'));
    const transactions = [];
    transactionsSnapshot.forEach(doc => {
        const data = doc.data();
        if (data.userId === uid) {
            transactions.push(data);
        }
    });
    return transactions;
}

function displayAccountBalances(transactions) {
    const summaryTableBody = document.getElementById('accountBalancesTable').getElementsByTagName('tbody')[0];
    const accountBalances = {};

    transactions.forEach(transaction => {
        const { kaynakHesap, tutar } = transaction;
        if (!accountBalances[kaynakHesap]) {
            accountBalances[kaynakHesap] = 0;
        }
        accountBalances[kaynakHesap] += parseFloat(tutar);
    });

    Object.keys(accountBalances).forEach(async accountId => {
        const accountDoc = await getDoc(doc(db, 'accounts', accountId));
        const accountName = accountDoc.exists() ? accountDoc.data().accountName : 'Unknown Account';
        const row = summaryTableBody.insertRow();
        const accountNameCell = row.insertCell(0);
        const balanceCell = row.insertCell(1);

        accountNameCell.textContent = accountName;
        balanceCell.textContent = formatNumber(accountBalances[accountId]);
    });
}

function displayCategoryBalances(transactions) {
    const summaryTableBody = document.getElementById('categoryBalancesTable').getElementsByTagName('tbody')[0];
    const categoryBalances = {};

    transactions.forEach(transaction => {
        const { kategori, tutar } = transaction;
        if (!categoryBalances[kategori]) {
            categoryBalances[kategori] = 0;
        }
        categoryBalances[kategori] += parseFloat(tutar);
    });

    Object.keys(categoryBalances).forEach(async categoryId => {
        const categoryDoc = await getDoc(doc(db, 'categories', categoryId));
        const categoryName = categoryDoc.exists() ? categoryDoc.data().name : 'Unknown Category';
        const row = summaryTableBody.insertRow();
        const categoryNameCell = row.insertCell(0);
        const balanceCell = row.insertCell(1);

        categoryNameCell.textContent = categoryName;
        balanceCell.textContent = formatNumber(categoryBalances[categoryId]);
    });
}

function displayTransactions(transactions) {
    const summaryTableBody = document.getElementById('summaryTable').getElementsByTagName('tbody')[0];

    transactions.forEach(transaction => {
        const row = summaryTableBody.insertRow();

        const accountNameCell = row.insertCell(0);
        const transactionDateCell = row.insertCell(1);
        const categoryCell = row.insertCell(2);
        const subCategoryCell = row.insertCell(3);
        const amountCell = row.insertCell(4);
        const transactionTypeCell = row.insertCell(5);

        accountNameCell.textContent = transaction.kaynakHesap; // Hesap adı
        transactionDateCell.textContent = transaction.islemTarihi; // İşlem tarihi
        categoryCell.textContent = transaction.kategori; // Kategori
        subCategoryCell.textContent = transaction.altKategori; // Alt kategori
        amountCell.textContent = formatNumber(transaction.tutar); // Tutar
        transactionTypeCell.textContent = transaction.kayitTipi; // İşlem tipi
    });
}

function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function showLoadingOverlay() {
    document.querySelector('.loading-overlay').style.display = 'flex';
}

function hideLoadingOverlay() {
    document.querySelector('.loading-overlay').style.display = 'none';
}
