const tabs = document.querySelectorAll('.tab');
const contents = document.querySelectorAll('.tab-content');
tabs.forEach(tab => {
tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    contents.forEach(c => c.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(tab.dataset.tab).classList.add('active');
    });
 });

 document.addEventListener('DOMContentLoaded', async () => {
  try {
    const res = await fetch('http://localhost:3002/products');
    const products = await res.json();

    const categories = ['coffee', 'tea', 'milktea', 'icecream'];

    categories.forEach(type => {
      const container = document.getElementById(`${type}-list`);
      const filtered = products.filter(p => p.type === type);

      filtered.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
          <img src="${product.image}" alt="${product.name}">
          <h3>${product.name}</h3>
          <p>Giá: $${product.price}</p>
          <button data-id="${product.id}">Mua</button>
        `;
        container.appendChild(card);
      });
    });
  } catch (err) {
    console.error('Lỗi khi tải sản phẩm:', err);
  }
});

// Tab switching logic
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

    tab.classList.add('active');
    const target = tab.getAttribute('data-tab');
    document.getElementById(target).classList.add('active');
  });
});

