function filePath(path) {
  return function (req, res, next) {
    console.log("filePath");
    req.filePath = path;
    next();
  };
}

module.exports = filePath;
