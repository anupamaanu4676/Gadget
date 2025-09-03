// Admin CRUD — requires admin login
function requireAdmin(){
  const user = getCurrentUser();
  if(!(user && user.role === "admin")){
    alert("Admin access only");
    location.href = "login.html";
  }
}
requireAdmin();

function getProducts(){ return JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS) || "[]"); }
function setProducts(list){ localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(list)); }

const productForm = document.getElementById("productForm");
const adminProducts = document.getElementById("adminProducts");

function renderAdminTable(){
  const list = getProducts();
  if(list.length === 0){ adminProducts.innerHTML = "<p>No products yet.</p>"; return; }
  adminProducts.innerHTML = `
    <table>
      <thead>
        <tr><th>Image</th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Rating</th><th>Actions</th></tr>
      </thead>
      <tbody>
        ${list.map(p => `
          <tr>
            <td><img src="${p.image}" alt="${p.name}" style="width:60px;height:40px;object-fit:cover;border:1px solid #eee;border-radius:8px"/></td>
            <td>${p.name}</td>
            <td>${p.category}</td>
            <td>₹${p.price.toLocaleString()}</td>
            <td>${p.stock ?? 0}</td>
            <td>${(p.rating ?? 4).toFixed(1)}</td>
            <td class="actions">
              <button class="btn btn--ghost" data-id="${p.id}" data-action="edit">Edit</button>
              <button class="btn btn--accent" data-id="${p.id}" data-action="delete">Delete</button>
            </td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;

  adminProducts.querySelectorAll("button").forEach(btn => {
    const id = btn.dataset.id;
    const action = btn.dataset.action;
    btn.addEventListener("click", ()=>{
      if(action === "edit") loadForm(id);
      if(action === "delete") removeProduct(id);
    });
  });
}

function loadForm(id){
  const p = getProducts().find(x => x.id === id);
  if(!p) return;
  document.getElementById("productId").value = p.id;
  document.getElementById("productName").value = p.name;
  document.getElementById("productPrice").value = p.price;
  document.getElementById("productCategory").value = p.category;
  document.getElementById("productStock").value = p.stock ?? 0;
  document.getElementById("productImage").value = p.image;
  document.getElementById("productDescription").value = p.description || "";
  window.scrollTo({top:0, behavior:"smooth"});
}

function removeProduct(id){
  if(!confirm("Delete this product?")) return;
  setProducts(getProducts().filter(p => p.id !== id));
  renderAdminTable();
}

productForm?.addEventListener("submit", e => {
  e.preventDefault();
  const id = (document.getElementById("productId").value || "").trim();
  const p = {
    id: id || ("p"+Date.now()),
    name: document.getElementById("productName").value.trim(),
    price: parseFloat(document.getElementById("productPrice").value || "0"),
    category: document.getElementById("productCategory").value.trim(),
    stock: parseInt(document.getElementById("productStock").value || "0", 10),
    image: (document.getElementById("productImage").value || "images/products/placeholder.svg").trim(),
    description: document.getElementById("productDescription").value.trim(),
    rating: 4.0
  };
  if(!p.name || !p.category){ return alert("Name and Category are required"); }
  const list = getProducts();
  const idx = list.findIndex(x => x.id === p.id);
  if(idx >= 0) list[idx] = p; else list.unshift(p);
  setProducts(list);
  productForm.reset();
  document.getElementById("productId").value = "";
  renderAdminTable();
  toast("Saved");
});

document.getElementById("resetForm")?.addEventListener("click", ()=>{
  document.getElementById("productId").value = "";
});

renderAdminTable();