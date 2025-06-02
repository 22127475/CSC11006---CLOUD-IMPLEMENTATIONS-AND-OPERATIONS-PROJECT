const pool = require('../db/db');

class Order {
  static async create({ user_id, product_ids, address, phone, state }) {
    const total_price = await this.calculateTotal(product_ids);

    const result = await pool.query(
      `INSERT INTO orders (user_id, product_ids, address, phone, state, total_price)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [user_id, JSON.stringify(product_ids), address, phone, state, total_price]
    );

    return result.rows[0];
  }

  static async getByUser(user_id) {
    const result = await pool.query(
      'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
      [user_id]
    );
    return result.rows;
  }

  static async getById(id) {
    const result = await pool.query('SELECT * FROM orders WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async update(id, { product_ids, address, phone, state }) {
    const total_price = await this.calculateTotal(product_ids);
    const result = await pool.query(
      `UPDATE orders SET
         product_ids = $1,
         address = $2,
         phone = $3,
         state = $4,
         total_price = $5
       WHERE id = $6 RETURNING *`,
      [JSON.stringify(product_ids), address, phone, state, total_price, id]
    );
    return result.rows[0];
  }

  static async delete(id) {
    await pool.query('DELETE FROM orders WHERE id = $1', [id]);
  }

  static async calculateTotal(product_ids) {
    if (!product_ids || product_ids.length === 0) return 0;

    const ids = product_ids.map(p => p.productId);
    const result = await pool.query(
      `SELECT id, price FROM products WHERE id = ANY($1)`,
      [ids]
    );

    let total = 0;
    for (let item of product_ids) {
      const product = result.rows.find(p => p.id === item.productId);
      if (product) {
        total += product.price * item.quantity;
      }
    }

    return total;
  }

    static async getCartByUser(user_id) {
        const result = await pool.query(
            'SELECT * FROM orders WHERE user_id = $1 AND state = $2 LIMIT 1',
            [user_id, 'cart']
  );
  return result.rows[0];
}

static async createOrUpdateCart({ user_id, product_ids }) {
  const cart = await this.getCartByUser(user_id);
  const total_price = await this.calculateTotal(product_ids);

  if (cart) {
    // Cập nhật cart cũ
    const result = await pool.query(
      `UPDATE orders SET product_ids = $1, total_price = $2 WHERE id = $3 RETURNING *`,
      [JSON.stringify(product_ids), total_price, cart.id]
    );
    return result.rows[0];
  } else {
    // Tạo cart mới
    const result = await pool.query(
      `INSERT INTO orders (user_id, product_ids, state, total_price)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [user_id, JSON.stringify(product_ids), 'cart', total_price]
    );
    return result.rows[0];
  }
}

static async checkoutCart(user_id, address, phone) {
  const cart = await this.getCartByUser(user_id);
  if (!cart) throw new Error('Cart not found');

  // Đổi cart thành order
  await pool.query(
    `UPDATE orders SET address = $1, phone = $2, state = 'ordered', created_at = NOW()
     WHERE id = $3`,
    [address, phone, cart.id]
  );

  // Tạo cart mới cho user
  await pool.query(
    `INSERT INTO orders (user_id, product_ids, state, total_price)
     VALUES ($1, '[]', 'cart', 0)`,
    [user_id]
  );
}
}

module.exports = Order;
