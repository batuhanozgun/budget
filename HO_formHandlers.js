import { checkAuth } from './auth.js';
import { updateAccount, deleteAccountById, addAccount, checkDuplicateAccountName, loadAccounts } from './HO_account.js';
import { showMessage, resetForm, displayAccountDetails, loadAccountDetails } from './HO_ui.js';

// handleFormSubmit function
export async function handleFormSubmit(e) {
    e.preventDefault();

    const formMode = document.getElementById('accountForm').dataset.mode;
    const accountData = getFormData();
    const user = await checkAuth();

    if (!user) {
        console.error('Kullanıcı oturumu açık değil.');
        window.location.href = 'login.html';
        return;
    }

    if (formMode === 'edit') {
        const accountId = document.getElementById('accountForm').dataset.accountId;
        try {
            await updateAccount(accountId, accountData);
            console.log('Hesap başarıyla güncellendi.');
            document.getElementById('accountForm').dataset.mode = 'create';
            document.getElementById('accountForm').dataset.accountId = '';
            loadAccounts(user);
            showMessage('Hesap başarıyla güncellendi.');
            resetForm();
        } catch (e) {
            console.error('Hesap güncellenirken hata oluştu:', e);
            showMessage('Hesap güncellenirken hata oluştu.');
        }
    } else {
        try {
            const isDuplicate = await checkDuplicateAccountName(user.uid, accountData.accountName);
            if (isDuplicate) {
                showMessage('Aynı isimde bir hesap zaten mevcut.');
                return;
            }

            const docRef = await addAccount(user, accountData);
            console.log("Document written with ID: ", docRef);
            loadAccounts(user);
            showMessage('Hesap başarıyla oluşturuldu.');
            resetForm();
        } catch (e) {
            console.error("Error adding document: ", e);
            showMessage('Hesap oluşturulurken hata oluştu.');
        }
    }
}

// handleDeleteAccount function
export async function handleDeleteAccount() {
    const accountId = this.dataset.accountId;
    if (!accountId) return;

    try {
        await deleteAccountById(accountId);
        console.log('Hesap başarıyla silindi.');
        document.getElementById('accountDetails').style.display = 'none';
        const user = await checkAuth();
        if (user) {
            loadAccounts(user);
        }
        showMessage('Hesap başarıyla silindi.');
        resetForm();
    } catch (e) {
        console.error('Hesap silinirken hata oluştu:', e);
        showMessage('Hesap silinirken hata oluştu.');
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
  };
