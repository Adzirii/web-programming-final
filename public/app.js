const API_URL = '/api/orders';
let allOrders = [];
let currentSort = { column: null, asc: true };

document.addEventListener('DOMContentLoaded', () => {
    fetchOrders();

    const orderForm = document.getElementById('orderForm');
    const cancelEditBtn = document.getElementById('cancelEditBtn');
    const searchInput = document.getElementById('searchInput');

    orderForm.addEventListener('submit', handleFormSubmit);
    cancelEditBtn.addEventListener('click', resetForm);

    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = allOrders.filter(o =>
            o.customerName.toLowerCase().includes(term) ||
            o.pizzaType.toLowerCase().includes(term)
        );
        renderOrders(filtered);
    });
});

async function fetchOrders() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Failed to fetch orders');
        allOrders = await response.json();
        updateStats();
        renderOrders(allOrders);
    } catch (error) {
        showAlert(error.message, 'danger');
    }
}

function updateStats() {
    document.getElementById('statTotalOrders').textContent = allOrders.length;
    document.getElementById('statTotalPizzas').textContent = allOrders.reduce((sum, o) => sum + parseInt(o.quantity, 10), 0);
    document.getElementById('statPending').textContent = allOrders.filter(o => o.status === 'Pending').length;
}

function renderOrders(orders) {
    const tbody = document.getElementById('ordersTableBody');
    tbody.innerHTML = '';

    if (orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center py-4 text-muted">No active orders found.</td></tr>';
        return;
    }

    orders.forEach(order => {
        const tr = document.createElement('tr');

        let statusClass = 'badge-pending';
        switch (order.status) {
            case 'Preparing': statusClass = 'badge-preparing'; break;
            case 'Baked': statusClass = 'badge-baked'; break;
            case 'Delivered': statusClass = 'badge-delivered'; break;
            case 'Cancelled': statusClass = 'badge-cancelled'; break;
        }

        tr.innerHTML = `
            <td><small class="text-muted">...${order.id.slice(-4)}</small></td>
            <td>${escapeHtml(order.customerName)}</td>
            <td>${escapeHtml(order.pizzaType)}</td>
            <td>${escapeHtml(order.size)}</td>
            <td>${order.quantity}</td>
            <td><span class="badge ${statusClass}">${order.status}</span></td>
            <td class="action-btns">
                <button class="btn btn-sm btn-outline-primary me-1" onclick="editOrder('${order.id}')">Edit</button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteOrder('${order.id}')">Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function sortOrders(column) {
    if (currentSort.column === column) {
        currentSort.asc = !currentSort.asc;
    } else {
        currentSort.column = column;
        currentSort.asc = true;
    }

    const searchInput = document.getElementById('searchInput');
    const term = searchInput ? searchInput.value.toLowerCase() : '';

    let filtered = allOrders;
    if (term) {
        filtered = allOrders.filter(o =>
            o.customerName.toLowerCase().includes(term) ||
            o.pizzaType.toLowerCase().includes(term)
        );
    }

    filtered.sort((a, b) => {
        let valA = a[column];
        let valB = b[column];

        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();

        if (valA < valB) return currentSort.asc ? -1 : 1;
        if (valA > valB) return currentSort.asc ? 1 : -1;
        return 0;
    });

    renderOrders(filtered);
}

async function handleFormSubmit(e) {
    e.preventDefault();
    const form = e.target;
    
    if (!form.checkValidity()) {
        e.stopPropagation();
        form.classList.add('was-validated');
        return;
    }

    const orderId = document.getElementById('orderId').value;
    const orderData = {
        customerName: document.getElementById('customerName').value.trim(),
        pizzaType: document.getElementById('pizzaType').value,
        size: document.getElementById('size').value,
        quantity: parseInt(document.getElementById('quantity').value, 10),
        status: document.getElementById('status').value || 'Pending'
    };

    try {
        let response;
        if (orderId) {
            response = await fetch(`${API_URL}/${orderId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });
        } else {
            response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });
        }

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Server error');
        }

        showAlert(orderId ? 'Order updated successfully!' : 'Order placed successfully!', 'success');
        resetForm();
        fetchOrders();
    } catch (error) {
        showAlert(error.message, 'danger');
    }
}

async function editOrder(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`);
        if (!response.ok) throw new Error('Order not found');
        const order = await response.json();

        document.getElementById('orderId').value = order.id;
        document.getElementById('customerName').value = order.customerName;
        document.getElementById('pizzaType').value = order.pizzaType;
        document.getElementById('size').value = order.size;
        document.getElementById('quantity').value = order.quantity;

        const statusGroup = document.getElementById('statusGroup');
        statusGroup.classList.remove('d-none');
        document.getElementById('status').value = order.status;

        document.getElementById('formTitle').textContent = 'Edit Order';
        document.getElementById('submitBtn').textContent = 'Update Order';
        document.getElementById('submitBtn').classList.replace('btn-primary', 'btn-success');
        document.getElementById('cancelEditBtn').classList.remove('d-none');

        window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
        showAlert(error.message, 'danger');
    }
}

async function deleteOrder(id) {
    if (!confirm('Are you sure you want to delete this order?')) return;

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Failed to delete order');

        showAlert('Order deleted successfully!', 'success');
        fetchOrders();
    } catch (error) {
        showAlert(error.message, 'danger');
    }
}

function resetForm() {
    const form = document.getElementById('orderForm');
    form.reset();
    form.classList.remove('was-validated');

    document.getElementById('orderId').value = '';
    document.getElementById('statusGroup').classList.add('d-none');

    document.getElementById('formTitle').textContent = 'Place New Order';
    document.getElementById('submitBtn').textContent = 'Submit Order';
    document.getElementById('submitBtn').classList.replace('btn-success', 'btn-primary');
    document.getElementById('cancelEditBtn').classList.add('d-none');
}

function showAlert(message, type) {
    const alertPlaceholder = document.getElementById('alertPlaceholder');
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
        <div class="alert alert-${type} alert-dismissible" role="alert">
            ${escapeHtml(message)}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;
    alertPlaceholder.append(wrapper);

    setTimeout(() => {
        wrapper.remove();
    }, 4000);
}

function escapeHtml(unsafe) {
    return (unsafe || '').toString()
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}