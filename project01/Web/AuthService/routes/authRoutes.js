const express = require("express");
const router = express.Router(); // Sử dụng express.Router()
const jwt = require("jsonwebtoken");
const User = require("../models/User"); // Điều chỉnh đường dẫn tương đối
const authMiddleware = require("../middleware/auth"); // Điều chỉnh đường dẫn tương đối

// --- CÁC ROUTE ĐƯỢC ĐỊNH NGHĨA TRÊN ROUTER ---

// GET /auth/ (dùng để lấy thông tin user đã đăng nhập)
router.get("/", authMiddleware, async (req, res) => {
  // Nếu middleware thành công, req.user sẽ tồn tại
  if (req.user) {
    res.status(200).json({ user: req.user });
  } else {
    res.status(401).json({ user: null, isAuthenticated: false });
  }
});

// GET /auth/check-auth
router.get("/check-auth", authMiddleware, async (req, res) => {
  res.status(200).json({
    isAuthenticated: true,
    user: req.user,
  });
});

// POST /auth/register
router.post("/register", async (req, res) => {
  const { username, email, password, confirm_password } = req.body;

  if (password !== confirm_password) {
    return res.status(400).json({ error: "Mật khẩu xác nhận không khớp" });
  }

  try {
    const user = await User.create({ username, email, password });
    res.status(201).json(user);
  } catch (err) {
    if (err.code === "23505") {
      res.status(400).json({ error: "Tên người dùng hoặc email đã tồn tại" });
    } else {
      console.error(err);
      res.status(500).json({ error: "Lỗi hệ thống" });
    }
  }
});

// POST /auth/login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findByUsername(username);

    if (!user || !(await User.isPasswordMatch(password, user.password))) {
      return res
        .status(401)
        .json({ error: "Thông tin đăng nhập không chính xác" });
    }

    const payload = {
      id: user.id,
      username: user.username,
      email: user.email,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Tự động chuyển secure khi deploy
      sameSite: "lax",
      maxAge: 3600000,
    });

    res.json({ message: "Đăng nhập thành công" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi hệ thống" });
  }
});

// POST /auth/logout
router.post("/logout", (req, res) => {
  res.clearCookie("auth_token");
  res.json({ message: "Đăng xuất thành công" });
});

module.exports = router;
