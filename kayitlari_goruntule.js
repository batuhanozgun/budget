async function loadTransactions(uid) {
    const q = query(collection(db, 'transactions'), where("userId", "==", uid));
    const querySnapshot = await getDocs(q);

    const tableBody = document.getElementById('transactionsTableBody');
    tableBody.innerHTML = '';

    const transactionsByAccount = {};

    for (const transactionDoc of querySnapshot.docs) {
        const data = transactionDoc.data();
        const transactionId = transactionDoc.id;

        let kategoriName = 'N/A';
        let altKategoriName = 'N/A';
        let kaynakHesapName = 'N/A';
        let hedefHesapName = 'N/A';

        // Kategori verisini alırken hata kontrolü
        try {
            if (data.kategori) {
                const kategoriDoc = await getDoc(doc(db, 'categories', data.kategori));
                if (kategoriDoc.exists()) {
                    kategoriName = kategoriDoc.data().name;
                } else {
                    console.warn('Kategori belgesi bulunamadı:', data.kategori);
                }
            } else {
                console.warn('Kategori ID eksik:', data);
            }
        } catch (error) {
            console.error('Kategori verisi alınamadı:', error);
        }

        // Alt Kategori verisini alırken hata kontrolü
        if (data.altKategori) {
            try {
                const altKategoriDoc = await getDoc(doc(db, 'categories', data.kategori, 'subcategories', data.altKategori));
                if (altKategoriDoc.exists()) {
                    altKategoriName = altKategoriDoc.data().name;
                } else {
                    console.warn('Alt Kategori belgesi bulunamadı:', data.altKategori);
                }
            } catch (error) {
                console.error('Alt Kategori verisi alınamadı:', error);
            }
        }

        // Kaynak Hesap verisini alırken hata kontrolü
        try {
            if (data.kaynakHesap) {
                const kaynakHesapDoc = await getDoc(doc(db, 'accounts', data.kaynakHesap));
                if (kaynakHesapDoc.exists()) {
                    kaynakHesapName = kaynakHesapDoc.data().accountName;
                } else {
                    console.warn('Kaynak Hesap belgesi bulunamadı:', data.kaynakHesap);
                }
            } else {
                console.warn('Kaynak Hesap ID eksik:', data);
            }
        } catch (error) {
            console.error('Kaynak Hesap verisi alınamadı:', error);
        }

        // Hedef Hesap verisini alırken hata kontrolü
        if (data.hedefHesap) {
            try {
                const hedefHesapDoc = await getDoc(doc(db, 'accounts', data.hedefHesap));
                if (hedefHesapDoc.exists()) {
                    hedefHesapName = hedefHesapDoc.data().accountName;
                } else {
                    console.warn('Hedef Hesap belgesi bulunamadı:', data.hedefHesap);
                }
            } catch (error) {
                console.error('Hedef Hesap verisi alınamadı:', error);
            }
        }

        if (!transactionsByAccount[kaynakHesapName]) {
            transactionsByAccount[kaynakHesapName] = [];
        }
        transactionsByAccount[kaynakHesapName].push({
            id: transactionId,
            data,
            kategoriName,
            altKategoriName,
            kaynakHesapName,
            hedefHesapName
        });
    }

    // Konsola yazdırma işlemleri ile verilerin doğru olduğunu kontrol edelim
    console.log('Transactions By Account:', transactionsByAccount);

    for (const account in transactionsByAccount) {
        const accountTransactions = transactionsByAccount[account];
        let accountTotal = 0;

        const accountRow = document.createElement('tr');
        accountRow.innerHTML = `<td colspan="12" style="background-color: #eee; font-weight: bold;">${account}</td>`;
        tableBody.appendChild(accountRow);
        console.log(`Added header row for account: ${account}`);

        for (const { id, data, kategoriName, altKategoriName, kaynakHesapName, hedefHesapName } of accountTransactions) {
            const row = document.createElement('tr');

            row.innerHTML = `
                <td>${data.kayitTipi}</td>
                <td>${data.kayitYonu}</td>
                <td>${kaynakHesapName}</td>
                <td>${kategoriName}</td>
                <td>${altKategoriName}</td>
                <td>${hedefHesapName}</td>
                <td>${data.tutar}</td>
                <td>${data.taksitAdedi || ''}</td>
                <td>${data.taksitTutar || ''}</td>
                <td>${new Date(data.islemTarihi).toLocaleDateString()}</td>
                <td>${new Date(data.date.seconds * 1000).toLocaleDateString()}</td>
                <td>
                    <div class="action-buttons">
                        <button onclick="editTransaction('${id}')">Düzenle</button>
                        <button onclick="deleteTransaction('${id}')">Sil</button>
                    </div>
                </td>
            `;

            tableBody.appendChild(row);
            console.log(`Added row for transaction ID: ${id}`);

            accountTotal += parseFloat(data.tutar);
        }

        console.log(`Account: ${account}, Total: ${accountTotal}`);

        const totalRow = document.createElement('tr');
        totalRow.innerHTML = `<td colspan="6" style="text-align: right; font-weight: bold;">Toplam:</td><td colspan="6" style="font-weight: bold;">${accountTotal.toFixed(2)}</td>`;
        tableBody.appendChild(totalRow);
        console.log(`Added total row for account: ${account}`);
    }
}
