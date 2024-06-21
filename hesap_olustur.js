import { auth, db } from './firebaseConfig.js';
import { collection, addDoc, getDocs, query, where, deleteDoc, doc, setDoc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { checkAuth } from './auth.js';
import { loadAccountDetails, displayAccountDetails } from './accountDetails.js';
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
        li.innerHTML = `
            <span>${doc.data().accountName} - ${doc.data().accountType}</span>
            <div class="action-buttons">
                <button class="edit" onclick="editAccount('${doc.id}', '${doc.data().accountName}', '${doc.data().accountType}')">Düzenle</button>
                <button class="delete" onclick="deleteAccount('${doc.id}')">Sil</button>
            </div>
        `;
        li.addEventListener('click', async () => {
            const accountData = await loadAccountDetails(doc.id);
            if (accountData) {
                displayAccountDetails(accountData);
            }
        });
        accountList.appendChild(li);
    });
}

async function deleteAccount(accountId) {
    await deleteDoc(doc(db, 'accounts', accountId));
    loadAccounts(await checkAuth());
}

function editAccount(accountId, accountName, accountType) {
    const newAccountName = prompt('Yeni Hesap Adı:', accountName);
    const newAccountType = prompt('Yeni Hesap Türü:', accountType);
    if (newAccountName && newAccountType) {
        updateAccount(accountId, newAccountName, newAccountType);
    }
}

async function updateAccount(accountId, newAccountName, newAccountType) {
    const accountDoc = doc(db, 'accounts', accountId);
    await setDoc(accountDoc, { accountName: newAccountName, accountType: newAccountType }, { merge: true });
    loadAccounts(await checkAuth());
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

    if (accountType === 'krediKarti') {
        document.getElementById('billingCycle').addEventListener('change', updateBillingCycleDetails);
    }

    if (accountType === 'birikim') {
        document.getElementById('paymentFrequency').addEventListener('change', updatePaymentFrequencyDetails);
    }

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

function updateBillingCycleDetails() {
    const billingCycle = document.getElementById('billingCycle').value;
    const billingCycleDetails = document.getElementById('billingCycleDetails');
    billingCycleDetails.innerHTML = '';

    if (billingCycle === 'specificDay') {
        billingCycleDetails.innerHTML += '<label for="billingDay">Gün:</label><input type="number" id="billingDay" name="billingDay" min="1" max="31" required>';
    } else if (billingCycle === 'workDay') {
        billingCycleDetails.innerHTML += '<label for="billingWorkDay">İş Günü:</label><select id="billingWorkDay" name="billingWorkDay" required><option value="first">Ayın ilk iş günü</option><option value="last">Ayın son iş günü</option></select>';
    }
}

function updatePaymentFrequencyDetails() {
    const paymentFrequency = document.getElementById('paymentFrequency').value;
    const paymentFrequencyDetails = document.getElementById('paymentFrequencyDetails');
    paymentFrequencyDetails.innerHTML = '';

    if (paymentFrequency === 'weekly') {
        paymentFrequencyDetails.innerHTML += '<label for="paymentDay">Gün:</label><select id="paymentDay" name="paymentDay" required><option value="monday">Pazartesi</option><option value="tuesday">Salı</option><option value="wednesday">Çarşamba</option><option value="thursday">Perşembe</option><option value="friday">Cuma</option><option value="saturday">Cumartesi</option><option value="sunday">Pazar</option></select>';
    } else if (paymentFrequency === 'monthly') {
        paymentFrequencyDetails.innerHTML += '<label for="paymentDate">Gün:</label><input type="number" id="paymentDate" name="paymentDate" min="1" max="31" required>';
    }
}

// İşlevleri global hale getirin
window.deleteAccount = deleteAccount;
window.editAccount = editAccount;
