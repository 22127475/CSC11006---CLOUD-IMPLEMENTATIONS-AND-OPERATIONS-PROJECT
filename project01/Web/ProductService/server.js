require("dotenv").config(); // Nên dùng dotenv để quản lý biến môi trường
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

// Import router
const orderRoutes = require("./routes/index");

const app = express();
const port = process.env.PORT || 3003;

// --- Cấu hình Middleware Chung ---

// 1. Cấu hình CORS một cách linh hoạt
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : [];
console.log(`[OrderService] Allowed CORS Origins:`, allowedOrigins);

const corsOptions = {
  origin: function (origin, callback) {
    // Luôn cho phép các request không có origin hoặc các origin trong whitelist
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(
        new Error(`[OrderService] Origin ${origin} not allowed by CORS`)
      );
    }
  },
  credentials: true,
};
app.use(cors(corsOptions));

// 2. Các middleware khác
app.use(express.json());
app.use(cookieParser());

// 3. Vô hiệu hóa ETag để tránh lỗi 304 Not Modified
app.disable("etag");

// --- Gắn Router vào Ứng Dụng với Tiền Tố ---
// TẤT CẢ các request đến /orders sẽ được điều hướng đến orderRoutes
app.use("/orders", orderRoutes);

// Route kiểm tra sức khỏe cơ bản cho Nginx/ALB
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

// Khởi động server
app.listen(port, () => {
  console.log(`OrderService is running on port ${port}`);
});
