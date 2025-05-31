// routes/index.js
const express = require('express');
const router = express.Router();
const productController = require('../app/controllers/productController');

router.get('/', productController.index);

router.get('/products', productController.getAllProducts);

module.exports = router;
