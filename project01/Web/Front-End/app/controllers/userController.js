exports.index = (req, res) => {
  res.render("layout", {
    content: "login",
    apiBaseUrl: process.env.API_BASE_URL,
  });
};

exports.register = (req, res) => {
  res.render("layout", {
    content: "register",
    apiBaseUrl: process.env.API_BASE_URL,
  });
};

exports.profile = (req, res) => {
  res.render("layout", {
    content: "profile",
    apiBaseUrl: process.env.API_BASE_URL,
  });
};
