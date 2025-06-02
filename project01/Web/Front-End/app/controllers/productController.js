exports.index = (req, res) => {
   res.render('layout', { content: 'home'});
};

exports.getAllProducts = (req, res) => {
       res.render('layout', { content: 'product'});
};