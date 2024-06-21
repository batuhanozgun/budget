import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, query, setDoc } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-firestore.js";

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

async function loadCategories() {
    const categorySelect = document.getElementById('kategoriSec');
    const categoryList = document.getElementById('kategoriListesi');
    categorySelect.innerHTML = '<option value="">Seçiniz</option>';
    categoryList.innerHTML = '';

    const q = query(collection(db, 'categories'));
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((doc) => {
        const option = document.createElement('option');
        option.value = doc.id;
        option.textContent = doc.data().name;
        categorySelect.appendChild(option);

        const li = document.createElement('li');
        li.innerHTML = `<span>${doc.data().name}</span>
                        <div class="button-container">
                            <button class="edit" onclick="editCategory('${doc.id}', '${doc.data().name}')">Düzenle</button>
                            <button onclick="deleteCategory('${doc.id}')">Sil</button>
                        </div>`;
        categoryList.appendChild(li);
    });
}

async function loadSubCategories() {
    const subCategoryList = document.getElementById('altKategoriListesi');
    subCategoryList.innerHTML = '';

    const selectedCategory = document.getElementById('kategoriSec').value;
    if (selectedCategory) {
        const q = query(collection(db, 'categories', selectedCategory, 'subcategories'));
        const querySnapshot = await getDocs(q);

        querySnapshot.forEach((doc) => {
            const li = document.createElement('li');
            li.innerHTML = `<span>${doc.data().name}</span>
                            <div class="button-container">
                                <button class="edit" onclick="editSubCategory('${selectedCategory}', '${doc.id}', '${doc.data().name}')">Düzenle</button>
                                <button onclick="deleteSubCategory('${selectedCategory}', '${doc.id}')">Sil</button>
                            </div>`;
            subCategoryList.appendChild(li);
        });
    }
}

async function deleteCategory(categoryId) {
    await deleteDoc(doc(db, 'categories', categoryId));
    loadCategories();
}

async function deleteSubCategory(categoryId, subCategoryId) {
    await deleteDoc(doc(db, 'categories', categoryId, 'subcategories', subCategoryId));
    loadSubCategories();
}

function editCategory(categoryId, categoryName) {
    const newCategoryName = prompt('Yeni Kategori Adı:', categoryName);
    if (newCategoryName) {
        updateCategoryName(categoryId, newCategoryName);
    }
}

function editSubCategory(categoryId, subCategoryId, subCategoryName) {
    const newSubCategoryName = prompt('Yeni Alt Kategori Adı:', subCategoryName);
    if (newSubCategoryName) {
        updateSubCategoryName(categoryId, subCategoryId, newSubCategoryName);
    }
}

async function updateCategoryName(categoryId, newCategoryName) {
    const categoryDoc = doc(db, 'categories', categoryId);
    await setDoc(categoryDoc, { name: newCategoryName }, { merge: true });
    loadCategories();
}

async function updateSubCategoryName(categoryId, subCategoryId, newSubCategoryName) {
    const subCategoryDoc = doc(db, 'categories', categoryId, 'subcategories', subCategoryId);
    await setDoc(subCategoryDoc, { name: newSubCategoryName }, { merge: true });
    loadSubCategories();
}

document.getElementById('categoryForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const kategoriAdi = document.getElementById('kategoriAdi').value;
    try {
        await addDoc(collection(db, 'categories'), {
            name: kategoriAdi
        });
        document.getElementById('categoryForm').reset();
        loadCategories();
    } catch (error) {
        console.error('Hata:', error);
        alert('Kategori eklenirken bir hata oluştu.');
    }
});

document.getElementById('subCategoryForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const selectedCategory = document.getElementById('kategoriSec').value;
    const altKategoriAdi = document.getElementById('altKategoriAdi').value;
    try {
        await addDoc(collection(db, 'categories', selectedCategory, 'subcategories'), {
            name: altKategoriAdi
        });
        document.getElementById('subCategoryForm').reset();
        loadSubCategories();
    } catch (error) {
        console.error('Hata:', error);
        alert('Alt kategori eklenirken bir hata oluştu.');
    }
});

document.getElementById('kategoriSec').addEventListener('change', loadSubCategories);

// İşlevleri global hale getirin
window.deleteSubCategory = deleteSubCategory;
window.editSubCategory = editSubCategory;

loadCategories();
