import { auth, db } from './firebaseConfig.js';
import { collection, addDoc, getDocs, query, where, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { checkAuth } from './auth.js';
import { getNakitFields, getNakitValues } from './nakit.js';
import { getBankaFields, getBankaValues } from './banka.js';
import { getKrediFields, getKrediValues } from './kredi.js';
import { getKrediKartiFields, getKrediKartiValues } from './krediKarti.js';
import { getBirikimFields, getBirikimValues } from './birikim.js';

document.addEventListener('DOMContentLoaded', async () => {
    const user = await checkAuth();
    if (user) {
        loadAccounts(user);
    }

    document.getElementById('accountType').addEventListener('change', updateDynamicFields);

    document.getElementById('accountForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!user) {
            return;
        }

        const accountData = getFormData();

        try {
            const docRef = await addDoc(collection(db, "accounts"), {
                uid: user.uid,
                ...accountData
            });
            console.log("Document written with ID: ", docRef.id);
            loadAccounts(user);
        } catch (e) {
            console.error("Error adding document: ", e);
        }
    });
});

async function loadAccounts(user) {
    if (!user) {
        console.error('Kullanıcı oturumu açık değil.');
        window.location.href = 'login.html'; // Kullanıcı oturum açmamışsa login sayfasına yönlendir
        return;
    }

    const q = query(collection(db, "accounts"), where("uid", "==", user.uid));
    const querySnapshot = await getDocs(q);
    const accountList = document.getElementById('accountList');
    accountList.innerHTML = '';
    querySnapshot.forEach((doc) => {
        const li = document.createElement('li');
        li.textContent = `${doc.data().accountName} - ${doc.data().accountType}`;
        li.addEventListener('click', async () => {
            const accountData = await loadAccountDetails(doc.id);
            if (accountData) {
                displayAccountDetails(accountData);
            }
        });
        accountList.appendChild(li);
    });
}

async function loadAccountDetails(accountId) {
    const accountDoc = await getDoc(doc(db, 'accounts', accountId));
    return accountDoc.exists() ? accountDoc.data() : null;
}

function displayAccountDetails(accountData) {
    const accountInfo = document.getElementById('accountInfo');
    accountInfo.innerHTML = '';
    for (const key in accountData) {
        if (accountData.hasOwnProperty(key)) {
            const p = document.createElement('p');
            p.textContent = `${key}: ${accountData[key]}`;
            accountInfo.appendChild(p);
        }
    }
    document.getElementById('accountDetails').style.display = 'block';
}

function updateDynamicFields() {
    const accountType = document.getElementById('accountType').value;
    const dynamicFields = document.getElementById('dynamicFields');
    dynamicFields.innerHTML = '';

    let fields = '';
    switch (accountType) {
        case 'nakit':
            fields = getNakitFields();
            break;
        case 'banka':
            fields = getBankaFields();
            break;
        case 'kredi':
            fields = getKrediFields();
            break;
        case 'krediKarti':
            fields = getKrediKartiFields();
            break;
        case 'birikim':
            fields = getBirikimFields();
            break;
    }

    dynamicFields.innerHTML = fields;

    // Enable form fields after account type is selected
    const accountName = document.getElementById('accountName');
    const openingDate = document.getElementById('openingDate');
    const currency = document.getElementById('currency');
    const submitButton = document.querySelector('button[type="submit"]');

    if (accountName) accountName.disabled = false;
    if (openingDate) openingDate.disabled = false;
    if (currency) currency.disabled = false;
    if (submitButton) submitButton.disabled = false;
}

function getFormData() {
    const accountName = document.getElementById('accountName').value;
    const openingDate = document.getElementById('openingDate').value;
    const currency = document.getElementById('currency').value;
    const accountType = document.getElementById('accountType').value;

    let dynamicFields = {};
    switch (accountType) {
        case 'nakit':
            dynamicFields = getNakitValues();
            break;
        case 'banka':
            dynamicFields = getBankaValues();
            break;
        case 'kredi':
            dynamicFields = getKrediValues();
            break;
        case 'krediKarti':
            dynamicFields = getKrediKartiValues();
            break;
        case 'birikim':
            dynamicFields = getBirikimValues();
            break;
    }

    return {
        accountName,
        openingDate,
        currency,
        accountType,
        ...dynamicFields
    };
}

// İşlevleri global hale getirin
window.loadAccounts = loadAccounts;
window.displayAccountDetails = displayAccountDetails;
window.updateDynamicFields = updateDynamicFields;
window.getFormData = getFormData;
