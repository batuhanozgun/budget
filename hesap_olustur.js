import { auth, db } from './firebaseConfig.js';
import { collection, addDoc, getDocs, query, where, doc, getDoc, deleteDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { checkAuth } from './auth.js';
import { getNakitFields, getNakitValues } from './nakit.js';
import { getBankaFields, getBankaValues } from './banka.js';
import { getKrediFields, getKrediValues } from './kredi.js';
import { getKrediKartiFields, getKrediKartiValues, addInstallment, getInstallmentsData } from './krediKarti.js';
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

    document.getElementById('addInstallmentButton').addEventListener('click', addInstallment);
    document.getElementById('deleteAccountButton').addEventListener('click', deleteAccount);
    document.getElementById('editAccountButton').addEventListener('click', editAccount);
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
                displayAccountDetails(accountData, doc.id);
            }
        });
        accountList.appendChild(li);
    });
}

async function loadAccountDetails(accountId) {
    const accountDoc = await getDoc(doc(db, 'accounts', accountId));
    return accountDoc.exists() ? accountDoc.data() : null;
}

function displayAccountDetails(accountData, accountId) {
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
    document.getElementById('deleteAccountButton').dataset.accountId = accountId;
    document.getElementById('editAccountButton').dataset.accountId = accountId;
}

async function deleteAccount() {
    const accountId = this.dataset.accountId;
    if (!accountId) return;

    try {
        await deleteDoc(doc(db, 'accounts', accountId));
        console.log('Hesap başarıyla silindi.');
        document.getElementById('accountDetails').style.display = 'none';
        const user = await checkAuth();
        if (user) {
            loadAccounts(user);
        }
    } catch (e) {
        console.error('Hesap silinirken hata oluştu:', e);
    }
}

async function editAccount() {
    const accountId = this.dataset.accountId;
    if (!accountId) return;

    const accountData = await loadAccountDetails(accountId);
    if (!accountData) return;

    document.getElementById('accountName').value = accountData.accountName;
    document.getElementById('accountType').value = accountData.accountType;
    document.getElementById('openingDate').value = accountData.openingDate;
    document.getElementById('currency').value = accountData.currency;

    // Load dynamic fields
    const accountType = accountData.accountType;
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
    document.getElementById('dynamicFields').innerHTML = fields;

    // Populate dynamic fields
    for (const key in accountData) {
        if (accountData.hasOwnProperty(key)) {
            const input = document.getElementById(key);
            if (input) {
                input.value = accountData[key];
            }
        }
    }

    // Show future installments if account type is credit card
    if (accountType === 'krediKarti') {
        const futureInstallmentsSection = document.getElementById('futureInstallmentsSection');
        futureInstallmentsSection.style.display = 'block';
        const installmentsContainer = document.getElementById('installmentsContainer');
        installmentsContainer.innerHTML = '';
        const installments = accountData.installments || [];
        installments.forEach(installment => {
            addInstallment();
            const lastInstallment = installmentsContainer.lastElementChild;
            lastInstallment.querySelector('.installmentMonth').value = installment.month;
            lastInstallment.querySelector('.installmentYear').value = installment.year;
            lastInstallment.querySelector('.installmentAmount').value = installment.amount;
        });
    }

    // Update account
    document.getElementById('accountForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const updatedData = getFormData();

        try {
            await updateDoc(doc(db, 'accounts', accountId), updatedData);
            console.log('Hesap başarıyla güncellendi.');
            const user = await checkAuth();
            if (user) {
                loadAccounts(user);
            }
        } catch (e) {
            console.error('Hesap güncellenirken hata oluştu:', e);
        }
    }, { once: true });
}

function updateDynamicFields() {
    const accountType = document.getElementById('accountType').value;
    const dynamicFields = document.getElementById('dynamicFields');
    const futureInstallmentsSection = document.getElementById('futureInstallmentsSection');
    dynamicFields.innerHTML = '';
    futureInstallmentsSection.style.display = 'none'; // Hide by default

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
            futureInstallmentsSection.style.display = 'block'; // Show future installments section
            break;
        case 'birikim':
            fields = getBirikimFields();
            break;
    }

    dynamicFields.innerHTML = fields;

    // Enable form fields after account type is selected
    document.getElementById('accountName').disabled = false;
    document.getElementById('openingDate').disabled = false;
    document.getElementById('currency').disabled = false;
    document.querySelector('button[type="submit"]').disabled = false;
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
window.addInstallment = addInstallment;
window.deleteAccount = deleteAccount;
window.editAccount = editAccount;
