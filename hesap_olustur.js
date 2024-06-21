import { auth, db } from './firebaseConfig.js';
import { collection, addDoc, getDocs, doc, getDoc, query, where } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { getNakitFields, getNakitValues } from './nakit.js';
import { getBankaFields, getBankaValues } from './banka.js';
import { getKrediFields, getKrediValues } from './kredi.js';
import { getKrediKartiFields, getKrediKartiValues } from './krediKarti.js';
import { getBirikimFields, getBirikimValues } from './birikim.js';
import { checkAuth } from './auth.js';

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
        li.addEventListener('click', () => loadAccountDetails(doc.id));
        accountList.appendChild(li);
    });
}

async function loadAccountDetails(accountId) {
    try {
        const accountRef = doc(db, "accounts", accountId);
        const accountSnap = await getDoc(accountRef);

        if (accountSnap.exists()) {
            const accountData = accountSnap.data();
            // Hesap detaylarını göster
            console.log("Account data:", accountData);
            displayAccountDetails(accountData);
        } else {
            console.log("No such document!");
        }
    } catch (e) {
        console.error("Error getting document:", e);
    }
}

function displayAccountDetails(accountData) {
    // Hesap detaylarını göstermek için HTML içeriği oluştur
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
