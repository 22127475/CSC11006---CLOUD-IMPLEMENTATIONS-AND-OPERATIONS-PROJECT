const express = require("express");
const cors = require("cors");
require("dotenv").config();
const productRoutes = require("./routes/index");

const app = express();
const port = process.env.PORT || 3002;
const hostURL = process.env.HOST_URL || "http://localhost:8080";
const ALB_DNS = process.env.ALB_DNS || 'http://localhost:8080';
const corsOptions = {
  origin: [hostURL, ALB_DNS],
  credentials: true
}
app.use(cors(corsOptions));
app.use(express.json());

app.use("/products", productRoutes);

app.listen(port, () => {
  console.log(`Product service đang chạy tại http://localhost:${port}`);
});
