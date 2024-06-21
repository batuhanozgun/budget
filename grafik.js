import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-app.js";
import { getFirestore, collection, query, getDocs, where, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-auth.js";

// Firebase yapılandırmanızı buraya ekleyin
const firebaseConfig = {
    apiKey: "AIzaSyDidWK1ghqKTzokhT-YoqGb7Tz9w5AFjhM",
    authDomain: "batusbudget.firebaseapp.com",
    projectId: "batusbudget",
    storageBucket: "batusbudget.appspot.com",
    messagingSenderId: "1084998760222",
    appId: "1:1084998760222:web:d28492021d0ccefaf2bb0f"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

onAuthStateChanged(auth, (user) => {
    if (user) {
        loadTransactions(user.uid);
    } else {
        // Kullanıcı oturumu kapatıldıysa login sayfasına yönlendirin
        window.location.href = 'login.html';
    }
});

async function loadTransactions(uid) {
    const q = query(collection(db, 'transactions'), where("userId", "==", uid));
    const querySnapshot = await getDocs(q);

    const data = {};
    
    for (const transactionDoc of querySnapshot.docs) {
        const transaction = transactionDoc.data();
        const kaynakHesapDoc = await getDoc(doc(db, 'accounts', transaction.kaynakHesap));
        const accountName = kaynakHesapDoc.exists() ? kaynakHesapDoc.data().accountName : 'N/A';
        const amount = transaction.tutar;

        if (data[accountName]) {
            data[accountName] += parseFloat(amount);
        } else {
            data[accountName] = parseFloat(amount);
        }
    }

    const labels = Object.keys(data);
    const values = Object.values(data);

    renderChart(labels, values);
}

function renderChart(labels, values) {
    const ctx = document.getElementById('transactionChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Tutar',
                data: values,
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}
