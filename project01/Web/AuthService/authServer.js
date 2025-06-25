require("dotenv").config(); // Tốt nhất nên dùng dotenv để quản lý biến môi trường
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

// Import router đã được tách ra
const authRoutes = require("./routes/authRoutes");

const app = express();
const port = process.env.PORT || 3001;

// --- Cấu hình Middleware Chung ---

// 1. Cấu hình CORS một cách linh hoạt
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : [];
console.log("Allowed CORS Origins:", allowedOrigins);

const corsOptions = {
  origin: function (origin, callback) {
    // Luôn cho phép các request không có origin (vd: Postman) hoặc các origin trong whitelist
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true,
};
app.use(cors(corsOptions));

// 2. Các middleware khác
app.use(express.json()); // Để parse JSON body
app.use(cookieParser()); // Để đọc cookie từ request

// 3. Vô hiệu hóa ETag để tránh lỗi 304 Not Modified
app.disable("etag");

// --- Gắn Router vào Ứng Dụng ---
// Tất cả các request đến /auth sẽ được điều hướng đến authRoutes
app.use("/auth", authRoutes);

// Route kiểm tra sức khỏe cơ bản cho Nginx/ALB
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

// Khởi động server
app.listen(port, () => {
  console.log(`AuthService is running on port ${port}`);
});
