const express = require("express")
const router = express.Router()
const Controller = require("../Controller/user");
const OrderController = require("../Controller/order")
const validation = require("../Controller/admin.validation");
const OrderValidation = require("../Controller/orderValidation")
const {tokenCheck}= require("../../config/jwtVerify")
const getUploadMiddleware = require("../../config/multer");
const uploadPdf = getUploadMiddleware("pdf", 50, 1);


router.post(
    "/register",
    validation.register,
    Controller.Register
);

router.get("/getproduct/:id", Controller.getProductById);

router.post(
    "/login",
    validation.login,
    Controller.Login
);

router.patch(
    "/updatepasswod",
    tokenCheck,
    Controller.updatePassword
);


router.get(
    "/getProfile",
    tokenCheck,
    Controller.getProfile
);



// order routes
router.post(
    "/createOrder",
    tokenCheck,
    OrderController.createOrder
  );


// add to cart ;

router.post(
    "/addToCart",
    OrderController.addToCart
);

router.get(
    "/getcartdetails",
    tokenCheck,
    OrderController.getCartDetails
);

router.patch(
    "/updatecart",

    OrderController.updateCart
);

router.get(
    "/getcartdeatils/:cartId",
    OrderController.getCart
)

router.delete(
    "/deletecart",
    tokenCheck,
    OrderController.deleteCart
);

router.post(
    "/addAddress",
    tokenCheck,
    OrderValidation.validateAddress,
    Controller.addAddress
);

router.get(
    "/getAddress",
    tokenCheck,
    Controller.getAddress
);
router.patch(
    "/updateAddress/:id",
    tokenCheck,
    Controller.updateAddress
);

router.delete(
    "/deleteAddress/:id",
    tokenCheck,
    Controller.deleteAddress
);

router.post(
    "/addressdetails/:id",
    tokenCheck, 
    Controller.addressDetails
);

// router.patch(
//     "/updateProfile",
//     tokenCheck,
//     profile.single("image"),
//     Controller.updateProfile
// );

//create review = >

router.post(
    "/createReview",
    tokenCheck,
    // OrderValidation.createReview,
    OrderController.createReview
);

router.get(
    "/getReview/:productId",
    tokenCheck,
    OrderController.getReview
);

router.get(
    "/shiprocketToken",
    tokenCheck,
    OrderController.shipRocketToken
);


//get all oders ;
router.get(
    "/getallorder",
    tokenCheck,
    OrderController.getAllOrder

);


// router.post(
//     "/deletesingleproduct",
//     tokenCheck,
//     OrderController.deleteSingleOrder
// );



router.post(
    "/updateTest",
    OrderController.test
);


router.post(
    "/orderStatus",
    tokenCheck,
    OrderController.CancleOrder
);


router.get(
    "/getbannerimages",
    tokenCheck,
    OrderController.Bannerimages
);

router.get(
    "/getcms",
    OrderController.getcms
);

router.get("/getproduct", OrderController.getProduct);

router.post(
    "/addlasser",
    OrderController.AddLaser
);

router.get(
    "/getlaser",
    OrderController.getLaser
);


router.get(
    "/get",
    uploadPdf.single("pdf"),
    OrderController.Pdf
);

module.exports= router