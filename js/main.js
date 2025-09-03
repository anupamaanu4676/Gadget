// Shared utils, nav, auth, cart badge
const STORAGE_KEYS = {
  PRODUCTS: "gs_products",
  CART: "gs_cart",
  USERS: "gs_users",
  CURRENT_USER: "gs_current_user",
  CATEGORIES: "gs_categories",
};

// Seed demo data if absent
function seedDemoData(){
  if(!localStorage.getItem(STORAGE_KEYS.PRODUCTS)){
    const demoProducts = [
      {id:"p1", name:"Wireless Headphones", description:"Noise-cancelling over-ear headphones with 30h battery.", price:4999, category:"Audio", image:"images/products/placeholder.svg", stock:20, rating:4.6},
      {id:"p2", name:"Smartwatch Pro", description:"AMOLED display, GPS, heart-rate, 7-day battery.", price:6999, category:"Wearables", image:"images/products/placeholder.svg", stock:35, rating:4.4},
      {id:"p3", name:"4K Action Cam", description:"Waterproof action camera with 4K60 and stabilization.", price:8999, category:"Cameras", image:"images/products/placeholder.svg", stock:12, rating:4.3},
      {id:"p4", name:"Bluetooth Speaker", description:"Portable speaker with deep bass, 12h playtime.", price:2999, category:"Audio", image:"images/products/placeholder.svg", stock:40, rating:4.5},
      {id:"p5", name:"USB-C GaN Charger 65W", description:"Fast-charge laptops & phones, dual-port.", price:2499, category:"Accessories", image:"images/products/placeholder.svg", stock:60, rating:4.7},
      {id:"p6", name:"Mechanical Keyboard", description:"Hot-swappable, RGB, compact 75% layout.", price:5599, category:"Accessories", image:"images/products/placeholder.svg", stock:25, rating:4.2},
      {id:"p7", name:"Fitness Earbuds", description:"Secure fit, IPX5, 8h battery + case.", price:3499, category:"Audio", image:"images/products/placeholder.svg", stock:50, rating:4.1},
      {id:"p8", name:"Smart Home Plug", description:"WiFi plug with energy monitoring.", price:1299, category:"Smart Home", image:"images/products/placeholder.svg", stock:80, rating:4.0}
    ];
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(demoProducts));
  }
  if(!localStorage.getItem(STORAGE_KEYS.CATEGORIES)){
    const cats = ["Audio","Wearables","Cameras","Accessories","Smart Home"];
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(cats));
  }
  if(!localStorage.getItem(STORAGE_KEYS.USERS)){
    const users = [
      {id:"u1", email:"admin@gadget.store", password:"admin123", fullName:"Admin", role:"admin"},
      {id:"u2", email:"user@gadget.store", password:"user12345", fullName:"John User", role:"user"}
    ];
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }
  if(!localStorage.getItem(STORAGE_KEYS.CART)){
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify([]));
  }
}
seedDemoData();

function $(sel, scope=document){ return scope.querySelector(sel); }
function $all(sel, scope=document){ return [...scope.querySelectorAll(sel)]; }

// Nav interactions
const menuToggle = $("#menuToggle");
const nav = $("#nav");
if(menuToggle && nav){
  menuToggle.addEventListener("click", () => nav.classList.toggle("show"));
}

// Year
const yearEl = $("#year");
if(yearEl){ yearEl.textContent = new Date().getFullYear(); }

// Auth helpers
function getUsers(){ return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || "[]"); }
function setUsers(users){ localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users)); }
function getCurrentUser(){ return JSON.parse(localStorage.getItem(STORAGE_KEYS.CURRENT_USER) || "null"); }
function setCurrentUser(user){ localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user)); }

function logout(){ localStorage.removeItem(STORAGE_KEYS.CURRENT_USER); location.href = "index.html"; }

// Update nav auth link + admin link
(function updateNav(){
  const user = getCurrentUser();
  const authLink = $("#navAuthLink");
  const adminLink = $("#navAdminLink");
  if(authLink){
    if(user){
      authLink.textContent = "Logout";
      authLink.href = "#";
      authLink.addEventListener("click", (e)=>{ e.preventDefault(); logout(); });
    }else{
      authLink.textContent = "Login";
      authLink.href = "login.html";
    }
  }
  if(adminLink){
    adminLink.classList.toggle("hidden", !(user && user.role === "admin"));
  }
})();

// Cart badge
function getCart(){ return JSON.parse(localStorage.getItem(STORAGE_KEYS.CART) || "[]"); }
function setCart(cart){ localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart)); }
function updateCartBadge(){
  const countEl = $("#navCartCount");
  const total = getCart().reduce((sum, item) => sum + item.qty, 0);
  if(countEl) countEl.textContent = total;
}
updateCartBadge();

// Newsletter fake submit
const newsletterForm = $("#newsletterForm");
if(newsletterForm){
  newsletterForm.addEventListener("submit", (e)=>{
    e.preventDefault();
    alert("Thanks for subscribing!");
    newsletterForm.reset();
  });
}

// Home categories & popular products
(function homeInit(){
  const catsWrap = $("#homeCategories");
  const popWrap = $("#popularProducts");
  if(!catsWrap && !popWrap) return;
  const cats = JSON.parse(localStorage.getItem(STORAGE_KEYS.CATEGORIES) || "[]");
  const products = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS) || "[]");
  if(catsWrap){
    catsWrap.innerHTML = cats.map(c => `
      <div class="category-card">
        <h3>${c}</h3>
        <a class="btn btn--ghost" href="products.html?category=${encodeURIComponent(c)}">Shop</a>
      </div>
    `).join("");
  }
  if(popWrap){
    const popular = [...products].sort((a,b)=>b.rating - a.rating).slice(0,4);
    popWrap.innerHTML = popular.map(p => productCardHTML(p)).join("");
    $all(".btn-add", popWrap).forEach(btn => {
      btn.addEventListener("click", () => addToCart(btn.dataset.id));
    });
    $all(".btn-details", popWrap).forEach(btn => {
      btn.addEventListener("click", () => openProductModal(btn.dataset.id));
    });
  }
})();

// Shared product card HTML
function productCardHTML(p){
  return `
  <div class="card product-card">
    <img src="${p.image || 'images/products/placeholder.svg'}" alt="${p.name}" loading="lazy"/>
    <h3>${p.name}</h3>
    <div class="meta">★ ${p.rating?.toFixed?.(1) ?? "4.0"} • ${p.category}</div>
    <div class="price">₹${p.price.toLocaleString()}</div>
    <div class="actions">
      <button class="btn btn--primary btn-add" data-id="${p.id}">Add to Cart</button>
      <button class="btn btn--ghost btn-details" data-id="${p.id}">Details</button>
    </div>
  </div>`;
}

// Cart ops
function addToCart(productId, qty=1){
  const products = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS) || "[]");
  const product = products.find(p => p.id === productId);
  if(!product) return alert("Product not found");
  const cart = getCart();
  const existing = cart.find(i => i.id === productId);
  if(existing){
    existing.qty += qty;
  }else{
    cart.push({id:productId, name:product.name, price:product.price, image:product.image, qty});
  }
  setCart(cart);
  updateCartBadge();
  toast("Added to cart");
}

// Minimal toast
function toast(msg){
  let t = document.createElement("div");
  t.textContent = msg;
  t.style.position = "fixed"; t.style.bottom = "16px"; t.style.right = "16px";
  t.style.background = "black"; t.style.color = "white"; t.style.padding = "10px 14px";
  t.style.borderRadius = "10px"; t.style.opacity = "0.9"; t.style.zIndex = 9999;
  document.body.appendChild(t);
  setTimeout(()=>t.remove(), 1500);
}

// Product details modal (shared)
function openProductModal(productId){
  const modal = document.getElementById("productModal");
  const body = document.getElementById("modalBody");
  if(!modal || !body) return location.href = "products.html";
  const products = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS) || "[]");
  const p = products.find(x => x.id === productId);
  if(!p) return;
  body.innerHTML = `
    <div class="grid" style="grid-template-columns:1fr 1.2fr;gap:16px">
      <img src="${p.image || 'images/products/placeholder.svg'}" alt="${p.name}"/>
      <div>
        <h2>${p.name}</h2>
        <p class="muted">★ ${p.rating?.toFixed?.(1) ?? "4.0"} • ${p.category}</p>
        <p>${p.description || ""}</p>
        <h3>₹${p.price.toLocaleString()}</h3>
        <div style="display:flex;gap:8px;margin-top:8px">
          <button class="btn btn--primary" id="modalAdd">Add to Cart</button>
          <button class="btn btn--ghost" id="modalClose2">Close</button>
        </div>
        <div class="muted" style="margin-top:10px">Stock: ${p.stock ?? 0}</div>
      </div>
    </div>
  `;
  modal.classList.add("show");
  $("#modalAdd").addEventListener("click", ()=> addToCart(p.id));
  $("#modalClose2").addEventListener("click", ()=> modal.classList.remove("show"));
}
const modalClose = document.getElementById("modalClose");
if(modalClose){
  modalClose.addEventListener("click", ()=> document.getElementById("productModal").classList.remove("show"));
}

// Login/Register
const loginForm = document.getElementById("loginForm");
if(loginForm){
  const registerLink = document.getElementById("registerLink");
  registerLink?.addEventListener("click", (e)=>{
    e.preventDefault();
    // Simple register flow
    const email = prompt("Enter email:");
    const password = prompt("Enter password (min 6 chars):");
    if(!email || !password || password.length < 6) return alert("Invalid details");
    const users = getUsers();
    if(users.some(u => u.email === email)) return alert("Email already exists");
    const newUser = {id: "u"+(Date.now()), email, password, fullName: email.split("@")[0], role:"user"};
    users.push(newUser); setUsers(users);
    alert("Registered! You can now log in.");
  });

  loginForm.addEventListener("submit", (e)=>{
    e.preventDefault();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const user = getUsers().find(u => u.email === email && u.password === password);
    if(!user) return alert("Invalid credentials");
    setCurrentUser(user);
    location.href = "index.html";
  });
}