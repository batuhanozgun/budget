import { auth, db } from './firebaseConfig.js';
import { collection, addDoc, getDocs, query, where } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { getNakitFields, getNakitValues } from './nakit.js';
import { getBankaFields, getBankaValues } from './banka.js';
import { getKrediFields, getKrediValues } from './kredi.js';
import { getKrediKartıFields, getKrediKartıValues } from './krediKartı.js';
import { getBirikimFields, getBirikimValues } from './birikim.js';

document.getElementById('accountType').addEventListener('change', updateDynamicFields);

document.getElementById('accountForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const user = auth.currentUser;
    if (!user) {
        console.error('Kullanıcı oturumu açık değil.');
        return;
    }

    const accountData = getFormData();

    try {
        const docRef = await addDoc(collection(db, "accounts"), {
            uid: user.uid,
            ...accountData
        });
        console.log("Document written with ID: ", docRef.id);
        loadAccounts();
    } catch (e) {
        console.error("Error adding document: ", e);
    }
});

async function loadAccounts() {
    const user = auth.currentUser;
    if (!user) {
        console.error('Kullanıcı oturumu açık değil.');
        return;
    }

    const q = query(collection(db, "accounts"), where("uid", "==", user.uid));
    const querySnapshot = await getDocs(q);
    const accountList = document.getElementById('accountList');
    accountList.innerHTML = '';
    querySnapshot.forEach((doc) => {
        const li = document.createElement('li');
        li.textContent = doc.data().accountName;
        li.addEventListener('click', () => loadAccountDetails(doc.id));
        accountList.appendChild(li);
    });
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
        case 'krediKartı':
            fields = getKrediKartıFields();
            break;
        case 'birikim':
            fields = getBirikimFields();
            break;
    }

    dynamicFields.innerHTML = fields;
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
        case 'krediKartı':
            dynamicFields = getKrediKartıValues();
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

document.addEventListener('DOMContentLoaded', loadAccounts);
