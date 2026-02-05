let reservations = JSON.parse(localStorage.getItem('myReservations')) || [];
let currentUser = null;

function toggleItems() {
    const type = document.getElementById('resType').value;
    document.getElementById('venue-select').style.display = (type === 'Venue') ? 'block' : 'none';
    document.getElementById('equipment-select').style.display = (type === 'Equipment') ? 'block' : 'none';
}

function login() {
    const user = document.getElementById('username').value;
    const role = document.getElementById('role').value;
    if (!user) return alert("Please enter your name!");

    currentUser = { name: user, role: role };
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('main-app').style.display = 'flex';
    document.getElementById('displayName').innerText = user;
    document.getElementById('displayRole').innerText = role === 'admin' ? "🛠 ADMIN" : "👤 USER";

    if (role === 'admin') {
        document.getElementById('admin-nav').style.display = 'block';
        document.getElementById('user-nav').style.display = 'none';
        showPage('admin-manage');
    } else {
        document.getElementById('admin-nav').style.display = 'none';
        document.getElementById('user-nav').style.display = 'block';
        showPage('user-reserve');
    }
}

function showPage(id) {
    document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
    document.getElementById(id).style.display = 'block';
    if(id === 'admin-manage') updateAdminTable();
}

function submitRequest() {
    const title = document.getElementById('eventTitle').value;
    const type = document.getElementById('resType').value;
    const date = document.getElementById('eventDate').value;
    const item = (type === 'Venue') ? document.getElementById('venue').value : document.getElementById('equipment').value;

    if (!title || !date) return alert("Fill up all fields!");

    const isConflict = reservations.some(r => r.item === item && r.date === date.replace('T', ' ') && r.status !== 'Rejected' && r.status !== 'Completed');
    if (isConflict) return alert(`This ${type} is already reserved for this schedule!`);

    reservations.push({
        id: Date.now(),
        user: currentUser.name,
        type: type,
        item: item,
        date: date.replace('T', ' '),
        status: 'Pending'
    });

    saveData();
    alert("Request Sent to Admin!");
    document.getElementById('eventTitle').value = "";
}

function updateAdminTable() {
    const activeBody = document.getElementById('adminTableBody');
    const historyBody = document.getElementById('historyTableBody');

    const activeRequests = reservations.filter(r => r.status !== 'Completed' && r.status !== 'Rejected');
    const historyRequests = reservations.filter(r => r.status === 'Completed' || r.status === 'Rejected');

    activeBody.innerHTML = activeRequests.length === 0 ? "<tr><td colspan='5'>No active requests.</td></tr>" : 
    activeRequests.map(r => {
        let buttons = "";
        if (r.status === 'Pending') {
            buttons = `<button class="btn-app" onclick="updateStatus(${r.id}, 'Approved')">Approve</button>
                       <button class="btn-rej" onclick="updateStatus(${r.id}, 'Rejected')">Reject</button>`;
        } else if (r.status === 'Approved') {
            buttons = `<button class="btn-start" onclick="updateStatus(${r.id}, 'In-Use')">Start Use</button>`;
        } else if (r.status === 'In-Use') {
            buttons = `<button class="btn-fin" onclick="updateStatus(${r.id}, 'Completed')">Finish & Uli</button>`;
        }

        return `<tr>
            <td>${r.user}</td>
            <td><b>${r.item}</b><br><small>${r.type}</small></td>
            <td>${r.date}</td>
            <td><span class="badge ${r.status.toLowerCase()}">${r.status}</span></td>
            <td>${buttons}</td>
        </tr>`;
    }).join('');

    historyBody.innerHTML = historyRequests.map(r => `
        <tr>
            <td>${r.user}</td>
            <td>${r.item}</td>
            <td><span class="badge ${r.status.toLowerCase()}">${r.status}</span></td>
            <td><button class="btn-print" onclick="printReceipt(${r.id})">Print</button></td>
        </tr>
    `).join('');
}

function updateStatus(id, newStatus) {
    const res = reservations.find(r => r.id === id);
    if(res) {
        res.status = newStatus;
        saveData();
        updateAdminTable();
    }
}

function printReceipt(id) {
    const res = reservations.find(r => r.id === id);
    const win = window.open('', '', 'width=600,height=400');
    win.document.write(`<h1>Reservation Receipt</h1><hr><p>User: ${res.user}</p><p>Item: ${res.item}</p><p>Status: ${res.status}</p><button onclick="window.print()">Print Receipt</button>`);
    win.document.close();
}

function saveData() {
    localStorage.setItem('myReservations', JSON.stringify(reservations));
}

function clearHistory() {
    if(confirm("Clear all history?")) {
        reservations = reservations.filter(r => r.status !== 'Completed' && r.status !== 'Rejected');
        saveData();
        updateAdminTable();
    }
}

function logout() { location.reload(); }