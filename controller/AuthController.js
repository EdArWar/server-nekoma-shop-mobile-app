const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const config = require("config");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Role = require("../models/Role");
const cloudinary = require("cloudinary");
const fs = require("fs");
const ExternalUser = require("../models/ExternalUser");
cloudinary.config({
  cloud_name: "mern-archer",
  api_key: "393523673758456",
  api_secret: "nHcLrhjETCAI0Ex51jE2aJ_TE8s",
});

const generateAccessToken = (id, roles) => {
  const payload = {
    id,
    roles,
  };
  return jwt.sign(payload, config.get("secretKey"), { expiresIn: "24h" });
};

class AuthController {
  // async createRole(req, res) {
  //   try {
  //     const userRole = new Role();
  //     const adminRole = new Role({ value: "ADMIN" });
  //     await userRole.save();
  //     await adminRole.save();
  //     res.json("Server Worked !!!");
  //   } catch (e) {
  //     console.log(e);
  //   }
  // }

  async registration(req, res) {
    try {
      const errors = validationResult(req);
      // if (!errors.isEmpty()) {
      //   return res.status(400).json({ message: "Registration error", errors });
      // }
      let info = [];
      if (!!req.files) {
        const files = req.files.file;

        if (files) {
          await cloudinary.v2.uploader.upload(
            files.tempFilePath,
            { folder: "nekuma_user_avatar" },
            async (err, result) => {
              if (err) throw err;
              removeTmp(files.tempFilePath);
              info.push({
                public_id: result.public_id,
                url: result.secure_url,
              });
            }
          );
        }
      }

      const { userName, lastName, email, password } = req.body;

      const candidate = await User.findOne({ email });

      if (candidate) {
        res.status(400).json({ message: "User exists !!! " });
      }
      const userRole = await Role.findOne({ value: "USER" });

      const hashPassword = bcrypt.hashSync(password, 7);

      const user = await User.create({
        userName,
        lastName,
        email,
        password: hashPassword,
        avatar: info.length > 0 ? info : [],
        favorite: [],
        products: [],
        roles: [userRole.value],
      });
      await user.save();
      const token = generateAccessToken(user._id, "USER");
      return res.json({
        token,
        user: {
          id: user.id,
          userName: user.userName,
          lastName: user.lastName,
          email: user.email,
          avatar: user.avatar[0].url,
          favorites: user.favorite,
          userCart: user.products,
          providerId: user.providerId,
        },
      });
    } catch (e) {
      console.log(e);
      res.status(400).json({ msg: "Registration error" });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(400).json({ message: `E-mail ${email} not found` });
      }

      const validPassword = bcrypt.compareSync(password, user.password);
      if (!validPassword) {
        return res.status(400).json({ message: `Wrong password entered` });
      }

      const token = generateAccessToken(user._id, "USER");
      return res.json({
        token,
        user: {
          id: user.id,
          userName: user.userName,
          lastName: user.lastName,
          email: user.email,
          avatar: user.avatar[0].url,
          favorites: user.favorite,
          userCart: user.products,
          providerId: user.providerId,
        },
      });
    } catch (e) {
      console.log(e);
      res.status(400).json({ message: "Login error" });
    }
  }

  async auth(req, res) {
    try {
      const user = req.user.providerId
        ? await ExternalUser.findOne({ _id: req.user.id })
        : await User.findOne({ _id: req.user.id });

      const token = jwt.sign({ id: user.id }, config.get("secretKey"), {
        expiresIn: "10h",
      });

      return req.user.providerId
        ? res.status(200).json({
            token,
            user: {
              id: user.id,
              providerId: user.providerId,
              userName: user.firstName,
              lastName: user.lastName,
              fullName: user.fullName,
              email: user.email,
              avatar: user.avatar,
              favorites: user.favorite,
              userCart: user.products,
            },
          })
        : res.json({
            token,
            user: {
              id: user.id,
              userName: user.userName,
              lastName: user.lastName,
              email: user.email,
              avatar: user.avatar[0].url,
              favorites: user.favorite,
              userCart: user.products,
              providerId: user.providerId,
            },
          });
    } catch (e) {
      console.log(e);
    }
  }
}

const removeTmp = (path) => {
  fs.unlink(path, (err) => {
    if (err) throw err;
  });
};

module.exports = new AuthController();
