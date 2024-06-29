import { collection, getDocs, query, where, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { db } from './firebaseConfig.js';

export function showMessage(message) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = message;
    messageDiv.style.display = 'block';
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 3000);
}

export function resetForm() {
    document.getElementById('accountForm').reset();
    document.getElementById('accountForm').dataset.mode = 'create';
    document.getElementById('accountForm').dataset.accountId = '';
    document.querySelector('.form-section h2').textContent = 'Hesap Oluştur';
    document.querySelector('.form-section button[type="submit"]').textContent = 'Hesap Oluştur';
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

            const accountDetailsDiv = document.createElement('div');
            accountDetailsDiv.classList.add('account-details');
            accountDetailsDiv.style.display = 'none';
            accountDiv.appendChild(accountDetailsDiv);

            accountDiv.addEventListener('click', async () => {
                const accountData = await loadAccountDetails(account.id);
                if (accountData) {
                    displayAccountDetails(accountData, accountDetailsDiv);
                    accountDetailsDiv.style.display = accountDetailsDiv.style.display === 'none' ? 'block' : 'none';
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

export function displayAccountDetails(accountData, accountDetailsDiv) {
    accountDetailsDiv.innerHTML = '';
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

    for (const key in accountData) {
        if (accountData.hasOwnProperty(key)) {
            const p = document.createElement('p');
            p.textContent = `${labels[key] || key}: ${accountData[key]}`;
            accountDetailsDiv.appendChild(p);
        }
    }
}
