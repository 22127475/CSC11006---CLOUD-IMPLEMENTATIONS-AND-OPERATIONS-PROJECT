const Order = require('../models/Order');
exports.getCart = async (req, res) => {
  try {
    const cart = await Order.getCartByUser(req.params.userId);
    
    if (!cart) {
      return res.status(404).json({ 
        message: 'Cart not found',
        shouldCreate: true 
      });
    }
    
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: 'Get cart failed' });
  }
};

exports.updateCart = async (req, res) => {
  try {
    const updated = await Order.createOrUpdateCart(req.body);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Update cart failed' });
  }
};

exports.checkout = async (req, res) => {
  try {
    const { user_id, address, phone } = req.body;
    await Order.checkoutCart(user_id, address, phone);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Checkout failed', details: err.message });
  }
};

exports.createOrder = async (req, res) => {
  try {
    const order = await Order.create(req.body);
    res.status(201).json(order);
  } catch (error) {
    console.error('Create order failed:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getOrdersByUser = async (req, res) => {
  try {
    const orders = await Order.getByUser(req.params.userId);
    res.json(orders);
  } catch (error) {
    console.error('Get orders failed:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.getById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (error) {
    console.error('Get order failed:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateOrder = async (req, res) => {
  try {
    const updated = await Order.update(req.params.id, req.body);
    res.json(updated);
  } catch (error) {
    console.error('Update order failed:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    await Order.delete(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error('Delete order failed:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
