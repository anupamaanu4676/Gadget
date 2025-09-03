// Cart page logic
const cartContainer = document.getElementById("cartContainer");
function renderCart(){
  const cart = getCart();
  if(cart.length === 0){
    cartContainer.innerHTML = `<div class="card"><p>Your cart is empty.</p><a class="btn btn--primary" href="products.html">Continue Shopping</a></div>`;
    return;
  }
  let subtotal = cart.reduce((s,i)=> s + i.price * i.qty, 0);
  cartContainer.innerHTML = `
    <div class="card">
      <table class="table">
        <thead><tr><th>Item</th><th>Price</th><th>Qty</th><th>Total</th><th></th></tr></thead>
        <tbody>
          ${cart.map(item => `
            <tr>
              <td style="display:flex;gap:10px;align-items:center">
                <img src="${item.image}" alt="${item.name}" style="width:60px;height:40px;object-fit:cover;border:1px solid #eee;border-radius:8px"/>
                <div>${item.name}</div>
              </td>
              <td>₹${item.price.toLocaleString()}</td>
              <td>
                <input type="number" min="1" value="${item.qty}" style="width:70px" data-id="${item.id}" class="qty-input"/>
              </td>
              <td>₹${(item.price*item.qty).toLocaleString()}</td>
              <td><button class="btn btn--ghost btn-remove" data-id="${item.id}">Remove</button></td>
            </tr>
          `).join("")}
        </tbody>
      </table>
      <div class="cart__summary">
        <div class="muted">Subtotal:</div>
        <div><strong>₹${subtotal.toLocaleString()}</strong></div>
        <button class="btn btn--secondary" id="checkoutBtn">Checkout</button>
      </div>
    </div>
  `;

  $all(".qty-input", cartContainer).forEach(input => {
    input.addEventListener("change", ()=>{
      const id = input.dataset.id;
      const qty = Math.max(1, parseInt(input.value || "1", 10));
      const cart = getCart();
      const item = cart.find(i => i.id === id);
      if(item){ item.qty = qty; setCart(cart); updateCartBadge(); renderCart(); }
    });
  });
  $all(".btn-remove", cartContainer).forEach(btn => {
    btn.addEventListener("click", ()=>{
      const id = btn.dataset.id;
      const next = getCart().filter(i => i.id !== id);
      setCart(next); updateCartBadge(); renderCart();
    });
  });

  const checkoutBtn = document.getElementById("checkoutBtn");
  if(checkoutBtn){
    checkoutBtn.addEventListener("click", ()=>{
      const user = getCurrentUser();
      if(!user){ alert("Please login to proceed to checkout."); location.href = "login.html"; return; }
      alert("Checkout complete! (demo) — your order has been placed.");
      setCart([]); updateCartBadge(); renderCart();
    });
  }
}
renderCart();