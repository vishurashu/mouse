const mongoose = require("mongoose");
const CouponSchema = new mongoose.Schema(
  {
   name:{
    type:String,
    required:true,
   },
   discount:{
    type:Number,
    required:true,
   },
   mimimumAmount:{
    type:Number,
    required:true,
   },
   maxDiscount:{
    type:Number,
    required:true,
   },
   firstTime:{
    type:String,
    enum:["true","false"],
    default:"true",
   },
    expiryDate:{
     type:Date,
     required:true,
    },
    CoupanUsage:{
     type:String,
     enum:["single","multiple"],
     default:"single",
    },
    category:{
     type:String,
     enum:["shirt","pant","tshirt","all"],
     default:"all",
    },
    categoryId:{
      type:mongoose.Schema.Types.ObjectId,
      ref:"category"
    },
    status:{
     type:String,
     enum:["active","inactive"],
     default:"active",
    },
    userId:{
     type:mongoose.Schema.Types.ObjectId,
     ref:"User",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Coupon", CouponSchema);