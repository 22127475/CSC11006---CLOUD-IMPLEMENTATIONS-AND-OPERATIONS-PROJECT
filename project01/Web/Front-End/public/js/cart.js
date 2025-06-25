let cartItemCount = 0; // Biến toàn cục để lưu số sản phẩm trong giỏ hàng

  function showToast(message) {
  const toast = document.getElementById('toast-message');
  toast.textContent = message;
  toast.classList.remove('hidden');
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
    toast.classList.add('hidden');
  }, 3000); // Hiển thị trong 3 giây
}

async function loadCartPage() {
  try {
    const userRes = await fetch(`${apiBaseUrl}:3001/`, {
      method: 'GET',
      credentials: 'include'
    });

    if (!userRes.ok) throw new Error('Không thể lấy thông tin người dùng');
    const userData = await userRes.json();
    const user = userData.user;

    if (!user || !user.id) {
        showToast('Vui lòng đăng nhập trước khi xem giỏ hàng');
        return;
    }

    document.getElementById('name').value = user.username || 'Chưa rõ';

    const cartRes = await fetch(`${apiBaseUrl}:3003/orders/cart/${user.id}`);
    if (!cartRes.ok) throw new Error('Không thể lấy giỏ hàng');
    const cartItems = await cartRes.json();

    cartItemCount = cartItems.length;

    const productContainer = document.querySelector('.product-list');
    const productList = productContainer.querySelectorAll('.product');
    productList.forEach(el => el.remove());

    let total = 0;
    cartItems.forEach(item => {
      const productDiv = document.createElement('div');
      productDiv.className = 'product';

      const price = item.price * item.quantity;
      total += price;

      productDiv.innerHTML = `
        <img src="${item.image}" alt="${item.name}" class="product-image">
        <div class="product-name">${item.name}</div>
        <div class="product-quantity">
          <button class="desc" data-product-id="${item.product_id}">-</button>
          <span>${item.quantity}</span>
          <button class="insc" data-product-id="${item.product_id}">+</button>
        </div>
        <div class="product-price">$${price.toLocaleString('vi-VN')}</div>
      `;

      productContainer.insertBefore(productDiv, productContainer.querySelector('hr'));
    });

    document.querySelector('.total-price').innerText = `$${total.toLocaleString('vi-VN')}`;

    // ✅ Gán lại sự kiện sau khi cập nhật DOM
    document.querySelectorAll('.insc').forEach(btn => {
      btn.addEventListener('click', async () => {
        const productId = btn.getAttribute('data-product-id');
        await fetch(`${apiBaseUrl}:3003/orders/cart/add`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ user_id: user.id, productId, quantity: 1})
        });
        await loadCartPage();
      });
    });

    document.querySelectorAll('.desc').forEach(btn => {
      btn.addEventListener('click', async () => {
        const productId = btn.getAttribute('data-product-id');
        await fetch(`${apiBaseUrl}:3003/orders/cart/decrease`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ user_id: user.id, productId })
        });
        await loadCartPage();
      });
    });

  } catch (err) {
    console.error('Lỗi khi tải dữ liệu:', err);
    showToast('Không thể tải dữ liệu giỏ hàng.');
  }
}


document.querySelector('.checkout-button').addEventListener('click', async () => {
  const name = document.getElementById('name').value;
  const address = document.getElementById('address').value;
  const phone = document.getElementById('phone').value;

  if (!address || !phone) {
    showToast('Vui lòng nhập đầy đủ địa chỉ và số điện thoại');
    return;
  }

  if (cartItemCount === 0) {
    showToast('Giỏ hàng đang trống. Vui lòng thêm sản phẩm trước khi thanh toán.');
    return;
  }

  try {
    const userRes = await fetch(`${apiBaseUrl}:3001/`, {
      credentials: 'include',
    });

    if (!userRes.ok) throw new Error('Không thể lấy thông tin người dùng');
    const userData = await userRes.json();
    const user_id = userData.user?.id;
    const email = userData.user?.email;

    if (!user_id) throw new Error('Không có user_id');

    const cartRes = await fetch(`${apiBaseUrl}:3003/orders/cart/${user_id}`);
    if (!cartRes.ok) throw new Error('Không thể lấy giỏ hàng');
    const cartData = await cartRes.json();

    const checkoutRes = await fetch(`${apiBaseUrl}:3003/orders/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user_id,
        address,
        phone
      })
    });

    const result = await checkoutRes.json();

    if (checkoutRes.ok) {
        await fetch("https://kohvuu5txks63tcmxtcoyg3qe40tkwgi.lambda-url.us-east-1.on.aws/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          name: name,
          address,
          phone,
          order: cartData 
        })
      });
      showToast('Thanh toán thành công!');
      location.reload(); // Hoặc chuyển hướng sang trang đơn hàng
    } else {
      showToast('Lỗi khi thanh toán: ' + result.message);
    }

  } catch (error) {
    console.error('Lỗi:', error);
    showToast('Đã xảy ra lỗi khi xử lý thanh toán');
  }
});
document.addEventListener('DOMContentLoaded', loadCartPage);
