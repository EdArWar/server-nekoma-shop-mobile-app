const cloudinary = require("cloudinary");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const Product = require("../models/Product.js");
const config = require("config");
const User = require("../models/User.js");
const ExternalUser = require("../models/ExternalUser.js");

// cloudinary.config({
//   cloud_name: process.env.CLOUD_NAME,
//   api_key: process.env.CLOUD_API_KEY,
//   api_secret: process.env.CLOUD_API_SECRET,
// });
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

class ProductRouter {
  async createProduct(req, res) {
    try {
      const body = req.body;
      const files = req.files.file;

      let {
        productBrand,
        productName,
        productTitle,
        productDescription,
        productPrice,
        productTag,
      } = req.body;

      let info = [];

      if (files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          await cloudinary.v2.uploader.upload(
            files[i].tempFilePath,
            { folder: "nekoma" },
            async (err, result) => {
              if (err) throw err;
              removeTmp(files[i].tempFilePath);
              info.push({
                public_id: result.public_id,
                url: result.secure_url,
              });
            }
          );
        }
      } else {
        await cloudinary.v2.uploader.upload(
          files.tempFilePath,
          { folder: "nekoma" },
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

      const product = await Product.create({
        productBrand,
        productName,
        productTitle,
        productDescription,
        productPrice: parseInt(productPrice),
        productTag,
        productImage: info,
      });
      return res.status(200).json({ product });
    } catch (error) {
      console.log(error);
      res.status(400).json({ msg: `Registration error ${error}` });
    }
  }

  async getAllProduct(req, res) {
    try {
      const products = await Product.find();
      res.status(200).json({ products });
    } catch (error) {
      console.log(error);
    }
  }

  async getFeaturedProduct(req, res) {
    try {
      const products = await Product.find({ productTag: "Dress" }).limit(8);
      res.status(200).json({ products });
    } catch (error) {
      console.log(error);
    }
  }
  async getAllProductByTagName(req, res) {
    try {
      const total = await Product.find({
        productTag: req.query.tagName,
      });

      const products = await Product.find({
        productTag: req.query.tagName,
      }).limit(+req.query.pageSize);

      res.status(200).json({
        data: products,
        totalItems: total.length,
        pageSize: +req.query.pageSize,
      });
    } catch (error) {
      console.log(error);
    }
  }

  async getSingleProduct(req, res) {
    console.log("getSingleProduct");
    try {
      const product = await Product.findOne({ _id: req.body.productId });
      res.status(200).json({ product });
    } catch (error) {
      console.log(error);
    }
  }

  async getUserCarts(req, res) {
    try {
      const user = await User.findOne({ _id: req.query.id });
      if (!user) {
        return res.status(400).json({ msg: "User does not exist." });
      }

      res.status(200).json({
        userCart: user.products,
      });
    } catch (error) {
      console.log("error", error);
    }
  }

  async addCart(req, res) {
    try {
      const token = req.body.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, config.get("secretKey"));
      const userId = decoded.id;
      const cartId = req.body.cartId;
      const product = await Product.findOne({ _id: cartId });
      const user = req.body.providerId
        ? await ExternalUser.findOne({ _id: userId })
        : await User.findOne({ _id: userId });
      if (!user) {
        return res.status(400).json({ msg: "User does not exist." });
      }

      req.body.providerId
        ? await ExternalUser.findOneAndUpdate(
            { _id: userId },
            { $push: { products: product } }
          )
        : await User.findOneAndUpdate(
            { _id: userId },
            { $push: { products: product } }
          );

      res.json({ msg: "Added to cart", userCart: product });
    } catch (error) {
      res.status(400).json({ msg: `Cart added error ${error}` });
    }
  }

  async removeCart(req, res) {
    try {
      const token = req.body.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, config.get("secretKey"));
      const userId = decoded.id;
      const cartId = req.body.cartId;

      const user = req.body.providerId
        ? await ExternalUser.findOne({ _id: userId })
        : await User.findOne({ _id: userId });

      const product = await Product.findOne({ _id: cartId });
      if (!user) return res.status(400).json({ msg: "User does not exist." });
      req.body.providerId
        ? await ExternalUser.findOneAndUpdate(
            { _id: userId },
            {
              $pull: {
                products: { _id: product._id },
              },
            }
          )
        : await User.findOneAndUpdate(
            { _id: userId },
            {
              $pull: {
                products: { _id: product._id },
              },
            }
          );

      res.status(200).json({ msg: "Remove to cart", userCart: product });
    } catch (error) {
      console.log(error);
      res.status(400).json({ msg: `Cart removed error ${error}` });
    }
  }

  async getAllProductTags(req, res) {
    try {
      const products = await Product.find();

      const tags = products.map((item) => item.productTag);
      const uniqueItems = [...new Set(tags)];

      res.status(200).json({ tags: uniqueItems });
    } catch (error) {}
  }

  async addFavorite(req, res) {
    try {
      const token = req.body.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, config.get("secretKey"));
      const userId = decoded.id;
      const cartId = req.body.favoriteId;
      const product = await Product.findOne({ _id: cartId });
      const user = req.body.providerId
        ? await ExternalUser.findOne({ _id: userId })
        : await User.findOne({ _id: userId });

      if (!user) {
        return res.status(400).json({ msg: "User does not exist." });
      }

      req.body.providerId
        ? await ExternalUser.findOneAndUpdate(
            { _id: userId },
            { $push: { favorite: product } }
          )
        : await User.findOneAndUpdate(
            { _id: userId },
            { $push: { favorite: product } }
          );

      res.json({ msg: "Added to cart", favorites: product });
    } catch (error) {
      res.status(400).json({ msg: `Cart added error ${error}` });
    }
  }

  async removeFavorite(req, res) {
    try {
      const token = req.body.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, config.get("secretKey"));
      const userId = decoded.id;
      const cartId = req.body.favoriteId;

      const user = req.body.providerId
        ? await ExternalUser.findOne({ _id: userId })
        : await User.findOne({ _id: userId });
      const product = await Product.findOne({ _id: cartId });
      if (!user) return res.status(400).json({ msg: "User does not exist." });
      req.body.providerId
        ? await ExternalUser.findOneAndUpdate(
            { _id: userId },
            {
              $pull: {
                favorite: { _id: product._id },
              },
            }
          )
        : await User.findOneAndUpdate(
            { _id: userId },
            {
              $pull: {
                favorite: { _id: product._id },
              },
            }
          );

      res.json({ msg: "Added to cart", favorites: product });
    } catch (error) {
      console.log(error);
      res.status(400).json({ msg: `Cart removed error ${error}` });
    }
  }
}

const removeTmp = (path) => {
  fs.unlink(path, (err) => {
    if (err) throw err;
  });
};

module.exports = new ProductRouter();
