exports.index = (req, res) => {
   res.render('layout', { content: 'login'});
};

exports.register = (req, res) => {
   res.render('layout', { content: 'register' });
};

exports.profile = (req, res) => {
    res.render('layout', { content: 'profile'});
};