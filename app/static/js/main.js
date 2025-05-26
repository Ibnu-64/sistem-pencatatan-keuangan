// Global variables

let financialChart;
let currentEditId = null;
let confirmCallback = null;


// Initialize app
document.addEventListener('DOMContentLoaded', function () {
    initializeChart();
    loadTransactions();
    loadTransactionsMonthly()
    loadSummary();
    setupEventListeners();

    document.getElementById('date').valueAsDate = new Date();
});

// Setup event listeners
function setupEventListeners() {
    // Add transaction button
    document.getElementById('add-transaction-btn').addEventListener('click', () => {
        openModal('add');
    });

    // Delete all button
    document.getElementById('delete-all-btn').addEventListener('click', () => {
        showConfirmModal('Apakah Anda yakin ingin menghapus semua data transaksi?', deleteAllTransactions);
    });

    // Close modal buttons
    document.getElementById('close-modal').addEventListener('click', closeModal);
    document.getElementById('confirm-no').addEventListener('click', closeConfirmModal);

    // Form submit
    document.getElementById('transaction-form').addEventListener('submit', handleFormSubmit);

    // Confirm modal
    document.getElementById('confirm-yes').addEventListener('click', () => {
        if (confirmCallback) {
            confirmCallback();
        }
        closeConfirmModal();
    });

    // Close modals when clicking outside
    document.getElementById('backdrop').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) closeModal();
    });

    document.getElementById('confirm-modal').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) closeConfirmModal();
    });
}

// Initialize chart
function initializeChart(data) {
    const ctx = document.getElementById('financialChart').getContext('2d');

    financialChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agist', 'Sep', 'Okt', 'Nov', 'Des'],
            datasets: [
                {
                    label: 'Pendapatan',
                    data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    backgroundColor: '#82cdff',
                    borderColor: '#059bff',
                    borderWidth: 2,
                    borderSkipped: false,
                    borderRadius: 5
                },
                {
                    label: 'Pengeluaran',
                    data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    backgroundColor: '#ffa0b4',
                    borderColor: '#ff6888',
                    borderWidth: 2,
                    borderSkipped: false,
                    borderRadius: 5
                },
            ]
        },
        options: {
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        color: 'white',
                        font: {
                            size: 14
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(255, 255, 255, 0.1)' },
                    ticks: { color: 'white' }
                },
                x: {
                    grid: { color: 'rgba(255, 255, 255, 0.1)' },
                    ticks: { color: 'white' }
                }
            }
        }
    });
}

// Load transactions
async function loadTransactions() {
    try {
        const response = await fetch(`api/transactions`);
        const transactions = await response.json();

        displayTransactions(transactions);
    } catch (error) {
        console.error('Error loading transactions:', error);
        showNoTransactions();
    }
}

async function loadTransactionsMonthly() {
    try {
        const response = await fetch(`api/monthly-summary`);
        const transactions = await response.json();

        updateChart(transactions);
    } catch (error) {
        console.error('Error loading transactions:', error);
    }
}

// Display transactions in table
function displayTransactions(transactions) {
    const tbody = document.getElementById('transaction-tbody');
    const noTransactions = document.getElementById('no-transactions');

    if (transactions.length === 0) {
        showNoTransactions();
        return;
    }

    tbody.innerHTML = '';
    noTransactions.classList.add('hidden');

    transactions.forEach(transaction => {
        const row = document.createElement('tr');
        row.className = 'border-b border-gray-600 hover:bg-gray-700';

        const typeClass = transaction.type_id === 'income' ? 'text-green-400' : 'text-red-400';
        const typeText = transaction.type_id === 'income' ? 'Masuk' : 'Keluar';

        row.innerHTML = `
                    <td class="py-2 px-3">${formatDate(transaction.date)}</td>
                    <td class="py-2 px-3 ${typeClass}">${typeText}</td>
                    <td class="py-2 px-3 capitalize">${transaction.category_name}</td>
                    <td class="py-2 px-3">Rp ${formatNumber(transaction.amount)}</td>
                    <td class="py-2 px-3">${transaction.description || '-'}</td>
                    <td class="py-2 px-3">
                        <button onclick="editTransaction('${transaction.id}')" 
                            class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs mr-1">
                            Edit
                        </button>
                        <button onclick="deleteTransaction('${transaction.id}')" 
                            class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs">
                            Hapus
                        </button>
                    </td>
                `;
        tbody.appendChild(row);
    });
}

// Show no transactions message
function showNoTransactions() {
    const tbody = document.getElementById('transaction-tbody');
    const noTransactions = document.getElementById('no-transactions');

    tbody.innerHTML = '';
    noTransactions.classList.remove('hidden');
}

// Load financial summary
async function loadSummary() {
    try {
        const response = await fetch(`api/summary`);
        const summary = await response.json();

        document.getElementById('income-display').textContent = `RP.${formatNumber(summary.total_income)},`;
        document.getElementById('expense-display').textContent = `RP.${formatNumber(summary.total_expense)},`;
        document.getElementById('balance-display').textContent = `RP.${formatNumber(summary.balance)},`;


    } catch (error) {
        console.error('Error loading summary:', error);
    }
}

// Update chart with summary data
function updateChart(transactions) {
    const monthIndexMap = {
        Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
        Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
    };

    financialChart.data.datasets.forEach(dataset => dataset.data.fill(0));

    transactions.months.forEach((month, index) => {
        const monthIndex = monthIndexMap[month];
        if (monthIndex !== undefined) {
            financialChart.data.datasets[0].data[monthIndex] = transactions.income[index] || 0;
            financialChart.data.datasets[1].data[monthIndex] = transactions.expense[index] || 0;
        }
    });

    financialChart.update();
}

// Open modal for add/edit
function openModal(mode, transaction = null) {
    const backdrop = document.getElementById('backdrop');
    const title = document.getElementById('modal-title');
    const submitBtn = document.getElementById('submit-btn-text');

    if (mode === 'add') {
        title.textContent = 'Tambah Transaksi Baru';
        submitBtn.textContent = 'Simpan Transaksi';
        document.getElementById('transaction-form').reset();
        document.getElementById('transaction-id').value = '';
        document.getElementById('date').valueAsDate = new Date();
        currentEditId = null;
    } else {
        title.textContent = 'Edit Transaksi';
        submitBtn.textContent = 'Update Transaksi';
        fillFormWithTransaction(transaction);
        currentEditId = transaction.id;
    }

    backdrop.classList.remove("invisible", "opacity-0");
    backdrop.classList.add("visible", "opacity-100");
}

// Close modal
function closeModal() {
    const modal = document.getElementById('backdrop');
    modal.classList.remove("opacity-100");
    modal.classList.add("opacity-0");

    // Tunggu transisi selesai, baru sembunyikan dari interaksi
    setTimeout(() => {
        document.getElementById('transaction-form').reset();
        modal.classList.remove("visible");
        modal.classList.add("invisible");
        currentEditId = null;
    }, 300); // sama dengan duration-300

}

// Fill form with transaction data
function fillFormWithTransaction(transaction) {
    document.getElementById('transaction-id').value = transaction.id;
    document.getElementById('transaction-type').value = transaction.type_id;
    document.getElementById('amount').value = transaction.amount;
    document.getElementById('category').value = transaction.category_id;
    document.getElementById('description').value = transaction.description || '';
    document.getElementById('date').value = transaction.date;
}

// Handle form submit
async function handleFormSubmit(e) {
    e.preventDefault(); //cegah reload halaman

    const formData = {
        type: document.getElementById('transaction-type').value,
        amount: parseInt(document.getElementById('amount').value, 10),
        category: parseInt(document.getElementById('category').value),
        date: document.getElementById('date').value,
        description: document.getElementById('description').value
    };




    try {
        let response;
        if (currentEditId) {
            // Update existing transaction
            response = await fetch(`api/transactions/${currentEditId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
        } else {
            // Create new transaction
            response = await fetch(`api/transactions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
        }

        if (response.ok) {
            closeModal();
            loadTransactions();
            loadTransactionsMonthly();
            loadSummary();
        } else {
            alert('Terjadi kesalahan saat menyimpan transaksi');
        }
    } catch (error) {
        console.error('Error saving transaction:', error);
        alert('Terjadi kesalahan saat menyimpan transaksi');
    }
}

// Edit transaction
async function editTransaction(id) {
    try {
        const response = await fetch(`api/transactions/${id}`);
        const transaction = await response.json();
        openModal('edit', transaction);
    } catch (error) {
        console.error('Error loading transaction:', error);
    }
}

// Delete transaction
function deleteTransaction(id) {
    showConfirmModal('Apakah Anda yakin ingin menghapus transaksi ini?', async () => {
        try {
            const response = await fetch(`api/transactions/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                loadTransactions();
                loadTransactionsMonthly();
                loadSummary();
            } else {
                alert('Terjadi kesalahan saat menghapus transaksi');
            }
        } catch (error) {
            console.error('Error deleting transaction:', error);
            alert('Terjadi kesalahan saat menghapus transaksi');
        }
    });
}

// Delete all transactions
function deleteAllTransactions() {
    fetch(`api/transactions`, { method: 'DELETE' })
        .then(response => {
            if (response.ok) {
                loadTransactions();
                loadTransactionsMonthly();
                loadSummary();
            } else {
                alert('Terjadi kesalahan saat menghapus semua transaksi');
            }
        })
        .catch(error => {
            console.error('Error deleting all transactions:', error);
            alert('Terjadi kesalahan saat menghapus semua transaksi');
        });
}

// Show confirmation modal
function showConfirmModal(message, callback) {
    document.getElementById('confirm-message').textContent = message;
    document.getElementById('confirm-modal').classList.remove('hidden');
    confirmCallback = callback;
}

// Close confirmation modal
function closeConfirmModal() {
    document.getElementById('confirm-modal').classList.add('hidden');
    confirmCallback = null;
}

// Utility functions
function formatNumber(num) {
    return new Intl.NumberFormat('id-ID').format(num);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID');
}