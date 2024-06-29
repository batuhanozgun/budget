export function getBirikimFields() {
    return `
        <label for="targetAmount">Düzenli Ödenen Tutar:</label>
        <input type="number" step="0.01" id="targetAmount" name="targetAmount" required>
        <label for="targetDate">En Yakın Ödeme Yapılacak Hedef Tarih:</label>
        <input type="date" id="targetDate" name="targetDate" required>
    `;
}

export function getBirikimValues() {
    return {
        targetAmount: parseFloat(document.getElementById('targetAmount').value).toFixed(2),
        targetDate: document.getElementById('targetDate').value
    };
}

export function getBirikimLabels() {
    return {
        targetAmount: "Düzenli Ödenen Tutar",
        targetDate: "En Yakın Ödeme Yapılacak Hedef Tarih"
    };
}
