import { auth, db } from './firebaseConfig.js';
import { checkAuth } from './auth.js';
import { getNakitFields, getNakitValues, getNakitLabels } from './nakit.js';
import { getBankaFields, getBankaValues, getBankaLabels } from './banka.js';
import { getKrediFields, getKrediValues, getKrediLabels } from './kredi.js';
import { getKrediKartiFields, getKrediKartiValues, getKrediKartiLabels, addInstallment } from './krediKarti.js';
import { getBirikimFields, getBirikimValues, getBirikimLabels } from './birikim.js';
import { handleFormSubmit, handleDeleteAccount } from './HO_formHandlers.js';
import { loadAccounts, updateDynamicFields, resetForm } from './HO_ui.js';

document.addEventListener('DOMContentLoaded', async () => {
    const user = await checkAuth();
    if (user) {
        loadAccounts(user);
    }

    document.getElementById('accountType').addEventListener('change', updateDynamicFields);
    document.getElementById('accountForm').addEventListener('submit', handleFormSubmit);
    document.getElementById('addInstallmentButton').addEventListener('click', addInstallment);
    document.getElementById('deleteAccountButton').addEventListener('click', handleDeleteAccount);
    document.getElementById('cancelEditButton').addEventListener('click', resetForm);
});
