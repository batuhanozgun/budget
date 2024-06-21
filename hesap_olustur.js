import { auth, db } from './firebaseConfig.js';
import { collection, addDoc, getDocs, query, where } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

document.getElementById('accountType').addEventListener('change', updateDynamicFields);

document.getElementById('accountForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const user = auth.currentUser;
    if (!user) {
        console.error('Kullanıcı oturumu açık değil.');
        return;
    }

    const accountName = document.getElementById('accountName').value;
    const openingDate = document.getElementById('openingDate').value;
    const currency = document.getElementById('currency').value;
    const accountType = document.getElementById('accountType').value;

    const dynamicFields = getDynamicFieldValues();

    try {
        const docRef = await addDoc(collection(db, "accounts"), {
            uid: user.uid,
            accountName,
            openingDate,
            currency,
            accountType,
            ...dynamicFields
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

    switch (accountType) {
        case 'nakit':
            dynamicFields.innerHTML += '<label for="initialBalance">Başlangıç Bakiyesi:</label><input type="number" id="initialBalance" name="initialBalance" required>';
            break;
        case 'banka':
            dynamicFields.innerHTML += '<label for="initialBalance">Başlangıç Bakiyesi:</label><input type="number" id="initialBalance" name="initialBalance" required>';
            dynamicFields.innerHTML += '<label for="overdraftLimit">KMH Limiti:</label><input type="number" id="overdraftLimit" name="overdraftLimit" required>';
            break;
        case 'kredi':
            dynamicFields.innerHTML += '<label for="creditAmount">Kredi Tutarı:</label><input type="number" id="creditAmount" name="creditAmount" required>';
            dynamicFields.innerHTML += '<label for="creditedAmount">Hesaba Yatan Tutar:</label><input type="number" id="creditedAmount" name="creditedAmount" required>';
            dynamicFields.innerHTML += '<label for="expenses">Masraflar:</label><input type="number" id="expenses" name="expenses" required>';
            dynamicFields.innerHTML += '<label for="insurance">Sigorta:</label><input type="number" id="insurance" name="insurance" required>';
            dynamicFields.innerHTML += '<label for="term">Vade:</label><input type="number" id="term" name="term" required>';
            break;
        case 'krediKartı':
            dynamicFields.innerHTML += '<label for="cardLimit">Kart Limiti:</label><input type="number" id="cardLimit" name="cardLimit" required>';
            dynamicFields.innerHTML += '<label for="billingCycle">Hesap Kesim Dönemi:</label><select id="billingCycle" name="billingCycle" required><option value="specificDay">Her ayın belirli bir günü</option><option value="workDay">Her ayın belirli bir iş günü</option></select>';
            dynamicFields.innerHTML += '<div id="billingCycleDetails"></div>';
            document.getElementById('billingCycle').addEventListener('change', updateBillingCycleDetails);
            break;
        case 'birikim':
            dynamicFields.innerHTML += '<label for="targetAmount">Hedef Tutar:</label><input type="number" id="targetAmount" name="targetAmount" required>';
            dynamicFields.innerHTML += '<label for="paymentFrequency">Ödeme Sıklığı:</label><select id="paymentFrequency" name="paymentFrequency" required><option value="weekly">Her hafta</option><option value="monthly">Her ay</option></select>';
            dynamicFields.innerHTML += '<div id="paymentFrequencyDetails"></div>';
            document.getElementById('paymentFrequency').addEventListener('change', updatePaymentFrequencyDetails);
            break;
    }
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

function getDynamicFieldValues() {
    const accountType = document.getElementById('accountType').value;
    let dynamicFields = {};

    switch (accountType) {
        case 'nakit':
            dynamicFields = {
                initialBalance: document.getElementById('initialBalance').value
            };
            break;
        case 'banka':
            dynamicFields = {
                initialBalance: document.getElementById('initialBalance').value,
                overdraftLimit: document.getElementById('overdraftLimit').value
            };
            break;
        case 'kredi':
            dynamicFields = {
                creditAmount: document.getElementById('creditAmount').value,
                creditedAmount: document.getElementById('creditedAmount').value,
                expenses: document.getElementById('expenses').value,
                insurance: document.getElementById('insurance').value,
                term: document.getElementById('term').value
            };
            break;
        case 'krediKartı':
            dynamicFields = {
                cardLimit: document.getElementById('cardLimit').value,
                billingCycle: document.getElementById('billingCycle').value,
                billingDay: document.getElementById('billingDay') ? document.getElementById('billingDay').value : null,
                billingWorkDay: document.getElementById('billingWorkDay') ? document.getElementById('billingWorkDay').value : null
            };
            break;
        case 'birikim':
            dynamicFields = {
                targetAmount: document.getElementById('targetAmount').value,
                paymentFrequency: document.getElementById('paymentFrequency').value,
                paymentDay: document.getElementById('paymentDay') ? document.getElementById('paymentDay').value : null,
                paymentDate: document.getElementById('paymentDate') ? document.getElementById('paymentDate').value : null
            };
            break;
    }

    return dynamicFields;
}

document.addEventListener('DOMContentLoaded', loadAccounts);
