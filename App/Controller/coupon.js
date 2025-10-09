// const mongoose = require("mongoose");
// const bcrypt = require("bcrypt");
// const crypto = require("crypto");
// const Razorpay = require("razorpay");

// const Coupon = require("../Model/Coupon");
// const Middlewear = require("../Middlewear/comman");

// exports.createCoupon = async (req, res) => {
//   try {
//     const data = req.body;
//     data.userId = req.adminData;
//     const item = await Coupon.create(data);
//     return res.status(200).json({
//       code: 200,
//       success: true,
//       message: "Coupon created successfully",
//       data: item,
//     });
//   } catch (error) {
//     console.log("error", error);
//   }
// };

// exports.getCoupon = async (req, res) => {
//   try {
//     const data = req.query;
//     const coupon = await Middlewear.getAllcoupan(Coupon, data);
//     if (!coupon) {
//       return res.status(404).json({
//         code: 404,
//         success: false,
//         message: "Coupon not found",
//       });
//     }
//     return res.status(200).json({
//       code: 200,
//       success: true,
//       message: "Coupon fetched successfully",
//       data: coupon,
//     });
//   } catch (error) {
//     console.log("error", error);
//   }
// };

// exports.getCouponById = async(req,res)=>{
//     try{
//         const data = req.query;
//         const couponId = req.params.id;
//         const coupon = await Middlewear.FindById(Coupon,couponId);
//         if(!coupon){
//             return res.status(404).json({
//                 code: 404,
//                 success: false,
//                 message: "Coupon not found",
//             });
//         }
//         return res.status(200).json({
//             code: 200,
//             success: true,
//             message: "Coupon fetched successfully",
//             data: coupon,
//         });
//     }catch(error){
//         console.log("error", error);
//     }
// };

// exports.deleteCoupon = async(req,res)=>{
//     try{
//         const couponId = req.params.id;
//         const coupon = await Middlewear.FindByIdAndDelete(Coupon,couponId);
//         if(!coupon){
//             return res.status(404).json({
//                 code: 404,
//                 success: false,
//                 message: "Coupon not found",
//             });
//         }
//         return res.status(200).json({
//             code: 200,
//             success: true,
//             message: "Coupon deleted successfully",
//             data: coupon,
//         });
//     }catch(error){
//         console.log("error", error);
//     }
// };



// exports.updateCoupon = async(req,res)=>{
//     try{
//         const couponId = req.params.id;
//         const data = req.body;
//         const coupon = await Middlewear.FindByIdAndUpDate(Coupon,couponId,data);
//         if(!coupon){
//             return res.status(404).json({
//                 code: 404,
//                 success: false,
//                 message: "Coupon not found",
//             });
//         }
//         return res.status(200).json({
//             code: 200,
//             success: true,
//             message: "Coupon updated successfully",
//             data: coupon,
//         });
//     }catch(error){
//         console.log("error", error);
//     }
// }


const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const Razorpay = require("razorpay");

const Coupon = require("../Model/Coupon");
const Middlewear = require("../Middlewear/comman");

exports.createCoupon = async (req, res) => {
  try {
    const data = req.body;
    data.userId = req.adminData;
    const item = await Coupon.create(data);
    return res.status(200).json({
      code: 200,
      success: true,
      message: "Coupon created successfully",
      data: item,
    });
  } catch (error) {
    console.log("error", error);
  }
};

exports.getCoupon = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, status } = req.query;  // Destructure query parameters
    const skip = (page - 1) * limit;

    // Build a filter object
    let filter = {};
    if (category) {
      filter.category = category;  // Filter by category if provided
    }
    if (status) {
      filter.status = status;  // Filter by status if provided
    }

    // Fetch coupons from the database with optional filtering
    const coupons = await Coupon.find(filter)
      .skip(skip)
      .limit(Number(limit));

    const totalCoupons = await Coupon.countDocuments(filter);  // Count total coupons based on the filter

    if (!coupons || coupons.length === 0) {
      return res.status(404).json({
        code: 404,
        success: false,
        message: "Coupon not found",
      });
    }

    return res.status(200).json({
      code: 200,
      success: true,
      message: "Coupons fetched successfully",
      data: {
        items: coupons,
        totalItems: totalCoupons,
        currentPage: Number(page),
        totalPages: Math.ceil(totalCoupons / limit),
      },
    });
  } catch (error) {
    console.log("Error:", error);
    res.status(500).json({
      code: 500,
      success: false,
      message: "Server error",
    });
  }
};

exports.getCouponById = async(req,res)=>{
    try{
        const data = req.query;
        const couponId = req.params.id;
        const coupon = await Middlewear.FindById(Coupon,couponId);
        if(!coupon){
            return res.status(404).json({
                code: 404,
                success: false,
                message: "Coupon not found",
            });
        }
        return res.status(200).json({
            code: 200,
            success: true,
            message: "Coupon fetched successfully",
            data: coupon,
        });
    }catch(error){
        console.log("error", error);
    }
};

exports.deleteCoupon = async(req,res)=>{
    try{
        const couponId = req.params.id;
        const coupon = await Middlewear.FindByIdAndDelete(Coupon,couponId);
        if(!coupon){
            return res.status(404).json({
                code: 404,
                success: false,
                message: "Coupon not found",
            });
        }
        return res.status(200).json({
            code: 200,
            success: true,
            message: "Coupon deleted successfully",
            data: coupon,
        });
    }catch(error){
        console.log("error", error);
    }
};



exports.updateCoupon = async(req,res)=>{
    try{
        const couponId = req.params.id;
        const data = req.body;
        const coupon = await Middlewear.FindByIdAndUpDate(Coupon,couponId,data);
        if(!coupon){
            return res.status(404).json({
                code: 404,
                success: false,
                message: "Coupon not found",
            });
        }
        return res.status(200).json({
            code: 200,
            success: true,
            message: "Coupon updated successfully",
            data: coupon,
        });
    }catch(error){
        console.log("error", error);
    }
}