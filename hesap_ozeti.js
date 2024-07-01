import { db } from './firebaseConfig.js';
import { getDocs, collection, doc, getDoc, query, where } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { checkAuth } from './auth.js';
import { Timestamp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', async () => {
    showLoadingOverlay();
    const user = await checkAuth();
    if (user) {
        const accountsCache = await loadAccountsCache();
        const transactions = await getTransactions(user.uid, accountsCache);
        const pivotData = pivotTransactions(transactions, accountsCache);
        await displayPivotTable(pivotData);
    }
    hideLoadingOverlay();
});

async function loadAccountsCache() {
    const accountsSnapshot = await getDocs(collection(db, 'accounts'));
    const accountsCache = {};
    accountsSnapshot.forEach((doc) => {
        accountsCache[doc.id] = doc.data();
    });
    return accountsCache;
}

async function getTransactions(uid, accountsCache) {
    const transactionsSnapshot = await getDocs(query(collection(db, 'transactions'), where("userId", "==", uid)));
    const transactions = [];
    for (const docSnap of transactionsSnapshot.docs) {
        const data = docSnap.data();

        const accountData = accountsCache[data.kaynakHesap];

        // Eğer hesap kredi kartı hesabıysa ve taksit adedi 1'den fazlaysa, taksit verilerini çek
        if (accountData && accountData.accountType === 'krediKarti' && data.taksitAdedi > 1) {
            const installmentsSnapshot = await getDocs(collection(db, `transactions/${docSnap.id}/creditcardInstallments`));
            for (const installmentDoc of installmentsSnapshot.docs) {
                const installmentData = installmentDoc.data();
                transactions.push({
                    ...data,
                    taksitTarihi: installmentData.taksitTarihi,
                    tutar: installmentData.tutar
                });
            }
        } else {
            transactions.push(data);
        }
    }
    return transactions;
}

function getDateFromTimestamp(timestamp) {
    if (timestamp instanceof Timestamp) {
        return timestamp.toDate();
    }
    return new Date(timestamp);
}

function pivotTransactions(transactions, accountsCache) {
    const pivotData = {};

    for (const transaction of transactions) {
        const date = getDateFromTransaction(transaction);
        const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const accountName = accountsCache[transaction.kaynakHesap]?.accountName || 'Bilinmiyor';

        if (!pivotData[yearMonth]) {
            pivotData[yearMonth] = {};
        }

        if (!pivotData[yearMonth][accountName]) {
            pivotData[yearMonth][accountName] = 0;
        }

        pivotData[yearMonth][accountName] += parseFloat(transaction.tutar);
    }

    return pivotData;
}

function getDateFromTransaction(transaction) {
    const { taksitTarihi, islemTarihi } = transaction;
    if (taksitTarihi) {
        return getDateFromTimestamp(taksitTarihi);
    }
    return getDateFromTimestamp(islemTarihi);
}

async function displayPivotTable(pivotData) {
    const summaryTableHead = document.getElementById('accountBalancesTable').getElementsByTagName('thead')[0];
    const summaryTableBody = document.getElementById('accountBalancesTable').getElementsByTagName('tbody')[0];

    // Clear existing headers and rows
    summaryTableHead.innerHTML = '';
    summaryTableBody.innerHTML = '';

    // Add headers to table head
    const headerRow = summaryTableHead.insertRow();
    const dateTh = document.createElement('th');
    dateTh.textContent = "Ay-Yıl";
    headerRow.appendChild(dateTh);

    // Collect all account names
    const accountNames = new Set();
    for (const yearMonth in pivotData) {
        for (const accountName in pivotData[yearMonth]) {
            accountNames.add(accountName);
        }
    }

    // Add account name columns
    accountNames.forEach(accountName => {
        const th = document.createElement('th');
        th.textContent = accountName;
        headerRow.appendChild(th);
    });

    // Sort dates in descending order
    const sortedDates = Object.keys(pivotData).sort((a, b) => new Date(b) - new Date(a));

    // Add data rows to table body
    for (const yearMonth of sortedDates) {
        const row = summaryTableBody.insertRow();
        const dateCell = row.insertCell(0);
        dateCell.textContent = yearMonth;

        accountNames.forEach(accountName => {
            const cell = row.insertCell();
            cell.textContent = formatNumber(pivotData[yearMonth][accountName] || 0);
        });
    }
}

function formatNumber(num) {
    return num.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function showLoadingOverlay() {
    document.querySelector('.loading-overlay').style.display = 'flex';
}

function hideLoadingOverlay() {
    document.querySelector('.loading-overlay').style.display = 'none';
}
