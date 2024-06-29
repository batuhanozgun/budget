import { checkDuplicateAccountName, addAccount, updateAccount, deleteAccountById, loadAccounts, loadAccountDetails, displayAccountDetails } from './HO_account.js';
import { resetForm, showMessage } from './HO_ui.js';
import { checkAuth } from './auth.js';

export async function handleFormSubmit(e) {
    e.preventDefault();

    const formMode = document.getElementById('accountForm').dataset.mode;
    const accountData = getFormData();
    const user = await checkAuth();

    if (!user) {
        console.error('Kullanıcı oturumu açık değil.');
        window.location.href = 'login.html'; // Kullanıcı oturum açmamışsa login sayfasına yönlendir
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
            if (await checkDuplicateAccountName(user.uid, accountData.accountName)) {
                showMessage('Bu hesap adıyla zaten bir hesap var.');
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
