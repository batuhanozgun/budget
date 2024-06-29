import { auth, db } from './firebaseConfig.js';
import { collection, addDoc, getDocs, query, where, doc, getDoc, deleteDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { checkAuth } from './auth.js';
import { getNakitFields, getNakitValues, getNakitLabels } from './nakit.js';
import { getBankaFields, getBankaValues, getBankaLabels } from './banka.js';
import { getKrediFields, getKrediValues, getKrediLabels } from './kredi.js';
import { getKrediKartiFields, getKrediKartiValues, getKrediKartiLabels, addInstallment, getInstallmentsData } from './krediKarti.js';
import { getBirikimFields, getBirikimValues, getBirikimLabels } from './birikim.js';
import { loadAccounts, displayAccountDetails } from './HO_account.js';
import { handleFormSubmit, handleDeleteAccount, handleEditAccount, resetForm } from './HO_formHandlers.js';
import { updateDynamicFields } from './HO_ui.js'; // import the function from HO_ui.js

document.addEventListener('DOMContentLoaded', async () => {
    const user = await checkAuth();
    if (user) {
        loadAccounts(user);
    }

    document.getElementById('accountType').addEventListener('change', updateDynamicFields);
    document.getElementById('accountForm').addEventListener('submit', handleFormSubmit);
    document.getElementById('addInstallmentButton').addEventListener('click', addInstallment);
    document.getElementById('deleteAccountButton').addEventListener('click', handleDeleteAccount);
    document.getElementById('editAccountButton').addEventListener('click', handleEditAccount);
    document.getElementById('cancelEditButton').addEventListener('click', resetForm);
});
