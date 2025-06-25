exports.index = (req, res) => {
   res.render('layout', { content: 'home', apiBaseUrl: process.env.API_BASE_URL  || 3002 });
};

exports.getAllProducts = (req, res) => {
       res.render('layout', { content: 'product', apiBaseUrl: process.env.API_BASE_URL  || 3002 });
};

exports.index = (req, res) => {
  res.render('layout', {
    content: 'home',
    apiBaseUrl: process.env.API_BASE_URL,
    ec2IP: process.env.EC2_IP
  });
};
