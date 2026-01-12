// Supabase Configuration
const SUPABASE_URL = 'https://yjgpvdxxmaslqxqllasi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlqZ3B2ZHh4bWFzbHF4cWxsYXNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgxNTU1MzQsImV4cCI6MjA4MzczMTUzNH0.O8BAim9AICGKJSKsDIzgLBM_dGeQszmakwvR4IAMr44';

// Initialize Supabase client
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Global variables
let allOrders = [];
let currentUser = null;

// ==================== AUTHENTICATION ====================
async function checkAuth() {
    console.log('Checking authentication...');

    try {
        // Check if user is logged in
        const { data: { session }, error } = await supabaseClient.auth.getSession();

        console.log('Session check:', { session, error });

        if (error) {
            console.error('Error getting session:', error);
            showLoginModal();
            return;
        }

        if (!session) {
            console.log('No active session, showing login');
            showLoginModal();
            return;
        }

        // User is authenticated
        currentUser = session.user;
        console.log('User authenticated:', currentUser);

        // Hide login modal and show dashboard
        document.getElementById('loginModal').classList.remove('active');
        document.getElementById('dashboardHeader').style.display = 'block';
        document.getElementById('dashboardMain').style.display = 'block';
        loadOrders();

    } catch (error) {
        console.error('Auth check error:', error);
        showLoginModal();
    }
}

function showLoginModal() {
    document.getElementById('loginModal').classList.add('active');
    document.getElementById('loginError').style.display = 'none';
    // Hide dashboard content
    document.getElementById('dashboardHeader').style.display = 'none';
    document.getElementById('dashboardMain').style.display = 'none';
}

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('username').value; // Changed from username to email
    const password = document.getElementById('password').value;
    const loginBtn = e.target.querySelector('button[type="submit"]');
    const loginError = document.getElementById('loginError');

    // Show loading state
    loginBtn.disabled = true;
    loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
    loginError.style.display = 'none';

    try {
        console.log('Attempting login with email:', email);

        // Sign in with Supabase Auth
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password,
        });

        console.log('Login response:', { data, error });

        if (error) {
            throw error;
        }

        // Login successful
        currentUser = data.user;
        console.log('Login successful!', currentUser);

        // Hide login modal and show dashboard
        document.getElementById('loginModal').classList.remove('active');
        document.getElementById('dashboardHeader').style.display = 'block';
        document.getElementById('dashboardMain').style.display = 'block';
        loadOrders();

    } catch (error) {
        console.error('Login error:', error);
        loginError.querySelector('span').textContent = error.message || 'Invalid email or password';
        loginError.style.display = 'flex';
    } finally {
        // Reset button
        loginBtn.disabled = false;
        loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
    }
});

document.getElementById('logoutBtn').addEventListener('click', async () => {
    console.log('Logging out...');

    try {
        const { error } = await supabaseClient.auth.signOut();

        if (error) {
            console.error('Logout error:', error);
        }

        currentUser = null;
        allOrders = [];
        showLoginModal();

    } catch (error) {
        console.error('Logout error:', error);
    }
});

// ==================== LOAD ORDERS ====================
async function loadOrders() {
    const loadingSpinner = document.getElementById('loadingSpinner');
    const errorMessage = document.getElementById('errorMessage');
    const ordersTableBody = document.getElementById('ordersTableBody');
    const emptyState = document.getElementById('emptyState');

    // Show loading
    loadingSpinner.style.display = 'block';
    errorMessage.style.display = 'none';
    emptyState.style.display = 'none';
    ordersTableBody.innerHTML = '';

    try {
        console.log('Fetching orders from Supabase...');

        // Fetch all orders from Supabase
        const { data, error } = await supabaseClient
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });

        console.log('Supabase response:', { data, error });

        if (error) {
            throw error;
        }

        allOrders = data || [];

        // Hide loading
        loadingSpinner.style.display = 'none';

        if (allOrders.length === 0) {
            emptyState.style.display = 'block';
        } else {
            displayOrders(allOrders);
            updateStats(allOrders);
        }

    } catch (error) {
        console.error('Error loading orders:', error);
        loadingSpinner.style.display = 'none';
        errorMessage.style.display = 'block';
        document.getElementById('errorText').textContent = error.message || 'Error loading orders. Please try again.';
    }
}

// ==================== DISPLAY ORDERS ====================
function displayOrders(orders) {
    const ordersTableBody = document.getElementById('ordersTableBody');
    ordersTableBody.innerHTML = '';

    if (orders.length === 0) {
        document.getElementById('emptyState').style.display = 'block';
        return;
    }

    document.getElementById('emptyState').style.display = 'none';

    orders.forEach((order, index) => {
        const row = document.createElement('tr');

        const createdDate = new Date(order.created_at);
        const formattedDate = createdDate.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
        const formattedTime = createdDate.toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit'
        });

        row.innerHTML = `
            <td>${index + 1}</td>
            <td>
                <div style="font-size: 0.85rem; line-height: 1.3;">${formattedDate}</div>
                <small style="color: var(--gray); font-size: 0.75rem;">${formattedTime}</small>
            </td>
            <td style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${order.name || '-'}">${order.name || '-'}</td>
            <td style="font-size: 0.85rem;">${order.phone || '-'}</td>
            <td style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 0.85rem;" title="${order.email || '-'}">${order.email || '-'}</td>
            <td style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 0.85rem;" title="${order.address || '-'}">
                ${order.address || '-'}
            </td>
            <td style="text-align: center;"><strong>${order.quantity || 0}</strong></td>
            <td>
                <select class="status-select status-${(order.status || 'pending').replace(/\s+/g, '-').toLowerCase()}"
                        onchange="updateOrderStatus(${order.id}, this.value)">
                    <option value="pending" ${(order.status || 'pending') === 'pending' ? 'selected' : ''}>Pending</option>
                    <option value="order placed" ${order.status === 'order placed' ? 'selected' : ''}>Order Placed</option>
                    <option value="order delivered" ${order.status === 'order delivered' ? 'selected' : ''}>Delivered</option>
                </select>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="view-btn" onclick="showOrderDetails(${order.id})" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="delete-btn" onclick="deleteOrder(${order.id})" title="Delete Order">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;

        ordersTableBody.appendChild(row);
    });
}

// ==================== UPDATE STATS ====================
function updateStats(orders) {
    // Total orders
    document.getElementById('totalOrders').textContent = orders.length;

    // Today's orders
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayOrders = orders.filter(order => {
        const orderDate = new Date(order.created_at);
        orderDate.setHours(0, 0, 0, 0);
        return orderDate.getTime() === today.getTime();
    });
    document.getElementById('todayOrders').textContent = todayOrders.length;

    // Total blocks
    const totalBlocks = orders.reduce((sum, order) => sum + (parseInt(order.quantity) || 0), 0);
    document.getElementById('totalBlocks').textContent = totalBlocks.toLocaleString('en-IN');
}

// ==================== SEARCH FUNCTIONALITY ====================
document.getElementById('searchInput').addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();

    const filteredOrders = allOrders.filter(order => {
        return (
            (order.name || '').toLowerCase().includes(searchTerm) ||
            (order.phone || '').toLowerCase().includes(searchTerm) ||
            (order.email || '').toLowerCase().includes(searchTerm)
        );
    });

    displayOrders(filteredOrders);
});

// ==================== SHOW ORDER DETAILS ====================
function showOrderDetails(orderId) {
    const order = allOrders.find(o => o.id === orderId);

    if (!order) {
        return;
    }

    const createdDate = new Date(order.created_at);
    const formattedDateTime = createdDate.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
        <div class="order-detail-item">
            <label>Order ID</label>
            <p>#${order.id}</p>
        </div>

        <div class="order-detail-item">
            <label>Order Date & Time</label>
            <p>${formattedDateTime}</p>
        </div>

        <div class="order-detail-item">
            <label>Customer Name</label>
            <p>${order.name || '-'}</p>
        </div>

        <div class="order-detail-item">
            <label>Phone Number</label>
            <p><a href="tel:${order.phone}" style="color: var(--primary);">${order.phone || '-'}</a></p>
        </div>

        <div class="order-detail-item">
            <label>Email Address</label>
            <p><a href="mailto:${order.email}" style="color: var(--primary);">${order.email || '-'}</a></p>
        </div>

        <div class="order-detail-item">
            <label>Delivery Address</label>
            <p style="white-space: pre-wrap;">${order.address || '-'}</p>
        </div>

        <div class="order-detail-item">
            <label>Quantity (Blocks)</label>
            <p><strong style="font-size: 1.3rem; color: var(--primary);">${order.quantity || 0}</strong></p>
        </div>
    `;

    document.getElementById('orderModal').classList.add('active');
}

// Close modal
document.getElementById('modalClose').addEventListener('click', () => {
    document.getElementById('orderModal').classList.remove('active');
});

document.getElementById('orderModal').addEventListener('click', (e) => {
    if (e.target.id === 'orderModal') {
        document.getElementById('orderModal').classList.remove('active');
    }
});

// ==================== UPDATE ORDER STATUS ====================
async function updateOrderStatus(orderId, newStatus) {
    try {
        console.log('Updating order status:', { orderId, newStatus });

        const { data, error } = await supabaseClient
            .from('orders')
            .update({ status: newStatus })
            .eq('id', orderId)
            .select();

        if (error) {
            console.error('Supabase update error:', error);
            throw error;
        }

        console.log('Status updated successfully:', data);

        // Update local orders array
        const orderIndex = allOrders.findIndex(o => o.id === orderId);
        if (orderIndex !== -1) {
            allOrders[orderIndex].status = newStatus;
        }

        // Refresh the display to show updated colors
        displayOrders(allOrders);

    } catch (error) {
        console.error('Error updating status:', error);
        alert('Error updating status: ' + error.message);
        // Reload orders to revert the dropdown
        loadOrders();
    }
}

// ==================== DELETE ORDER ====================
async function deleteOrder(orderId) {
    if (!confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
        return;
    }

    try {
        console.log('Deleting order:', orderId);

        const { error } = await supabaseClient
            .from('orders')
            .delete()
            .eq('id', orderId);

        if (error) {
            throw error;
        }

        console.log('Order deleted successfully');

        // Remove from local array and refresh display
        allOrders = allOrders.filter(o => o.id !== orderId);
        displayOrders(allOrders);
        updateStats(allOrders);

    } catch (error) {
        console.error('Error deleting order:', error);
        alert('Error deleting order: ' + error.message);
    }
}

// ==================== REFRESH ====================
document.getElementById('refreshBtn').addEventListener('click', () => {
    loadOrders();
});

// ==================== INITIALIZE ====================
window.addEventListener('DOMContentLoaded', () => {
    checkAuth();
});
