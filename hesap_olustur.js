import { auth, db } from './firebaseConfig.js';
import { collection, addDoc, getDocs, query, where } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { checkAuth } from './auth.js';
import { loadAccountDetails, displayAccountDetails } from './accountDetails.js';
import { getNakitFields, getNakitValues, getNakitLabels } from './nakit.js';
import { getBankaFields, getBankaValues, getBankaLabels } from './banka.js';
import { getKrediFields, getKrediValues, getKrediLabels } from './kredi.js';
import { getKrediKartiFields, getKrediKartiValues, getKrediKartiLabels } from './krediKarti.js';
import { getBirikimFields, getBirikimValues, getBirikimLabels } from './birikim.js';

document.getElementById('accountType').addEventListener('change', updateDynamicFields);

document.getElementById('accountForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const user = await checkAuth();
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
        li.textContent = doc.data().accountName;
        li.addEventListener('click', async () => {
            const accountData = await loadAccountDetails(doc.id);
            if (accountData) {
                displayAccountDetails(accountData, doc.data().accountType);
            }
        });
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

document.addEventListener('DOMContentLoaded', async () => {
    const user = await checkAuth();
    if (user) {
        loadAccounts(user);
    }
});

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

function displayAccountDetails(accountData, accountType) {
    const accountDetails = document.getElementById('accountDetails');
    accountDetails.innerHTML = '';

    const labels = getLabelsForAccountType(accountType);

    for (const [key, value] of Object.entries(accountData)) {
        const label = labels[key] || key;
        accountDetails.innerHTML += `<p><strong>${label}:</strong> ${value}</p>`;
    }
}

function getLabelsForAccountType(accountType) {
    switch (accountType) {
        case 'nakit':
            return getNakitLabels();
        case 'banka':
            return getBankaLabels();
        case 'kredi':
            return getKrediLabels();
        case 'krediKarti':
            return getKrediKartiLabels();
        case 'birikim':
            return getBirikimLabels();
        default:
            return {};
    }
}
