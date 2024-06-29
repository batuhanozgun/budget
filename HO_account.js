import { collection, addDoc, getDocs, query, where, doc, getDoc, deleteDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { db } from './firebaseConfig.js';

export async function checkDuplicateAccountName(uid, accountName) {
    const q = query(collection(db, "accounts"), where("uid", "==", uid), where("accountName", "==", accountName));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
}

export async function addAccount(user, accountData) {
    const docRef = await addDoc(collection(db, "accounts"), {
        uid: user.uid,
        ...accountData
    });
    return docRef.id;
}

export async function updateAccount(accountId, accountData) {
    await updateDoc(doc(db, 'accounts', accountId), accountData);
}

export async function deleteAccountById(accountId) {
    await deleteDoc(doc(db, 'accounts', accountId));
}

export async function loadAccounts(user) {
    if (!user) {
        console.error('Kullanıcı oturumu açık değil.');
        window.location.href = 'login.html'; // Kullanıcı oturum açmamışsa login sayfasına yönlendir
        return;
    }

    const q = query(collection(db, "accounts"), where("uid", "==", user.uid));
    const querySnapshot = await getDocs(q);
    const accountListContainer = document.getElementById('accountListContainer');
    accountListContainer.innerHTML = '';

    const accountsByType = {};

    querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (!accountsByType[data.accountType]) {
            accountsByType[data.accountType] = [];
        }
        accountsByType[data.accountType].push({ ...data, id: doc.id });
    });

    const accountTypeLabels = {
        'nakit': 'Nakit Hesapları',
        'banka': 'Banka Hesapları',
        'kredi': 'Kredi Hesapları',
        'krediKarti': 'Kredi Kartları',
        'birikim': 'Birikim Hesapları'
    };

    for (const [type, accounts] of Object.entries(accountsByType)) {
        const typeDiv = document.createElement('div');
        typeDiv.classList.add('account-type-group');

        const typeHeader = document.createElement('h3');
        typeHeader.textContent = accountTypeLabels[type] || type;
        typeDiv.appendChild(typeHeader);

        accounts.forEach(account => {
            const accountDiv = document.createElement('div');
            accountDiv.classList.add('account-item');
            accountDiv.textContent = account.accountName;
            accountDiv.addEventListener('click', async () => {
                const accountData = await loadAccountDetails(account.id);
                if (accountData) {
                    displayAccountDetails(accountData, account.id, accountDiv);
                }
            });
            typeDiv.appendChild(accountDiv);
        });

        accountListContainer.appendChild(typeDiv);
    }
}

export async function loadAccountDetails(accountId) {
    const accountDoc = await getDoc(doc(db, 'accounts', accountId));
    return accountDoc.exists() ? accountDoc.data() : null;
}

export function displayAccountDetails(accountData, accountId, accountDiv) {
    const existingDetailsDiv = accountDiv.querySelector('.account-details');
    if (existingDetailsDiv) {
        existingDetailsDiv.remove(); // Remove the existing details div if it exists
    }

    const accountDetailsDiv = document.createElement('div');
    accountDetailsDiv.classList.add('account-details');

    const labels = {
        cardLimit: 'Kart Limiti',
        availableLimit: 'Kullanılabilir Limit',
        currentSpending: 'Dönem İçi Harcama',
        pendingAmountAtOpening: 'Hesap Açılışındaki Bekleyen Tutar',
        previousStatementBalance: 'Bir Önceki Ekstreden Kalan Tutar',
        statementDate: 'En Yakın Ekstre Kesim Tarihi',
        paymentDueDate: 'En Yakın Son Ödeme Tarihi',
        installments: 'Gelecek Dönem Taksitler',
        currency: 'Para Birimi',
        accountType: 'Hesap Türü',
        accountName: 'Hesap Adı',
        openingDate: 'Açılış Tarihi',
        uid: 'Kullanıcı ID',
        loanAmount: 'Kredi Tutarı',
        loanInterestRate: 'Faiz Oranı',
        fundRate: 'Fon Oranı',
        taxRate: 'Vergi Oranı',
        totalTerm: 'Toplam Vade',
        remainingTerm: 'Kalan Vade',
        installmentAmount: 'Taksit Tutarı',
        initialBalance: 'Başlangıç Bakiyesi',
        overdraftLimit: 'KMH Limiti',
        overdraftInterestRate: 'KMH Faizi',
        targetAmount: 'Düzenli Ödenen Tutar',
        targetDate: 'En Yakın Ödeme Yapılacak Hedef Tarih'
    };

    const sortedKeys = [
        'accountName',
        'accountType',
        'openingDate',
        'currency',
        'cardLimit',
        'availableLimit',
        'currentSpending',
        'pendingAmountAtOpening',
        'previousStatementBalance',
        'statementDate',
        'paymentDueDate',
        'installments',
        'loanAmount',
        'loanInterestRate',
        'fundRate',
        'taxRate',
        'totalTerm',
        'remainingTerm',
        'installmentAmount',
        'initialBalance',
        'overdraftLimit',
        'overdraftInterestRate',
        'targetAmount',
        'targetDate',
        'uid'
    ];

    sortedKeys.forEach(key => {
        if (accountData[key] !== undefined) {
            const p = document.createElement('p');
            p.textContent = `${labels[key] || key}: ${accountData[key]}`;
            accountDetailsDiv.appendChild(p);
        }
    });

    // Append the details right below the clicked account item
    accountDiv.insertAdjacentElement('afterend', accountDetailsDiv);

    document.getElementById('deleteAccountButton').dataset.accountId = accountId;
    document.getElementById('editAccountButton').dataset.accountId = accountId;
}
