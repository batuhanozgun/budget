<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kayıt Gir</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="container">
        <h2>Kayıt Gir</h2>
        <form id="transactionForm">
            <label for="kayitTipi">Kayıt Tipi:</label>
            <select id="kayitTipi" required>
                <option value="">Seçiniz</option>
                <option value="Gelir">Gelir</option>
                <option value="Gider">Gider</option>
            </select>
            
            <label for="kayitYonu">Kayıt Yönü:</label>
            <select id="kayitYonu" required>
                <option value="">Seçiniz</option>
                <option value="Gelir Kaydı">Gelir Kaydı</option>
                <option value="Harcama Kaydı">Harcama Kaydı</option>
                <option value="Hesaplar Arası Kayıt">Hesaplar Arası Kayıt</option>
            </select>
            
            <label for="kaynakHesap">Kaynak Hesap:</label>
            <select id="kaynakHesap" required>
                <!-- Hesaplar buraya dinamik olarak yüklenecek -->
            </select>
            
            <label for="kategori">Kategori:</label>
            <select id="kategori" required>
                <!-- Kategoriler buraya dinamik olarak yüklenecek -->
            </select>
            
            <label for="altKategori">Alt Kategori:</label>
            <select id="altKategori">
                <!-- Alt kategoriler buraya dinamik olarak yüklenecek -->
            </select>
            
            <label for="hedefHesap" id="hedefHesapLabel" style="display:none;">Hedef Hesap:</label>
            <select id="hedefHesap" style="display:none;">
                <!-- Hesaplar buraya dinamik olarak yüklenecek -->
            </select>
            
            <label for="tutar">Tutar:</label>
            <input type="number" id="tutar" required>
            
            <label for="taksitAdedi" id="taksitAdediLabel" style="display:none;">Taksit Adedi:</label>
            <input type="number" id="taksitAdedi" style="display:none;">
            
            <label for="taksitTutar" id="taksitTutarLabel" style="display:none;">Taksit Tutar:</label>
            <input type="number" id="taksitTutar" style="display:none;">
            
            <label for="islemTarihi">İşlem Tarihi:</label>
            <input type="date" id="islemTarihi" required>
            
            <button type="submit">Kaydet</button>
        </form>
    </div>

    <script type="module" src="kayit_gir.js"></script>
</body>
</html>
