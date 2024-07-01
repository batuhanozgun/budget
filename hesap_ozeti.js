import { db } from './firebaseConfig.js';
import { getDocs, collection, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { checkAuth } from './auth.js';

document.addEventListener('DOMContentLoaded', async () => {
    showLoadingOverlay();
    const user = await checkAuth();
    if (user) {
        const transactions = await getTransactions(user.uid);
        await displayAccountBalances(transactions);
        await displayCategoryBalances(transactions);
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

async function displayAccountBalances(transactions) {
    const summaryTableBody = document.getElementById('accountBalancesTable').getElementsByTagName('tbody')[0];
    const accountBalances = {};

    for (const transaction of transactions) {
        const { kaynakHesap, tutar } = transaction;
        if (!accountBalances[kaynakHesap]) {
            accountBalances[kaynakHesap] = 0;
        }
        accountBalances[kaynakHesap] += parseFloat(tutar);
    }

    for (const accountId of Object.keys(accountBalances)) {
        const accountDoc = await getDoc(doc(db, 'accounts', accountId));
        const accountName = accountDoc.exists() ? accountDoc.data().accountName : 'Unknown Account';
        const row = summaryTableBody.insertRow();
        const accountNameCell = row.insertCell(0);
        const balanceCell = row.insertCell(1);

        accountNameCell.textContent = accountName;
        balanceCell.textContent = formatNumber(accountBalances[accountId]);
    }
}

async function displayCategoryBalances(transactions) {
    const summaryTableBody = document.getElementById('categoryBalancesTable').getElementsByTagName('tbody')[0];
    const categoryBalances = {};

    for (const transaction of transactions) {
        const { kategori, tutar } = transaction;
        if (!categoryBalances[kategori]) {
            categoryBalances[kategori] = 0;
        }
        categoryBalances[kategori] += parseFloat(tutar);
    }

    for (const categoryId of Object.keys(categoryBalances)) {
        const categoryDoc = await getDoc(doc(db, 'categories', categoryId));
        const categoryName = categoryDoc.exists() ? categoryDoc.data().name : 'Unknown Category';
        const row = summaryTableBody.insertRow();
        const categoryNameCell = row.insertCell(0);
        const balanceCell = row.insertCell(1);

        categoryNameCell.textContent = categoryName;
        balanceCell.textContent = formatNumber(categoryBalances[categoryId]);
    }
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
