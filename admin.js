import { auth, db } from './firebaseConfig.js';
import { signOut } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { collection, getDocs, addDoc, deleteDoc, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { checkAuth } from './auth.js';

document.getElementById('logoutButton').addEventListener('click', async () => {
    const messageDiv = document.getElementById('message');

    try {
        await signOut(auth);
        window.location.href = 'login.html';
    } catch (error) {
        console.error('Çıkış hatası: ', error);
        messageDiv.textContent = 'Çıkış hatası: ' + error.message;
        messageDiv.style.display = 'block';
    }
});

document.addEventListener('DOMContentLoaded', async () => {
    showLoadingOverlay();
    const user = await checkAuth();
    if (user) {
        await loadUsers();
        await loadRecordTypes();
        await loadRecordDirections();
    }
    hideLoadingOverlay();
});

async function loadUsers() {
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const tableBody = document.getElementById('usersTable').getElementsByTagName('tbody')[0];
    tableBody.innerHTML = '';

    usersSnapshot.forEach(doc => {
        const user = doc.data();
        const row = tableBody.insertRow();
        row.insertCell(0).textContent = doc.id;
        row.insertCell(1).textContent = user.firstName + ' ' + user.lastName;
        row.insertCell(2).textContent = user.email;
    });
}

async function loadRecordTypes() {
    const recordTypesSnapshot = await getDocs(collection(db, 'recordTypes'));
    const tableBody = document.getElementById('recordTypesTable').getElementsByTagName('tbody')[0];
    tableBody.innerHTML = '';

    recordTypesSnapshot.forEach(doc => {
        const recordType = doc.data().name;
        const row = tableBody.insertRow();
        row.insertCell(0).textContent = recordType;

        const actionsCell = row.insertCell(1);
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Sil';
        deleteButton.onclick = () => deleteRecordType(doc.id);
        actionsCell.appendChild(deleteButton);
    });
}

async function loadRecordDirections() {
    const recordDirectionsSnapshot = await getDocs(collection(db, 'recordDirections'));
    const tableBody = document.getElementById('recordDirectionsTable').getElementsByTagName('tbody')[0];
    tableBody.innerHTML = '';

    recordDirectionsSnapshot.forEach(doc => {
        const recordDirection = doc.data().name;
        const row = tableBody.insertRow();
        row.insertCell(0).textContent = recordDirection;

        const actionsCell = row.insertCell(1);
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Sil';
        deleteButton.onclick = () => deleteRecordDirection(doc.id);
        actionsCell.appendChild(deleteButton);
    });
}

document.getElementById('addRecordTypeForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const newRecordType = document.getElementById('newRecordType').value;
    try {
        await addDoc(collection(db, 'recordTypes'), { name: newRecordType });
        document.getElementById('newRecordType').value = '';
        await loadRecordTypes();
    } catch (error) {
        console.error('Kayıt Tipi eklenirken hata:', error);
    }
});

document.getElementById('addRecordDirectionForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const newRecordDirection = document.getElementById('newRecordDirection').value;
    try {
        await addDoc(collection(db, 'recordDirections'), { name: newRecordDirection });
        document.getElementById('newRecordDirection').value = '';
        await loadRecordDirections();
    } catch (error) {
        console.error('Kayıt Yönü eklenirken hata:', error);
    }
});

async function deleteRecordType(recordTypeId) {
    try {
        await deleteDoc(doc(db, 'recordTypes', recordTypeId));
        await loadRecordTypes();
    } catch (error) {
        console.error('Kayıt Tipi silinirken hata:', error);
    }
}

async function deleteRecordDirection(recordDirectionId) {
    try {
        await deleteDoc(doc(db, 'recordDirections', recordDirectionId));
        await loadRecordDirections();
    } catch (error) {
        console.error('Kayıt Yönü silinirken hata:', error);
    }
}

function showLoadingOverlay() {
    document.querySelector('.loading-overlay').style.display = 'flex';
}

function hideLoadingOverlay() {
    document.querySelector('.loading-overlay').style.display = 'none';
}
