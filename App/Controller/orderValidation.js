const { validationResult } = require("../Middlewear/utils");
const { check } = require("express-validator");
/**
 * Validates register request
 */
exports.order = [
  check("amount")
    .exists()
    .withMessage("AMOUNT_MISSING")
    .not()
    .isEmpty()
    .withMessage("AMOUNT_MISSING"),
  check("paymentMode")
    .exists()
    .withMessage("PaymentMode_MISSING")
    .not()
    .isEmpty()
    .withMessage("IS_EMPTY")
    .withMessage("PaymentMode_MISSING"),
  (req, res, next) => {
    validationResult(req, res, next);
  },
];

exports.createCoupon = [
  check("name")
    .exists()
    .withMessage("CouponName_MISSING")
    .not()
    .isEmpty()
    .withMessage("CouponName_MISSING"),
  check("discount")
    .exists()
    .withMessage("Discount_MISSING")
    .not()
    .isEmpty()
    .withMessage("IS_EMPTY")
    .withMessage("Discount_MISSING"),
  check("mimimumAmount")
    .exists()
    .withMessage("MinimumAmount_MISSING")
    .not()
    .isEmpty()
    .withMessage("IS_EMPTY")
    .withMessage("MinimumAmount_MISSING"),
  check("maxDiscount")
    .exists()
    .withMessage("MaxDiscount_MISSING")
    .not()
    .isEmpty()
    .withMessage("IS_EMPTY")
    .withMessage("MaxDiscount_MISSING"),
  (req, res, next) => {
    validationResult(req, res, next);
  },
];

exports.validateAddress = [
  check("address1")
    .exists({ checkFalsy: true })
    .withMessage("Address is required"),

    check("address2")
    .exists({ checkFalsy: true })
    .withMessage("Address2 is required"),

  check("city").exists({ checkFalsy: true }).withMessage("City is required"),

  check("state").exists({ checkFalsy: true }).withMessage("State is required"),

  check("country")
    .exists({ checkFalsy: true })
    .withMessage("Country is required"),

  check("pincode")
    .exists({ checkFalsy: true })
    .withMessage("Pincode is required")
    .isPostalCode("any")
    .withMessage("Invalid pincode"),

  check("isDefault")
    .optional()
    .isBoolean()
    .withMessage("isDefault must be a boolean"),

  check("firstName")
    .exists({ checkFalsy: true })
    .withMessage("First name is required"),

  check("lastName")
    .exists({ checkFalsy: true })
    .withMessage("Last name is required"),

  check("phone")
    .exists({ checkFalsy: true })
    .withMessage("Phone number is required")
    .isMobilePhone()
    .withMessage("Invalid phone number"),

  // check('landmark')
  //   .optional()
  //   .isString()
  //   .withMessage('Landmark must be a string'),
  check("email")
    .exists()
    .withMessage("MISSING")
    .not()
    .isEmpty()
    .withMessage("IS_EMPTY")
    .isEmail()
    .withMessage("EMAIL_IS_NOT_VALID"),
  // Final middleware to handle validation result
  (req, res, next) => {
    validationResult(req, res, next);
  },
];


exports.createSale = [
  check("saleName")
    .exists({ checkFalsy: true })
    .withMessage("Sale name is required"),

  check("discount")
    .exists({ checkFalsy: true })
    .withMessage("Discount is required"),

  check("gender")
    .exists({ checkFalsy: true })
    .withMessage("Gender is required"),

  // check("image")
  //   .exists({ checkFalsy: true })
  //   .withMessage("Image is required"),

  // check("mobileImage")
  //   .exists({ checkFalsy: true })
  //   .withMessage("Mobile image is required"),

  check("startDate")
    .exists({ checkFalsy: true })
    .withMessage("Start date is required"),

  check("endDate")
    .exists({ checkFalsy: true })
    .withMessage("End date is required"),

  check("categoryId")
    .exists({ checkFalsy: true })
    .withMessage("Category is required"),

  // Final middleware to handle validation result
  (req, res, next) => {
    validationResult(req, res, next);
  },
];


exports.createCompany = [
  check("companyName")
    .exists().withMessage("CompanyName_MISSING")
    .notEmpty().withMessage("CompanyName_EMPTY"),

  check("companyLogo")
    .exists().withMessage("CompanyLogo_MISSING")
    .notEmpty().withMessage("CompanyLogo_EMPTY"),

  check("companyAddress1")
    .exists().withMessage("CompanyAddress1_MISSING")
    .notEmpty().withMessage("CompanyAddress1_EMPTY"),

  check("city")
    .exists().withMessage("City_MISSING")
    .notEmpty().withMessage("City_EMPTY"),

  check("state")
    .exists().withMessage("State_MISSING")
    .notEmpty().withMessage("State_EMPTY"),

  check("pincode")
    .exists().withMessage("Pincode_MISSING")
    .notEmpty().withMessage("Pincode_EMPTY")
    .isPostalCode('IN').withMessage("Invalid_Pincode"),

  check("country")
    .exists().withMessage("Country_MISSING")
    .notEmpty().withMessage("Country_EMPTY"),

  check("vendorId")
    .exists().withMessage("VendorId_MISSING")
    .notEmpty().withMessage("VendorId_EMPTY"),

  check("gstin")
    .exists().withMessage("GSTIN_MISSING")
    .notEmpty().withMessage("GSTIN_EMPTY")
    .matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/)
    .withMessage("Invalid_GSTIN"),

  check("companyEmail")
    .exists().withMessage("Email_MISSING")
    .notEmpty().withMessage("Email_EMPTY")
    .isEmail().withMessage("Invalid_Email"),

  check("companyPhone1")
    .exists().withMessage("Phone1_MISSING")
    .notEmpty().withMessage("Phone1_EMPTY")
    .isMobilePhone().withMessage("Invalid_Phone1"),

  check("companyPhone2")
    .optional()
    .isMobilePhone().withMessage("Invalid_Phone2"),

  check("userId")
    .exists().withMessage("UserId_MISSING")
    .notEmpty().withMessage("UserId_EMPTY"),

  // Optional fields
  check("companyAddress2").optional(),
  check("tagline").optional(),
  check("description").optional(),

  (req, res, next) => {
    validationResult(req, res, next);
  },
];