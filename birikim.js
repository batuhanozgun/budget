export function getBirikimFields() {
    return `
        <label for="targetAmount">Hedef Tutar:</label>
        <input type="number" id="targetAmount" name="targetAmount" required>
        <label for="paymentFrequency">Ödeme Sıklığı:</label>
        <select id="paymentFrequency" name="paymentFrequency" required>
            <option value="weekly">Her hafta</option>
            <option value="monthly">Her ay</option>
        </select>
        <div id="paymentFrequencyDetails"></div>`;
}

export function getBirikimValues() {
    return {
        targetAmount: document.getElementById('targetAmount').value,
        paymentFrequency: document.getElementById('paymentFrequency').value,
        paymentDay: document.getElementById('paymentDay') ? document.getElementById('paymentDay').value : null,
        paymentDate: document.getElementById('paymentDate') ? document.getElementById('paymentDate').value : null
    };
}
