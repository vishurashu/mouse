const {validationResult} = require("../Middlewear/utils")
const { check } = require('express-validator');
/**
 * Validates register request
 */
exports.register = [
    check('firstName')
      .exists()
      .withMessage('MISSING')
      .not()
      .isEmpty()
      .withMessage('IS_EMPTY'),
    check('email')
      .exists()
      .withMessage('MISSING')
      .not()
      .isEmpty()
      .withMessage('IS_EMPTY')
      .isEmail()
      .withMessage('EMAIL_IS_NOT_VALID'),
    check('password')
      .exists()
      .withMessage('MISSING')
      .not()
      .isEmpty()
      .withMessage('IS_EMPTY')
      .isLength({
        min: 5
      })
      .withMessage('PASSWORD_TOO_SHORT_MIN_5'),
    (req, res, next) => {
      validationResult(req, res, next)
    }
  ]
  
  /**
   * Validates login request
   */
  exports.login = [
    check('email')
      .exists()
      .withMessage('MISSING')
      .not()
      .isEmpty()
      .withMessage('IS_EMPTY')
      .isEmail()
      .withMessage('EMAIL_IS_NOT_VALID'),
    check('password')
      .exists()
      .withMessage('MISSING')
      .not()
      .isEmpty()
      .withMessage('IS_EMPTY')
      .isLength({
        min: 5
      })
      .withMessage('PASSWORD_TOO_SHORT_MIN_5'),
    (req, res, next) => {
      validationResult(req, res, next)
    }
  ]
  
  /**
   * Validates verify request
   */
  exports.verify = [
    check('id')
      .exists()
      .withMessage('MISSING')
      .not()
      .isEmpty()
      .withMessage('IS_EMPTY'),
    (req, res, next) => {
      validationResult(req, res, next)
    }
  ]
  
  /**
   * Validates forgot password request
   */
  exports.forgotPassword = [
    check('email')
      .exists()
      .withMessage('MISSING')
      .not()
      .isEmpty()
      .withMessage('IS_EMPTY')
      .isEmail()
      .withMessage('EMAIL_IS_NOT_VALID'),
    (req, res, next) => {
      validationResult(req, res, next)
    }
  ]
  
  /**
   * Validates reset password request
   */
  exports.resetPassword = [
    check('id')
      .exists()
      .withMessage('MISSING')
      .not()
      .isEmpty()
      .withMessage('IS_EMPTY'),
    check('password')
      .exists()
      .withMessage('MISSING')
      .not()
      .isEmpty()
      .withMessage('IS_EMPTY')
      .isLength({
        min: 5
      })
      .withMessage('PASSWORD_TOO_SHORT_MIN_5'),
    (req, res, next) => {
      validationResult(req, res, next)
    }
  ]

   /**
   * add product validation
   */

   exports.addProduct = [
    check('productName')
      .exists()
      .withMessage('PRODUCT_NAME_MISSING')
      .not()
      .isEmpty()
      .withMessage('IS_EMPTY'),
    check('price')
      .exists()
      .withMessage('PRODUCT_PRICE_MISSING')
      .not()
      .isEmpty()
      .withMessage('IS_EMPTY'),
    // check('categoryId')
    //   .exists()
    //   .withMessage('CATEGORY_MISSING')
    //   .not()
    //   .isEmpty()
    //   .withMessage('IS_EMPTY'),
    check('description')
      .exists()
      .withMessage('DESCRIPTION_MISSING')
      .not()
      .isEmpty()
      .withMessage('IS_EMPTY'),
    (req, res, next) => {
      console.log("addProduct validation", req.body)
      validationResult(req, res, next)
    }
  ]