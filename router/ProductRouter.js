const Router = require("express");
const ProductController = require("../controller/ProductController.js");
const authMiddleware = require("../middleware/authMiddleware.js");

const router = new Router();
// router.post("/create", authMiddleware, ProductController.createProduct);
router.get("/", ProductController.getAllProduct);
router.get("/tags", ProductController.getAllProductTags);
router.get("/products", ProductController.getAllProductByTagName);
router.get("/userCarts", authMiddleware, ProductController.getUserCarts);
router.get("/featuredProduct", ProductController.getFeaturedProduct);
router.post("/create", ProductController.createProduct);
router.post("/singleProduct", ProductController.getSingleProduct);
router.post("/addCart", ProductController.addCart);
router.post("/addFavorite", ProductController.addFavorite);
router.post("/removeCart", ProductController.removeCart);
router.post("/removeFavorite", ProductController.removeFavorite);

// router.post("/role", AuthController.createRole);

module.exports = router;
