
// Global variables
let financialChart;
let currentEditId = null;
let confirmCallback = null;
let currentType = 'income';

// Initialize app
document.addEventListener('DOMContentLoaded', async function () {
    setupEventListeners();
    initializeChart();
    await loadTransactions();
    await loadTransactionsMonthly()
    await loadSummary();
    updateCategories(currentType)

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

    document.querySelectorAll('.transaction-type-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const type = this.dataset.type;
            // Skip jika type sama dengan yang aktif
            if (type === currentType) return;

            // Update UI
            document.querySelectorAll('.transaction-type-btn').forEach(b => {
                b.dataset.active = (b === this).toString();
            });

            // Update state dan kategori
            currentType = type;
            updateCategories(type);
        });
    });


    // Close modals when clicking outside
    document.getElementById('backdrop').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) closeModal();
    });

    document.getElementById('confirm-modal').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) closeConfirmModal();
    });
}

function setupDynamicEventListeners() {
    document.addEventListener("click", function (event) {
        const isMenuButton = event.target.closest(".actions-menu-button");
        if (isMenuButton) {
            const menu = isMenuButton.nextElementSibling;
            const isOpen = !menu.classList.contains("hidden");

            document.querySelectorAll(".actions-menu").forEach((item) => {
                item.classList.add("hidden");
                item.previousElementSibling.setAttribute("aria-expanded", "false");
            });

            if (!isOpen) {
                menu.classList.remove("hidden");
                menu.classList.add("block");
                isMenuButton.setAttribute("aria-expanded", "true");
            }

            return; // penting: hentikan jika klik berasal dari tombol
        }

        // Klik di luar menu mana pun
        document.querySelectorAll(".actions-menu").forEach((menu) => {
            menu.classList.add("hidden");
            menu.classList.remove("block");
            menu.previousElementSibling.setAttribute("aria-expanded", "false");
        });
    });
}


// Initialize chart
function initializeChart() {
    const ctx = document.getElementById('financialChart').getContext('2d');

    // Create gradient for Pendapatan
    const pendapatanGradient = ctx.createLinearGradient(0, 0, 0, 400);
    pendapatanGradient.addColorStop(0, 'rgba(6, 182, 212, 0.8)');
    pendapatanGradient.addColorStop(1, 'rgba(6, 182, 212, 0)');

    // Create gradient for Pengeluaran
    const pengeluaranGradient = ctx.createLinearGradient(0, 0, 0, 400);
    pengeluaranGradient.addColorStop(0, 'rgba(255, 160, 180, 0.8)');
    pengeluaranGradient.addColorStop(1, 'rgba(255, 160, 180, 0)');

    financialChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'],
            datasets: [
                {
                    label: 'Pendapatan',
                    data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    backgroundColor: pendapatanGradient,
                    borderColor: '#06b6d4',
                    borderWidth: 2,
                    tension: 0.2,
                    fill: true,
                    pointBackgroundColor: '#fff',
                    pointBorderColor: '#06b6d4',
                    pointRadius: 4,
                    pointHoverRadius: 6
                },
                {
                    label: 'Pengeluaran',
                    data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    backgroundColor: pengeluaranGradient,
                    borderColor: '#ff6888',
                    borderWidth: 2,
                    tension: 0.2,
                    fill: true,
                    pointBackgroundColor: '#fff',
                    pointBorderColor: '#ff6888',
                    pointRadius: 4,
                    pointHoverRadius: 6
                },
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        color: 'white',
                        font: {
                            size: 14,
                            family: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif"
                        },
                        padding: 20,
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    titleFont: {
                        size: 16,
                        weight: 'bold'
                    },
                    bodyFont: {
                        size: 14
                    },
                    padding: 12,
                    usePointStyle: true,
                    callbacks: {
                        labelColor: function (context) {
                            return {
                                borderColor: context.dataset.borderColor,
                                backgroundColor: context.dataset.borderColor,
                                borderRadius: 2
                            };
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)',
                        drawBorder: false
                    },
                    ticks: {
                        color: 'white',
                        font: {
                            size: 12
                        },
                        padding: 10
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)',
                        drawBorder: false
                    },
                    ticks: {
                        color: 'white',
                        font: {
                            size: 12
                        },
                        padding: 10
                    }
                }
            },
            elements: {
                line: {
                    tension: 0.3
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
        setupDynamicEventListeners();
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
        row.className = 'border-b text-gray-200 border-gray-500 hover:bg-[#7f72ab]';

        const typeClass = transaction.type_id === 'income' ? 'bg-green-900 text-green-300' : 'dark:bg-red-900 dark:text-red-300';
        const typeText = transaction.type_id === 'income' ? 'Masuk' : 'Keluar';

        row.innerHTML = `
                <tr
                    class="border-b ">
                    <td class="px-4 py-2 text-center">
                        ${formatDate(transaction.date)}
                    </td>
                    <td class="px-4 py-2 text-center "> 
                        <span class="text-xs font-medium me-2 px-2.5 py-0.5 rounded-sm  ${typeClass}">
                            ${typeText}
                        </span>
                    </td>
                    <td class="px-4 py-2">
                        ${transaction.category_name}
                    </td>
                    <td class="px-4 py-2">
                        ${transaction.description || '-'}
                    </td>
                    <td class="px-4 py-2 text-center">
                        Rp ${formatNumber(transaction.amount)}
                    </td>
                    <td class="px-4 py-2 text-center">
                        <div class="relative inline-flex">
                            <button type="button" aria-expanded="false" aria-haspopup="false" id="ibnu"
                                class="actions-menu-button px-3 py-1.5 text-sm rounded-lg font-medium transition-colors hover:bg-[#635985] "
                                aria-label="Actions">
                                <i class="fa-solid fa-ellipsis"></i>
                            </button>
                            <div role="menu"
                                class="actions-menu hidden absolute right-10 z-100 w-26  overflow-hidden rounded border shadow-sm border-gray-400 bg-[#3d3652]">
                                <p
                                    class="block px-3 py-2 text-sm text-gray-200 divide-x border-b border-gray-400">
                                    Actions</p>
                                <button type="button" data-action="edit" onclick="editTransaction('${transaction.id}')"
                                    class="inline-flex items-center justify-between w-full px-3 py-2 text-left text-sm font-medium text-blue-700 transition-colors hover:bg-blue-50 dark:text-blue-600 dark:hover:bg-blue-700/20">
                                    Edit
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                                        stroke="currentColor" class="size-4">
                                        <path stroke-linecap="round" stroke-linejoin="round"
                                            d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                                    </svg>
                                </button>
                                <button type="button" data-action="delete" onclick="deleteTransaction('${transaction.id}')" 
                                    class="inline-flex items-center justify-between w-full px-3 py-2 text-left text-sm font-medium text-red-700 transition-colors hover:bg-red-50 dark:text-red-600 dark:hover:bg-red-700/20">
                                    Delete
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                                        stroke="currentColor" class="size-4">
                                        <path stroke-linecap="round" stroke-linejoin="round"
                                            d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </td>
                </tr>
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

        document.getElementById('income-display').textContent = `RP.${formatNumber(summary.total_income)}`;
        document.getElementById('expense-display').textContent = `RP.${formatNumber(summary.total_expense)}`;
        document.getElementById('balance-display').textContent = `RP.${formatNumber(summary.balance)}`;


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

    // pastikan semua modal tersembunyi dengan class hidden
    document.querySelectorAll(".modal").forEach((modal) => {
        modal.classList.add("hidden");
    });

    if (mode === 'add') {
        updateCategories("income");
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

    // Tampilkan modal yang sesuai
    document
        .querySelector(`.modal[data-modal="transaction-modal"]`)
        .classList.remove("hidden");

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
    document.getElementById('amount').value = parseInt(transaction.amount, 10) || '';
    document.getElementById('category').value = transaction.category_id || '';
    document.getElementById('description').value = transaction.description || '';
    document.getElementById('date').value = transaction.date;

    document.querySelectorAll('.transaction-type-btn').forEach(b => b.setAttribute('data-active', 'false'));
    document.querySelector(`[data-type="${transaction.type_id}"]`).setAttribute('data-active', 'true');

    // Update state dan kategori
    currentType = transaction.type_id;
    updateCategories(transaction.type_id, transaction.category_id);
}

// Handle form submit
async function handleFormSubmit(e) {
    e.preventDefault(); //cegah reload halaman

    const formData = {
        type: currentType,
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
            setupDynamicEventListeners()
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
                setupDynamicEventListeners()
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

function updateCategories(type, selectedCategoryId = null) {
    const categorySelect = document.getElementById('category');

    // Reset dropdown
    categorySelect.innerHTML = '<option value="">Loading...</option>';
    categorySelect.disabled = true;

    // Fetch kategori berdasarkan type
    fetch(`/api/categories/${type}`)
        .then(response => response.json())
        .then(categories => {
            categorySelect.innerHTML = selectedCategoryId ?
                `<option value="${selectedCategoryId}" selected>${categories.find(item => item.category_id === selectedCategoryId).name}</option>` :
                '<option value="">Pilih Kategori</option>';
            categories.forEach(cat => {
                const option = document.createElement('option');
                option.value = cat.category_id;
                option.textContent = cat.name;
                categorySelect.appendChild(option);
            });
            categorySelect.disabled = false;
        })
        .catch(error => {
            categorySelect.innerHTML = '<option value="">Gagal memuat kategori</option>';
            console.error('Error:', error);
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