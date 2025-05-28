
// Global variables

const { act } = require("react");

let financialChart;
let currentEditId = null;
let confirmCallback = null;
let currentType = 'income';

// Initialize app
document.addEventListener('DOMContentLoaded', function () {
    setupEventListeners();
    initializeChart();
    loadTransactions();
    loadTransactionsMonthly()
    loadSummary();
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



// Initialize chart
function initializeChart(data) {
    const ctx = document.getElementById('financialChart').getContext('2d');

    financialChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'],
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
        actionMenuHandler();
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
                <tr
                    class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600">
                    <td class="px-6 py-4">
                        ${formatDate(transaction.date)}
                    </td>
                    <td class="px-6 py-4">
                        ${typeClass}">${typeText}
                    </td>
                    <td class="px-6 py-4">
                        ${transaction.category_name}
                    </td>
                    <td class="px-6 py-4">
                        ${transaction.description || '-'}
                    </td>
                    <td class="px-6 py-4">
                        Rp ${formatNumber(transaction.amount)}
                    </td>
                    <td class="px-6 py-4">
                        <div class="relative inline-flex">
                            <button type="button" aria-expanded="false" aria-haspopup="false" id="ibnu"
                                class="actions-menu-button px-3 py-1.5 text-sm rounded-lg font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-gray-900 focus:relative dark:text-gray-200 dark:hover:bg-gray-500 dark:hover:text-white"
                                aria-label="Actions">
                                <i class="fa-solid fa-ellipsis"></i>
                            </button>
                            <div role="menu"
                                class="actions-menu hidden absolute right-10 z-100 w-26  overflow-hidden rounded border border-gray-300 bg-white shadow-sm dark:border-gray-600 dark:bg-gray-800">
                                <p
                                    class="block px-3 py-2 text-sm text-gray-500 dark:text-gray-400 divide-x border-b border-gray-600">
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

function actionMenuHandler() {
    const menuButtons = document.querySelectorAll(".actions-menu-button"); // Ambil setiap tombol menu
    const menuItems = document.querySelectorAll(".actions-menu"); // Ambil setiap item menu


    console.log("Menu buttons:", menuButtons);
    menuButtons.forEach((menuButton) => {
        menuButton.addEventListener("click", function (event) {
            event.stopPropagation();
            const menu = menuButton.nextElementSibling;
            const isOpen = !menu.classList.contains("hidden");

            // Tutup semua de
            menuItems.forEach((item) => {
                item.classList.add("hidden");
                item.previousElementSibling.setAttribute("aria-expanded", "false");
            });

            // Buka menu yang diklik
            if (!isOpen) {
                menu.classList.remove("hidden");
                menu.classList.add("block");
                menuButton.setAttribute("aria-expanded", "true");
            }
        });
    });

    document.addEventListener("click", function (event) {
        let clickedInsideAnyMenu = false;

        menuButtons.forEach((btn) => {
            const menu = btn.nextElementSibling;
            if (btn.contains(event.target) || menu.contains(event.target)) {
                clickedInsideAnyMenu = true;
            }
        });

        if (!clickedInsideAnyMenu) {
            menuItems.forEach((menu) => {
                menu.classList.add("hidden");
                menu.classList.remove("block");
                menu.previousElementSibling.setAttribute("aria-expanded", "false");
            });
        }
    });

    menuItems.forEach((menu) => {
        const actionList = menu.querySelectorAll("button");

        actionList.forEach((btn) => {
            const action = btn.dataset.action;

            if (action === "edit") {
                btn.addEventListener("click", function () {
                    hideMenuAction();

                });
            } else if (action === "delete") {
                btn.addEventListener("click", function () {
                    hideMenuAction();
                });
            }
        });
    });
}

function hideMenuAction() {
    menuItems.forEach((menu) => {
        menu.classList.add("hidden");
        menu.classList.remove("block");
        menu.previousElementSibling.setAttribute("aria-expanded", "false");
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