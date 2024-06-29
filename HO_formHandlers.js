import { checkAuth } from './auth.js';
import { showMessage, loadAccounts, resetForm } from './HO_ui.js';
import { addAccount, updateAccount, deleteAccountById, checkDuplicateAccountName } from './HO_account.js';

document.addEventListener('DOMContentLoaded', async () => {
    const user = await checkAuth();
    if (user) {
        loadAccounts(user);
    }

    document.getElementById('accountType').addEventListener('change', updateDynamicFields);
    document.getElementById('accountForm').addEventListener('submit', handleFormSubmit);
    document.getElementById('addInstallmentButton').addEventListener('click', addInstallment);
    document.getElementById('deleteAccountButton').addEventListener('click', deleteAccount);
    document.getElementById('editAccountButton').addEventListener('click', editAccount);
    document.getElementById('cancelEditButton').addEventListener('click', resetForm);
});

async function handleFormSubmit(e) {
    e.preventDefault();

    const formMode = document.getElementById('accountForm').dataset.mode;
    const accountData = getFormData();

    const duplicateCheck = await checkDuplicateAccountName(accountData.accountName);
    if (duplicateCheck) {
        showMessage('Aynı isimde bir hesap zaten mevcut.');
        return;
    }

    const user = await checkAuth();
    if (!user) {
        return;
    }

    if (formMode === 'edit') {
        const accountId = document.getElementById('accountForm').dataset.accountId;
        await updateAccount(accountId, accountData);
        showMessage('Hesap başarıyla güncellendi.');
    } else {
        await addAccount(user.uid, accountData);
        showMessage('Hesap başarıyla oluşturuldu.');
    }

    loadAccounts(user);
    resetForm();
}

function updateDynamicFields() {
    const accountType = document.getElementById('accountType').value;
    const dynamicFields = document.getElementById('dynamicFields');
    const futureInstallmentsSection = document.getElementById('futureInstallmentsSection');
    dynamicFields.innerHTML = '';
    futureInstallmentsSection.style.display = 'none';

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
            futureInstallmentsSection.style.display = 'block';
            break;
        case 'birikim':
            fields = getBirikimFields();
            break;
    }

    dynamicFields.innerHTML = fields;

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

export { handleFormSubmit, updateDynamicFields };
