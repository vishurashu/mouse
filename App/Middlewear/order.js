const dotenv = require("dotenv");
dotenv.config();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const { configDotenv } = require("dotenv");
const { createOrder } = require("../Controller/order");

module.exports = {
  async CreateOder(model, data) {
    try {
      const order = new model(data);
      const item = await order.save();
      return item; // Resolve the promise with the found item
    } catch (err) {
      console.log(err);
      throw err; // Re-throw the error to reject the promise
    }
  },

  async FindAllOrder(model, data,userId) {
    try {
      const { page = 1, limit = 10 } = data;
      const skip = (page - 1) * limit;
      const object = {
        userId:new mongoose.Types.ObjectId(userId)
      }
      if(data.filter){
        object.paymentMode = data.filter
      }
      if(data.orderStatus){
        object.orderStatus = data.orderStatus
      }
      if (data.search) {
        object.$or = [
          { orderStatus: { $regex: data.search, $options: 'i' } },
          { paymentMode: { $regex: data.search, $options: 'i' } },
          {"userdetails.email":{ $regex: data.search, $options: 'i' }}
        ];
      }
      const items = await model.aggregate([
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "userdetails"
          }
        },
        {
          $unwind: "$userdetails"
        },
        {
          $lookup: {
            from: "products",
            localField: "orderObj.productId",
            foreignField: "_id",
            as: "productDetails"
          }
        },
        {
          $match:object
      },
        {
          $project: {
            amount: 1,
            paymentMode: 1,
            orderStatus: 1,
            orderObj:1,
            createdAt: 1,

            "userdetails.firstName": 1,
            "userdetails.lastName": 1,
            "userdetails.email": 1,
            "productDetails.productName": 1,
            "productDetails.category": 1,
            "productDetails.price": 1
          }
        },
        {
          $sort: { createdAt: -1 }
        },
        {
          $skip: (page - 1) * limit
        },
        {
          $limit: limit
        }
      ]);
      
      const totalItems = await model.countDocuments({});
      return {
        items,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: parseInt(page),
        totalItems,
      };
    } catch (err) {
      console.log(err);
      throw err;
    }
  },
  async FindAllOrderd(model, data,userId) {
    try {
      const { page = 1, limit = 10 } = data;
      const skip = (page - 1) * limit;
      const object = {
        // userId:userId
      }
      if(data.filter){
        object.paymentMode = data.filter
      }
      if(data.orderStatus){
        object.orderStatus = data.orderStatus
      }
      if (data.startDate || data.endDate) {
        object.createdAt = {};
        if (data.startDate) object.createdAt.$gte = new Date(data.startDate);
        if (data.endDate) object.createdAt.$lte = new Date(data.endDate);
      }
      
      if (data.search) {
        object.$or = [
          { orderStatus: { $regex: data.search, $options: 'i' } },
          { paymentMode: { $regex: data.search, $options: 'i' } },
          {"userdetails.email":{ $regex: data.search, $options: 'i' }}
        ];
      }
      const items = await model.aggregate([
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "userdetails"
          }
        },
        {
          $unwind: "$userdetails"
        },
        {
          $lookup: {
            from: "products",
            localField: "orderObj.productId",
            foreignField: "_id",
            as: "productDetails"
          }
        },
        {
          $match:object
      },
        {
          $project: {
            amount: 1,
            paymentMode: 1,
            orderStatus: 1,
            createdAt: 1,
            "userdetails.firstName": 1,
            "userdetails.lastName": 1,
            "userdetails.email": 1,
            "productDetails.productName": 1,
            "productDetails.category": 1,
            "productDetails.price": 1
          }
        },
        {
          $sort: { createdAt: -1 }
        },
        {
          $skip: (page - 1) * limit
        },
        {
          $limit: limit
        }
      ]);
      
      const totalItems = await model.countDocuments({});
      return {
        items,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: parseInt(page),
        totalItems,
      };
    } catch (err) {
      console.log(err);
      throw err;
    }
  },

  async AddToCart(model, data, price, userId ) {
    try {
      const cart = new model({
        userId: userId,
        produtctId: data.productId,
        price: price,
        discount: data.discount,
        finalAmount: data.finalAmount,
        total: price,
        size: data.size,
      });
      const item = await cart.save();
      return item; // Resolve the promise with the found item
    } catch (err) {
      console.log(err);
      throw err; // Re-throw the error to reject the promise
    }
  },


  
  
  async getCartDetails(model, data, id) {
    try {
      const object = new mongoose.Types.ObjectId(id);

      const cartDetails = await model.aggregate([
        {
          $match: {
            userId: object,
          },
        },
        {
          $lookup: {
            from: "products",
            localField: "produtctId", // ✅ Make sure the spelling is consistent!
            foreignField: "_id",
            as: "productDetails",
          },
        },
        {
          $unwind: "$productDetails",
        },
        {
          $project: {
            quantity: 1,
            price: 1,
            total: 1,
            size: 1,
            productDetails: {
              productId:"$productDetails._id",
              productName: "$productDetails.productName",
              price: "$productDetails.price",
              discount: "$productDetails.discount",
              finalAmount: "$productDetails.finalAmount",
              category: "$productDetails.category",
              thumbnail: "$productDetails.thumbnail",
              images: "$productDetails.images",
              description: "$productDetails.description",
            },
          },
        },
        {
          $facet: {
            cartItems: [
              { $match: {} }, // pass-through
            ],
            summary: [
              {
                $group: {
                  _id: null,
                  totalQuantity: { $sum: "$quantity" },
                  grandTotal: { $sum: "$total" },
                },
              },
            ],
          },
        },
        {
          $unwind: "$summary",
        },
        {
          $project: {
            cartItems: 1,
            totalQuantity: "$summary.totalQuantity",
            grandTotal: "$summary.grandTotal",
          },
        },
      ]);

      if (!cartDetails.length || cartDetails[0].cartItems.length === 0) {
        return {
          code: 404,
          success: false,
          message: "Cart is empty",
        };
      }

      return {
        code: 200,
        success: true,
        message: "Cart details",
        data: cartDetails[0].cartItems,
        totalQuantity: cartDetails[0].totalQuantity,
        grandTotal: cartDetails[0].grandTotal,
      };
    } catch (error) {
      console.log(error);
      return {
        code: 500,
        success: false,
        message: "Something went wrong",
      };
    }
  },

  async updateCart(model, cartId, userId, data) {
    console.log("inside", data, cartId, userId);
    try {
      const item = await model.findOne({ _id: cartId, userId: userId });
      console.log("item", item);

      // if (!item) {
      //   return {
      //     code: 404,
      //     success: false,
      //     message: "Cart not found",
      //   };
      // }

      // Safely extract and convert quantity
      // console.log("data", data);
      console.log("data quantity", data?.quantity);
      // console.log("data quantity", data?.quantity?.quantity);
      const quantity = parseInt(data?.quantity);

      if (isNaN(quantity)) {
        return {
          code: 400,
          success: false,
          message: "Invalid quantity provided",
        };
      }

      const total = item.price * quantity;
      console.log("total", total);

      const cart = await model.findOneAndUpdate(
        { _id: cartId },
        { quantity: quantity, total: total },
        { new: true }
      );
      return cart;
    } catch (error) {
      return error;
    }
  },

  async deleteCart(model, cartId, userId) {
    try {
      let item;
  
      if (cartId) {
        console.log(">>>vdvvdv")
        // Delete a specific cart item
        item = await model.findOneAndDelete({
          userId: userId,
          _id: cartId
        });
      } else {
        console.log("fghj")
        // Delete all cart items for the user
        item = await model.deleteMany({
          userId: userId
        });
      }
  
      console.log(">>>>>>>>>>>> deleteCart", item);
      return item;
    } catch (error) {
      console.log(error);
      return error;
    }
  },
  

  async findReview(model, data, userId) {
    try {
      const item = await model.findOne({
        $and: [
          { product: data },
          { userId: userId }
        ]
      });
      return item; // Resolve the promise with the found item
    } catch (err) {
      console.log(err);
      throw err; // Re-throw the error to reject the promise
    }
  },

  async getReview(model, data) {
    try {
      const object ={
        product: new mongoose.Types.ObjectId(data)
      }
      const reviews = await model.aggregate([
        {
          $match: object,
        },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "userDetails",
          },
        },
        {
          $unwind:{
            path: "$userDetails",
            preserveNullAndEmptyArrays: true,
          }
        },
        {
          $lookup:{
            from: "products",
            localField: "product",
            foreignField: "_id",
            as: "productDetails",
          }
        },
        {
          $unwind:{
            path: "$productDetails",
            preserveNullAndEmptyArrays: true,
          }
        },
        {
          $project: {
            userId: "$userDetails._id",
            firstName: "$userDetails.firstName",
            lastName: "$userDetails.lastName",
            email: "$userDetails.email",
            profile: "$userDetails.profile",
            productName: "$productDetails.productName",
            productImage: "$productDetails.thumbnail",
            rating: 1,
            review: 1,
            createdAt: 1,
            updatedAt: 1,
          },
        },
      ]);
      if (!reviews.length) {
        return {
          code: 404,
          success: false,
          message: "No reviews found",
        };
      }
      return reviews

    } catch (error) {
      console.log(error);
      return error;
    }
  },

  async updateOrderStatus(model, data, userId) {
    try {
      const { Status, OrderId } = data;
  
      if (!Status) {
        throw new Error("Status is required to update the order.");
      }
  
      const update = { orderStatus: Status };
  
      const item = await model.findOneAndUpdate(
        { _id: OrderId, userId },
        update,
        { new: true }
      );
  
      if (!item) {
        throw new Error("Order not found or you are not authorized to update it.");
      }
  
      return item;
  
    } catch (error) {
      console.error("Error updating order:", error.message);
      throw error; // So the caller knows it's an error
    }
  },

  
  async BannerImages(model, data,userId) {
    try {
      const { page = 1, limit = 10 } = data;
      const skip = (page - 1) * limit;
      const object = {
        // userId:new mongoose.Types.ObjectId(userId)
      }
      // if(data.filter){
      //   object.paymentMode = data.filter
      // }
      // if(data.orderStatus){
      //   object.orderStatus = data.orderStatus
      // }
      // if (data.search) {
      //   object.$or = [
      //     { orderStatus: { $regex: data.search, $options: 'i' } },
      //     { paymentMode: { $regex: data.search, $options: 'i' } },
      //     {"userdetails.email":{ $regex: data.search, $options: 'i' }}
      //   ];
      // }
      const items = await model.aggregate([
        // {
        //   $lookup: {
        //     from: "users",
        //     localField: "userId",
        //     foreignField: "_id",
        //     as: "userdetails"
        //   }
        // },
        // {
        //   $unwind: "$userdetails"
        // },
        // {
        //   $lookup: {
        //     from: "products",
        //     localField: "orderObj.productId",
        //     foreignField: "_id",
        //     as: "productDetails"
        //   }
        // },
        {
          $match:object
      },
        // {
        //   $project: {
        //     amount: 1,
        //     paymentMode: 1,
        //     orderStatus: 1,
        //     orderObj:1,
        //     createdAt: 1,

        //     "userdetails.firstName": 1,
        //     "userdetails.lastName": 1,
        //     "userdetails.email": 1,
        //     "productDetails.productName": 1,
        //     "productDetails.category": 1,
        //     "productDetails.price": 1
        //   }
        // },
        {
          $sort: { createdAt: -1 }
        },
        {
          $skip: (page - 1) * limit
        },
        {
          $limit: limit
        }
      ]);
      
      const totalItems = await model.countDocuments({});
      return {
        items,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: parseInt(page),
        totalItems,
      };
    } catch (err) {
      console.log(err);
      throw err;
    }
  },

  

  


};
