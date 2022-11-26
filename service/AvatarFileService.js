const uuid = require("uuid");
const path = require("path");

class AvatarFileService {
  saveFile(file) {
    try {
      const fileName = uuid.v4() + ".jpg";
      const filePath = path.resolve("static/avatar", fileName);
      console.log("filePath");
      console.log(filePath);
      file.mv(filePath);
      return fileName;
    } catch (e) {
      console.log(e);
    }
  }
}

module.exports = new AvatarFileService();
