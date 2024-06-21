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

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('paymentFrequency').addEventListener('change', updatePaymentFrequencyDetails);
});

function updatePaymentFrequencyDetails() {
    const paymentFrequency = document.getElementById('paymentFrequency').value;
    const paymentFrequencyDetails = document.getElementById('paymentFrequencyDetails');
    paymentFrequencyDetails.innerHTML = '';

    if (paymentFrequency === 'weekly') {
        paymentFrequencyDetails.innerHTML += '<label for="paymentDay">Gün:</label><select id="paymentDay" name="paymentDay" required><option value="monday">Pazartesi</option><option value="tuesday">Salı</option><option value="wednesday">Çarşamba</option><option value="thursday">Perşembe</option><option value="friday">Cuma</option><option value="saturday">Cumartesi</option><option value="sunday">Pazar</option></select>';
    } else if (paymentFrequency === 'monthly') {
        paymentFrequencyDetails.innerHTML += '<label for="paymentDate">Gün:</label><input type="number" id="paymentDate" name="paymentDate" min="1" max="31" required>';
    }
}
