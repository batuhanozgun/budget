export function getBirikimFields() {
    return `
        <label for="targetAmount">Hedef Tutar:</label>
        <input type="number" step="0.01" id="targetAmount" name="targetAmount" required>
        <label for="paymentFrequency">Ödeme Sıklığı:</label>
        <select id="paymentFrequency" name="paymentFrequency" required>
            <option value="weekly">Her hafta</option>
            <option value="monthly">Her ay</option>
        </select>
        <div id="paymentFrequencyDetails"></div>
    `;
}

export function getBirikimValues() {
    return {
        targetAmount: parseFloat(document.getElementById('targetAmount').value).toFixed(2),
        paymentFrequency: document.getElementById('paymentFrequency').value,
        paymentFrequencyDetails: getPaymentFrequencyDetails()
    };
}

function getPaymentFrequencyDetails() {
    const paymentFrequency = document.getElementById('paymentFrequency').value;
    let details = '';
    if (paymentFrequency === 'weekly') {
        details = document.getElementById('paymentDay').value;
    } else if (paymentFrequency === 'monthly') {
        details = document.getElementById('paymentDate').value;
    }
    return details;
}
