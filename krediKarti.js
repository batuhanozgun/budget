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
    const installmentDiv = document.createElement('div');
    installmentDiv.classList.add('installment');
    
    installmentDiv.innerHTML = `
        <label for="installmentMonth">Ay:</label>
        <input type="number" class="installmentMonth" name="installmentMonth" min="1" max="12" required>
        <label for="installmentYear">Yıl:</label>
        <input type="number" class="installmentYear" name="installmentYear" min="2023" required>
        <label for="installmentAmount">Tutar:</label>
        <input type="number" class="installmentAmount" name="installmentAmount" required>
        <button type="button" class="removeInstallmentButton">Kaldır</button>
    `;

    installmentDiv.querySelector('.removeInstallmentButton').addEventListener('click', () => {
        container.removeChild(installmentDiv);
    });

    container.appendChild(installmentDiv);
}

export function getInstallmentsData() {
    const installments = [];
    const installmentDivs = document.querySelectorAll('.installment');

    installmentDivs.forEach(div => {
        const month = div.querySelector('.installmentMonth').value;
        const year = div.querySelector('.installmentYear').value;
        const amount = div.querySelector('.installmentAmount').value;

        if (month && year && amount) {
            installments.push({ month, year, amount });
        }
    });

    return installments;
}

export function getKrediKartiLabels() {
    return {
        cardLimit: "Kart Limiti",
        availableLimit: "Kullanılabilir Limit (Kalan Limit)",
        currentSpending: "Dönem İçi Harcama",
        pendingAmountAtOpening: "Hesap Açılışındaki Bekleyen Tutar",
        previousStatementBalance: "Bir Önceki Ekstreden Kalan Tutar",
        statementDate: "En Yakın Ekstre Kesim Tarihi",
        paymentDueDate: "En Yakın Son Ödeme Tarihi",
        installments: "Gelecek Dönem Taksitler"
    };
}
