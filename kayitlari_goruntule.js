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

    document.getElementById('addInstallmentButton').addEventListener('click', addInstallment);
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

    const installments = getInstallmentsData();

    return {
        accountName,
        openingDate,
        currency,
        accountType,
        ...dynamicFields,
        installments
    };
}

function addInstallment() {
    const container = document.getElementById('installmentsContainer');
    const installmentDiv = document.createElement('div');
    installmentDiv.classList.add('installment');
    
    installmentDiv.innerHTML = `
        <label for="installmentMonth">Ay:</label>
        <input type="number" class="installmentMonth" name="installmentMonth" min="1" max="12" required>
        <label for="installmentYear">Yıl:</label>
        <input type="number" class="installmentYear" name="installmentYear" min="2023" required>
        <label for="installmentAmount">Tutar:</label>
        <input type="number" class="installmentAmount" name="installmentAmount" required>
        <button type="button" class="removeInstallmentButton">Kaldır</button>
    `;

    installmentDiv.querySelector('.removeInstallmentButton').addEventListener('click', () => {
        container.removeChild(installmentDiv);
    });

    container.appendChild(installmentDiv);
}

function getInstallmentsData() {
    const installments = [];
    const installmentDivs = document.querySelectorAll('.installment');

    installmentDivs.forEach(div => {
        const month = div.querySelector('.installmentMonth').value;
        const year = div.querySelector('.installmentYear').value;
        const amount = div.querySelector('.installmentAmount').value;

        if (month && year && amount) {
            installments.push({ month, year, amount });
        }
    });

    return installments;
}

// İşlevleri global hale getirin
window.loadAccounts = loadAccounts;
window.displayAccountDetails = displayAccountDetails;
window.updateDynamicFields = updateDynamicFields;
window.getFormData = getFormData;
window.addInstallment = addInstallment;
