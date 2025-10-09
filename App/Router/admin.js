const express = require("express");
const router = express.Router();
const path = require("path");
const Controller = require("../Controller/adminContoller");
const OrderController = require("../Controller/order");
const CouponController = require("../Controller/coupon");
const validation = require("../Controller/admin.validation");
const OrderValidation = require("../Controller/orderValidation");
const { tokenCheck } = require("../../config/jwtVerify");
const upload = require("../../config/multer");
const productUpload = upload("products");
const Bannerimage = upload("banner")
const sale = upload("sale");

//*************************************router start ******************************* */
router.post("/register", Controller.Register);
router.post("/login", validation.login, Controller.Login);

router.patch("/updatepassword", tokenCheck, Controller.updatePassword);

router.post(
  "/addproduct",
  tokenCheck,
  productUpload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "images", maxCount: 6 },
  ]),
  validation.addProduct,
  Controller.addProduct
);

router.get("/getproduct", Controller.getProduct);

router.get("/getproduct/:id", Controller.getProductById);

router.patch(
  "/updateproduct/:id",
  tokenCheck,
  productUpload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "images", maxCount: 6 },
  ]),
  Controller.updateProduct
);

router.delete("/deleteproduct/:id", tokenCheck, Controller.deleteProduct);

// router.post(
//   "/forgotpassword",
//   // validation.forgotPassword,
//   Controller.forgotPassword
// );

// router.post(
//     "/resetpassword/:id",
//     Controller.resetPassword
// );

router.post("/cms", tokenCheck, Controller.Cms);
 
router.get("/getcms", Controller.getCms);

router.get("/getalloder", tokenCheck, OrderController.getAllOrderd);

router.get("/getalluser", tokenCheck, Controller.getAllUser);

router.post("/forgotpassword", Controller.forgotPassword);

// router.post(
//   "/resetpassword/:id",
//   Controller.resetPassword
// );

//refress token
router.post("/refreshtoken", tokenCheck, Controller.refreshToken);

// add order
// order routes

// create coupon

router.post(
  "/createcoupon",
  tokenCheck,
  OrderValidation.createCoupon,
  CouponController.createCoupon
);

router.get("/getcoupon", tokenCheck, CouponController.getCoupon);

router.get("/getcoupon/:id", tokenCheck, CouponController.getCouponById);

router.delete("/deletecoupon/:id", tokenCheck, CouponController.deleteCoupon);

router.patch("/updatecoupon/:id", tokenCheck, CouponController.updateCoupon);

// add sale

router.post(
  "/createSale",
  tokenCheck,
  sale.fields([
    { name: "image", maxCount: 1 },
    { name: "mobileImage", maxCount: 1 },
  ]),
  OrderValidation.createSale,
  Controller.createSale
);
router.get(
  "/getSale",
  tokenCheck,
  Controller.getSale
);
router.patch(
  "/updateSale/:id",
  tokenCheck,
  sale.fields([
    { name: "image", maxCount: 1 },
    { name: "mobileImage", maxCount: 1 },
  ]),
  Controller.updateSale
);
router.get(
  "/getSale/:id",
  tokenCheck,
  Controller.getSaleById
);
router.delete(
  "/deleteSale/:id",
  tokenCheck,
  Controller.deleteSale
);
router.get(
  "/getreview/:productId",
  tokenCheck,
  OrderController.getReview
);
router.delete(
  "/deleteReview/:id",
  tokenCheck,
  OrderController.deleteReview
);
router.get(
  "/dashboard",
  // tokenCheck,
  Controller.dashboard
);

router.get("/getreview/:productId", tokenCheck, OrderController.getReview);

router.delete("/deleteReview/:id", tokenCheck, OrderController.deleteReview);
router.post(
  "/createComany",
  tokenCheck,
  OrderValidation.createCompany,
  Controller.createComany
);

router.get(
  "/getcompany",
  tokenCheck,  
  Controller.getCompany
);


router.get(
  "/getpaymnet",
  // tokenCheck
  Controller.getpaymnet
);
router.post(
  "/updateoderstatus",
  tokenCheck,
  Controller.updateOrderStatus
);

router.post(
  "/updateuserstatus",
  tokenCheck,
  Controller.updateUserStatus
);

router.get(
  "/getuserdetails",
  tokenCheck,
  Controller.UserDetails
);

// add Ctaegoy 
router.post(
  "/addcategory",
  tokenCheck,
  Controller.AddCategory
);

router.get(
  "/getallcategory",
  tokenCheck,
  Controller.getAllCategory
);

router.patch(
  "/updatecategory",
  tokenCheck,
  Controller.updateCategory
);

router.delete(
  "/deletecategory",
  tokenCheck,
  Controller.DeleteCategory
);

router.get(
  "/viewcategory",
  tokenCheck,
  Controller.viewCategory
);

router.post(
  "/addproduct",
  tokenCheck,
  productUpload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "images", maxCount: 6 },
  ]),
  validation.addProduct,
  Controller.addProduct
);

router.post(
  "/addbanner",
  // tokenCheck,
  Bannerimage.array('images'), 
  Controller.addBanner
);

router.post(
  "/updatebannerimage",
  Bannerimage.single('images'), 
  Controller.UpdateBanner
);

router.delete(
  "/deletebannerimage",
  Controller.DeleteBannerImage
);


router.get(
  "/getbanner",
  Controller.getbanner
);

router.get(
  "/getbannerdetails",
  Controller.getBannerdetails
);













// router.get("/getCompany", tokenCheck, Controller.getCompany);

module.exports = router;
