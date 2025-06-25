// File: db/cache.js (Phiên bản cải tiến)

require('dotenv').config();
const Redis = require('ioredis');

// Đọc host và port từ biến môi trường
const redisHost = process.env.ELASTICACHE_ENDPOINT;
const redisPort = parseInt(process.env.ELASTICACHE_PORT, 10); // Dùng parseInt để chuyển port từ chuỗi về số

// Kiểm tra xem biến môi trường đã được cung cấp chưa
if (!redisHost || !redisPort) {
  console.error('❌ Vui lòng cung cấp ELASTICACHE_ENDPOINT và ELASTICACHE_PORT trong file .env');
  // Thoát hoặc xử lý lỗi một cách phù hợp thay vì để lỗi kết nối không rõ ràng
  process.exit(1); 
}

// Truyền vào một object cấu hình thay vì một chuỗi
const client = new Redis({
  host: redisHost,
  port: redisPort,
  maxRetriesPerRequest: 1, // Chỉ thử lại 1 lần nếu có lỗi
  // Thêm tùy chọn này để xử lý timeout tốt hơn
  enableReadyCheck: true, 
  connectTimeout: 10000, // 10 giây
});

client.on('connect', () => {
    console.log(`✅ Đã kết nối thành công tới ElastiCache tại ${redisHost}:${redisPort}`);
});

client.on('error', (err) => {
    console.error(`❌ Không thể kết nối tới ElastiCache tại ${redisHost}:${redisPort}:`, err.message);
});

module.exports = client;