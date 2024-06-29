export function getKrediKartiFields() {
    return `
        <label for="cardLimit">Kart Limiti:</label>
        <input type="number" step="0.01" id="cardLimit" name="cardLimit" required>
        <label for="availableLimit">Kullanılabilir Limit (Kalan Limit):</label>
        <input type="number" step="0.01" id="availableLimit" name="availableLimit" required>
        <label for="currentSpending">Dönem İçi Harcama:</label>
        <input type="number" step="0.01" id="currentSpending" name="currentSpending" required>
        <label for="pendingAmountAtOpening">Hesap Açılışındaki Bekleyen Tutar:</label>
        <input type="number" step="0.01" id="pendingAmountAtOpening" name="pendingAmountAtOpening" required>
        <label for="previousStatementBalance">Bir Önceki Ekstreden Kalan Tutar:</label>
        <input type="number" step="0.01" id="previousStatementBalance" name="previousStatementBalance" required>
        <label for="statementDate">En Yakın Ekstre Kesim Tarihi:</label>
        <input type="date" id="statementDate" name="statementDate" required>
        <label for="paymentDueDate">En Yakın Son Ödeme Tarihi:</label>
        <input type="date" id="paymentDueDate" name="paymentDueDate" required>
        <div id="futureInstallmentsSection">
            <h3>Gelecek Dönem Taksitler</h3>
            <div id="installmentsContainer"></div>
            <button type="button" id="addInstallmentButton">Taksit Ekle</button>
        </div>
    `;
}

export function getKrediKartiValues() {
    return {
        cardLimit: parseFloat(document.getElementById('cardLimit').value).toFixed(2),
        availableLimit: parseFloat(document.getElementById('availableLimit').value).toFixed(2),
        currentSpending: parseFloat(document.getElementById('currentSpending').value).toFixed(2),
        pendingAmountAtOpening: parseFloat(document.getElementById('pendingAmountAtOpening').value).toFixed(2),
        previousStatementBalance: parseFloat(document.getElementById('previousStatementBalance').value).toFixed(2),
        statementDate: document.getElementById('statementDate').value,
        paymentDueDate: document.getElementById('paymentDueDate').value,
        installments: getInstallmentsData()
    };
}

export function addInstallment() {
    const container = document.getElementById('installmentsContainer');
    const div = document.createElement('div');
    div.classList.add('installment-item');
    div.innerHTML = `
        <select class="installmentMonth">
            <option value="01">Ocak</option>
            <option value="02">Şubat</option>
            <option value="03">Mart</option>
            <option value="04">Nisan</option>
            <option value="05">Mayıs</option>
            <option value="06">Haziran</option>
            <option value="07">Temmuz</option>
            <option value="08">Ağustos</option>
            <option value="09">Eylül</option>
            <option value="10">Ekim</option>
            <option value="11">Kasım</option>
            <option value="12">Aralık</option>
        </select>
        <input type="number" class="installmentYear" placeholder="Yıl" required>
        <input type="number" class="installmentAmount" placeholder="Tutar" required>
        <button type="button" class="removeInstallmentButton">Kaldır</button>
    `;
    container.appendChild(div);

    div.querySelector('.removeInstallmentButton').addEventListener('click', () => {
        div.remove();
    });
}

export function getInstallmentsData() {
    const container = document.getElementById('installmentsContainer');
    const installments = [];
    container.querySelectorAll('.installment-item').forEach(item => {
        const month = item.querySelector('.installmentMonth').value;
        const year = item.querySelector('.installmentYear').value;
        const amount = item.querySelector('.installmentAmount').value;
        installments.push({ month, year, amount });
    });
    return installments;
}
