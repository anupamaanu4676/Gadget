// Products page rendering, filtering, pagination
const PAGE_SIZE = 8;

function getProducts(){ return JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS) || "[]"); }
function getCategories(){ return JSON.parse(localStorage.getItem(STORAGE_KEYS.CATEGORIES) || "[]"); }

const grid = document.getElementById("productsGrid");
const pagination = document.getElementById("pagination");

const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const priceMin = document.getElementById("priceMin");
const priceMax = document.getElementById("priceMax");
const sortSelect = document.getElementById("sortSelect");

let state = { page: 1 };

function loadCategories(){
  if(!categoryFilter) return;
  const cats = getCategories();
  categoryFilter.innerHTML = `<option value="all">All Categories</option>` + cats.map(c => `<option value="${c}">${c}</option>`).join("");
  // If deep-link category
  const params = new URLSearchParams(location.search);
  const c = params.get("category");
  if(c){ categoryFilter.value = c; }
}

function applyFilters(list){
  const q = (searchInput?.value || "").toLowerCase();
  const cat = categoryFilter?.value || "all";
  const min = parseFloat(priceMin?.value || "0") || 0;
  const max = parseFloat(priceMax?.value || "0") || 0;
  let filtered = list.filter(p => {
    const matchQ = p.name.toLowerCase().includes(q) || (p.description||"").toLowerCase().includes(q);
    const matchCat = cat === "all" ? true : p.category === cat;
    const matchMin = p.price >= min;
    const matchMax = max ? p.price <= max : true;
    return matchQ && matchCat && matchMin && matchMax;
  });
  switch(sortSelect?.value){
    case "price-asc": filtered.sort((a,b)=>a.price-b.price); break;
    case "price-desc": filtered.sort((a,b)=>b.price-a.price); break;
    case "rating-desc": filtered.sort((a,b)=> (b.rating||0)-(a.rating||0)); break;
  }
  return filtered;
}

function render(){
  if(!grid) return;
  const products = getProducts();
  const filtered = applyFilters(products);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  if(state.page > totalPages) state.page = totalPages;
  const start = (state.page - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(start, start + PAGE_SIZE);
  grid.innerHTML = pageItems.map(p => productCardHTML(p)).join("");
  // bind buttons
  $all(".btn-add", grid).forEach(btn => btn.addEventListener("click", ()=> addToCart(btn.dataset.id)));
  $all(".btn-details", grid).forEach(btn => btn.addEventListener("click", ()=> openProductModal(btn.dataset.id)));

  // pagination
  if(pagination){
    pagination.innerHTML = "";
    for(let i=1;i<=totalPages;i++){
      const b = document.createElement("button");
      b.textContent = i;
      if(i===state.page) b.classList.add("active");
      b.addEventListener("click", ()=>{ state.page=i; render(); window.scrollTo({top:0,behavior:'smooth'}); });
      pagination.appendChild(b);
    }
  }
}

[searchInput, categoryFilter, priceMin, priceMax, sortSelect].forEach(el => {
  if(el) el.addEventListener("input", ()=> { state.page=1; render(); });
});

loadCategories();
render();