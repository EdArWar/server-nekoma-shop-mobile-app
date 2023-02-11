// const jwt = require("jsonwebtoken");
// const config = require("config");

// module.exports = function (req, res, next) {
//   if (req.method === "OPTIONS") {
//     next();
//   }

//   try {
//     const token = req.headers.authorization.split(" ")[1];
//     if (!token) {
//       return res.status(403).json({ message: "Пользователь не авторизован" });
//     }
//     const decodedData = jwt.verify(token, config.get("secretKey"));
//     req.user = decodedData;
//     console.log("req.user");
//     console.log(req.user);
//     next();
//   } catch (e) {
//     console.log(e);
//     return res.status(403).json({ message: "Пользователь не авторизован" });
//   }
// };

const jwt = require("jsonwebtoken");
const config = require("config");

module.exports = (req, res, next) => {
  if (req.method === "OPTIONS") {
    return next();
  }

  try {
    console.log("req.headers.providerId", req.headers.provider);
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Auth error" });
    }
    const decoded = jwt.verify(token, config.get("secretKey"));
    req.user = decoded;
    req.user.providerId = req.headers.provider;
    next();
  } catch (e) {
    return res.status(401).json({ message: "Auth error" });
  }
};
