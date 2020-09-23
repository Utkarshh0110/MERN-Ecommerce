var express = require("express");
var router = express.Router();

const {
  getProductById,
  getProduct,
  createProduct,
  photo,
  deleteProduct,
  updateProduct,
  getAllProducts,
  getAllUniqueCategories
} = require("../controllers/product");
const { isSignedIn, isAuthenticated, isAdmin } = require("../controllers/auth");
const { getUserById } = require("../controllers/user");
const { check, validationResult } = require("express-validator");

//All of params
router.param("productId", getProductById);
router.param("userId", getUserById);

//all of actual routes
router.get("/product/:productId", isSignedIn, isAuthenticated, getProduct);
router.get("/product/photo/:productId", photo);
router.post(
  "/product/create/:userId",
  isSignedIn,
  isAuthenticated,
  isAdmin,
  createProduct
);

//delete route
router.delete(
  "/product/:productId/:userId",
  isSignedIn,
  isAuthenticated,
  isAdmin,
  deleteProduct
);
//update route
router.put(
  "/product/:productId/:userId",
  isSignedIn,
  isAuthenticated,
  isAdmin,
  updateProduct
);

//listing route
router.get("/products", getAllProducts);

router.get("/products/categories", getAllUniqueCategories)

//Exporting the route
module.exports = router;
