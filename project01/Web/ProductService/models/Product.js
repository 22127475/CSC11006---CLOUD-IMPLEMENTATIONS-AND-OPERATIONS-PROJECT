// File: models/Product.js

const pool = require('../db/db');      // Kết nối tới Database
const cache = require('../db/cache');  // <<< MỚI: Kết nối tới Cache

const CACHE_TTL = 3600; // Thời gian sống của cache: 3600 giây = 1 giờ

class Product {
  /**
   * Lấy tất cả sản phẩm, có áp dụng cache
   */
  static async getAll() {
    // 1. Xác định key cho cache
    const cacheKey = 'products:all';

    // 2. Thử lấy từ cache trước
    try {
      const cachedProducts = await cache.get(cacheKey);
      if (cachedProducts) {
        console.log('CACHE HIT for all products');
        return JSON.parse(cachedProducts); // Chuyển chuỗi JSON về lại object/array
      }
    } catch (err) {
      console.error('Lỗi ElastiCache khi getAll:', err);
      // Nếu cache lỗi, chúng ta sẽ bỏ qua và lấy từ DB như bình thường
    }

    // 3. Cache MISS: Nếu không có trong cache, lấy từ DB
    console.log('CACHE MISS for all products. Fetching from DB.');
    const result = await pool.query('SELECT * FROM products ORDER BY id ASC');
    const productsFromDb = result.rows;

    // 4. Lưu kết quả từ DB vào cache để dùng cho lần sau
    try {
      // Dùng setex để set key với thời gian tự hết hạn (TTL)
      await cache.setex(cacheKey, CACHE_TTL, JSON.stringify(productsFromDb));
    } catch (err) {
      console.error('Không thể set cache cho all products:', err);
    }
    
    return productsFromDb;
  }

  /**
   * Lấy một sản phẩm theo ID, có áp dụng cache
   */
  static async getById(id) {
    const cacheKey = `product:${id}`;

    try {
      const cachedProduct = await cache.get(cacheKey);
      if (cachedProduct) {
        console.log(`CACHE HIT for product:${id}`);
        return JSON.parse(cachedProduct);
      }
    } catch (err) {
      console.error(`Lỗi ElastiCache khi getById ${id}:`, err);
    }

    console.log(`CACHE MISS for product:${id}. Fetching from DB.`);
    const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    const productFromDb = result.rows[0];

    if (productFromDb) {
      try {
        await cache.setex(cacheKey, CACHE_TTL, JSON.stringify(productFromDb));
      } catch (err) {
        console.error(`Không thể set cache cho product:${id}:`, err);
      }
    }
    
    return productFromDb;
  }

  /**
   * Tạo sản phẩm mới. Sau khi tạo, chúng ta cần xóa cache của "danh sách tất cả sản phẩm"
   */
  static async create({ name, image, price, type }) {
    const result = await pool.query(
      'INSERT INTO products (name, image, price, type) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, image, price, type]
    );

    // LÀM MỚI CACHE
    try {
      // Khi có sản phẩm mới, danh sách 'products:all' đã bị cũ, cần xóa đi
      await cache.del('products:all'); 
      console.log('INVALIDATED CACHE for all products (due to create)');
    } catch(err) {
      console.error('Không thể xóa cache all products:', err);
    }

    return result.rows[0];
  }

  /**
   * Cập nhật sản phẩm. Sau khi cập nhật, cần xóa cache của sản phẩm đó và cả danh sách
   */
  static async update(id, { name, image, price, type }) {
    const result = await pool.query(
        'UPDATE products SET name = $1, image = $2, price = $3, type = $4 WHERE id = $5 RETURNING *',
        [name, image, price, type, id]
    );

    // LÀM MỚI CACHE
    try {
      await cache.del(`product:${id}`);      // Xóa cache của sản phẩm vừa sửa
      await cache.del('products:all');      // Xóa cache của cả danh sách
      console.log(`INVALIDATED CACHE for product:${id} and all products (due to update)`);
    } catch(err) {
      console.error(`Không thể xóa cache cho product:${id}:`, err);
    }

    return result.rows[0];
  }


  /**
   * Xóa sản phẩm. Sau khi xóa, cần xóa cache của sản phẩm đó và cả danh sách
   */
  static async delete(id) {
    await pool.query('DELETE FROM products WHERE id = $1', [id]);

    // LÀM MỚI CACHE
    try {
      await cache.del(`product:${id}`);      // Xóa cache của sản phẩm vừa xóa
      await cache.del('products:all');      // Xóa cache của cả danh sách
      console.log(`INVALIDATED CACHE for product:${id} and all products (due to delete)`);
    } catch(err) {
      console.error(`Không thể xóa cache cho product:${id}:`, err);
    }
  }
}

module.exports = Product;