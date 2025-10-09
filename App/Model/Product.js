const mongoose = require('mongoose');
const imageSchema = new mongoose.Schema({
    url:{
        type:String,
        required:true,
    }
})
const ProductSchema = new mongoose.Schema(
  {
   productId:{
    type:Number,
    required:true,
   },
   userId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User",
   },
   productName:{
    type:String,
   },
   price:{
    type:Number,
   },
   discount:{
    type:String,
   },
   hight:{
    type:String,
   },
   length:{
    type:String,
   },
   weight:{
    type:String,
   },
   HsnCode:{
    type:String,
   },
   returnPolicy:{
    type:String,
   },
   basicProductDescription:{
    type:String,
   },
   gender:{
    type:String,
    enum:["men","women","unisex"],
    default:"men"
   },
   thumbnail:{
    type:String,
   },
   images:{
    type:[imageSchema],
   },

    description:{
     type:String,
    },
    returnDescription:{
        type:String,
    },
    category:{
        type:String,
        enum:["shirts","jackets","pants"],
        default:"shirts"
    },
    
    stock: {
      type: Map,
      of: Number,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.Product || mongoose.model('Product', ProductSchema);

