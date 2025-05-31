// app/controllers/productController.js
const products = require('../models/productModel');

exports.index = (req, res) => {
   res.render('layout', { content: 'home', products: products });
};

exports.getAllProducts = (req, res) => {
       res.render('layout', { content: 'product', products: products });
};