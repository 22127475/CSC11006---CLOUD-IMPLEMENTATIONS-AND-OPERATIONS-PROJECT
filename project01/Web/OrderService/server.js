const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const orderRoutes = require('./routes/index');

const app = express();
const port = process.env.PORT || 3003;
const hostURL = process.env.HOST_URL || 'http://localhost:8080';
const ALB_DNS = process.env.ALB_DNS || 'http://localhost:8080';
const corsOptions = {
  origin: [hostURL, ALB_DNS],
  credentials: true
}
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// Route order
app.use('/orders', orderRoutes);

app.listen(port, () => {
  console.log(`Product service running on http://localhost:${port}`);
});
