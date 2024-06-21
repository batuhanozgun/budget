import { db } from './firebaseConfig.js';
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

export async function loadAccountDetails(accountId) {
    try {
        const accountRef = doc(db, "accounts", accountId);
        const accountSnap = await getDoc(accountRef);

        if (accountSnap.exists()) {
            const accountData = accountSnap.data();
            return accountData;
        } else {
            console.log("No such document!");
            return null;
        }
    } catch (e) {
        console.error("Error getting document:", e);
        return null;
    }
}

export function displayAccountDetails(accountData) {
    const accountDetailsDiv = document.getElementById('accountDetails');
    accountDetailsDiv.innerHTML = `
        <h3>Hesap Detayları</h3>
        <p>Hesap Adı: ${accountData.accountName}</p>
        <p>Hesap Açılış Tarihi: ${accountData.openingDate}</p>
        <p>Para Birimi: ${accountData.currency}</p>
        <p>Hesap Türü: ${accountData.accountType}</p>
        <!-- Dinamik alanlar -->
        ${Object.keys(accountData).map(key => {
            if (['accountName', 'openingDate', 'currency', 'accountType', 'uid'].includes(key)) return '';
            return `<p>${key}: ${accountData[key]}</p>`;
        }).join('')}
    `;
}
