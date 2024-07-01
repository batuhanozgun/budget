import { db } from './firebaseConfig.js';
import { getDocs, collection, doc, getDoc, query, where } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { checkAuth } from './auth.js';
import { Timestamp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', async () => {
    showLoadingOverlay();
    const user = await checkAuth();
    if (user) {
        const transactions = await getTransactions(user.uid);
        console.log(transactions);  // Verileri kontrol etmek için konsola yazdır
        await displayAccountBalances(transactions);
    }
    hideLoadingOverlay();
});

async function getTransactions(uid) {
    const transactionsSnapshot = await getDocs(query(collection(db, 'transactions'), where("userId", "==", uid)));
    const transactions = [];
    for (const doc of transactionsSnapshot.docs) {
        const data = doc.data();
        transactions.push(data);

        // Eğer kredi kartı harcamasıysa ve taksit adedi 1'den fazlaysa, taksit verilerini çek
        if (data.kayitTipi === 'creditcard' && data.taksitAdedi > 1) {
            const installmentsSnapshot = await getDocs(collection(db, `transactions/${doc.id}/creditcardInstallments`));
            for (const installmentDoc of installmentsSnapshot.docs) {
                const installmentData = installmentDoc.data();
                transactions.push({
                    ...data,
                    taksitTarihi: installmentData.taksitTarihi,
                    tutar: installmentData.tutar
                });
            }
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

async function displayAccountBalances(transactions) {
    const summaryTableHead = document.getElementById('accountBalancesTable').getElementsByTagName('thead')[0];
    const summaryTableBody = document.getElementById('accountBalancesTable').getElementsByTagName('tbody')[0];
    const accountBalances = {};
    const datesSet = new Set();

    for (const transaction of transactions) {
        const { kaynakHesap, tutar, islemTarihi, taksitTarihi } = transaction;
        const date = getDateFromTimestamp(taksitTarihi || islemTarihi);
        const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

        console.log(`Tarih: ${yearMonth}`);  // Tarihleri kontrol etmek için ekledik

        if (!accountBalances[kaynakHesap]) {
            accountBalances[kaynakHesap] = {};
        }
        if (!accountBalances[kaynakHesap][yearMonth]) {
            accountBalances[kaynakHesap][yearMonth] = 0;
        }
        accountBalances[kaynakHesap][yearMonth] += parseFloat(tutar);
        datesSet.add(yearMonth);
    }

    const sortedDates = Array.from(datesSet).sort((a, b) => new Date(a) - new Date(b));

    // Add account names to table head
    const headerRow = summaryTableHead.rows[0];
    for (const accountId of Object.keys(accountBalances)) {
        const accountDoc = await getDoc(doc(db, 'accounts', accountId));
        const accountName = accountDoc.exists() ? accountDoc.data().accountName : 'Unknown Account';
        const th = document.createElement('th');
        th.textContent = accountName;
        headerRow.appendChild(th);
    }

    // Add balances to table body
    for (const date of sortedDates) {
        const row = summaryTableBody.insertRow();
        const dateCell = row.insertCell(0);
        dateCell.textContent = date;

        for (const accountId of Object.keys(accountBalances)) {
            const balanceCell = row.insertCell();
            balanceCell.textContent = formatNumber(accountBalances[accountId][date] || 0);
        }
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
