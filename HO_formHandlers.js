import { checkAuth } from './auth.js';
import { checkDuplicateAccountName, addAccount, updateAccount, deleteAccountById } from './HO_account.js';
import { showMessage, resetForm, loadAccounts } from './HO_ui.js';

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
                showMessage('Aynı isimle başka bir hesap mevcut.');
                return;
            }

            const accountId = await addAccount(user, accountData);
            console.log("Document written with ID: ", accountId);
            loadAccounts(user);
            showMessage('Hesap başarıyla oluşturuldu.');
            resetForm();
        } catch (e) {
            console.error("Error adding document: ", e);
            showMessage('Hesap oluşturulurken hata oluştu.');
        }
    }
}

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
