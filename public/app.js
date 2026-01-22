const API = "http://localhost:3000/api/invoices";

let items = [];
let editingId = null;

// ADD ITEM
function addItem() {
  const desc = document.getElementById("desc").value.trim();
  const qty = Number(document.getElementById("qty").value);
  const price = Number(document.getElementById("price").value);

  if (!desc || qty <= 0 || price <= 0) {
    alert("Fill all item fields correctly");
    return;
  }

  items.push({ description: desc, qty, price });
  renderItems();

  document.getElementById("desc").value = "";
  document.getElementById("qty").value = "";
  document.getElementById("price").value = "";
}

// RENDER EDITABLE ITEMS
function renderItems() {
  const tbody = document.getElementById("items");
  tbody.innerHTML = items.map((item, i) => `
    <tr>
      <td>
        <input value="${item.description}"
          onchange="updateItem(${i}, 'description', this.value)" />
      </td>
      <td>
        <input type="number" min="1" value="${item.qty}"
          onchange="updateItem(${i}, 'qty', this.value)" />
      </td>
      <td>
        <input type="number" min="0.01" step="0.01" value="${item.price}"
          onchange="updateItem(${i}, 'price', this.value)" />
      </td>
      <td>
        <button onclick="removeItem(${i})">❌</button>
      </td>
    </tr>
  `).join("");
}

function updateItem(index, field, value) {
  if (field === "qty" || field === "price") {
    value = Number(value);
    if (value <= 0) return;
  }
  items[index][field] = value;
}

function removeItem(i) {
  items.splice(i, 1);
  renderItems();
}

// SAVE / EDIT
async function saveInvoice() {
  const customer = document.getElementById("customer").value.trim();

  if (!customer) {
    alert("Customer name is required");
    return;
  }

  if (items.length === 0) {
    alert("Add at least one item");
    return;
  }

  for (const i of items) {
    if (!i.description || i.qty <= 0 || i.price <= 0) {
      alert("Invalid item detected");
      return;
    }
  }

  const total = items.reduce((s, i) => s + i.qty * i.price, 0);

  const payload = { customerName: customer, items, total };
  const url = editingId ? `${API}/${editingId}` : API;
  const method = editingId ? "PUT" : "POST";

  await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  resetForm();
  loadInvoices();
}

function cancelEdit() {
  resetForm();
}

function resetForm() {
  editingId = null;
  items = [];
  document.getElementById("customer").value = "";
  renderItems();
}

// LIST
async function loadInvoices() {
  const data = await fetch(API).then(r => r.json());
  invoiceList.innerHTML = data.map(i =>
    `<li>
      ${i.customerName} - ${i.total}
      <button onclick="editInvoice('${i._id}')">Edit</button>
      <button onclick="viewInvoice('${i._id}')">View</button>
      <button onclick="deleteInvoice('${i._id}')">Delete</button>
    </li>`
  ).join("");
}

async function editInvoice(id) {
  const inv = await fetch(`${API}/${id}`).then(r => r.json());
  editingId = id;
  document.getElementById("customer").value = inv.customerName;
  items = inv.items;
  renderItems();
}

// VIEW / PRINT
async function viewInvoice(id) {
  const inv = await fetch(`${API}/${id}`).then(r => r.json());
  printArea.innerHTML = `
    <center><h3>Cash Invoice</h3>
    <p>${inv.customerName}</p>
    ${inv.items.map(i =>
      `<div>${i.description} ${i.qty} x ${i.price}</div>`
    ).join("")}
    <h3>Total: ${inv.total}</h3>
    <button onclick="printInvoice()">Print</button>

  
    <h3>Received Cash Payment by:</h3>
    <h3>Signed: _____________________________________</h3>
    <h3>Margarito V. Balatero Jr.</h3>
    </center>
  `;
  printArea.style.display = "block";
}

function printInvoice() {
  const w = window.open();
  w.document.write(printArea.innerHTML);
  w.print();
  w.close();
}

// DELETE
async function deleteInvoice(id) {
  await fetch(`${API}/${id}`, { method: "DELETE" });
  loadInvoices();
}

loadInvoices();
