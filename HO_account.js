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
