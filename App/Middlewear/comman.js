const dotenv = require("dotenv");
dotenv.config();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const { configDotenv } = require("dotenv");
const { pipeline } = require("nodemailer/lib/xoauth2");

module.exports = {
  async FindByEmail(model, data) {
    try {
      const item = await model.findOne({ email: data.email });
      return item; // Resolve the promise with the found item
    } catch (err) {
      console.log(err);
      throw err; // Re-throw the error to reject the promise
    }
  },
  async FindByEmail2(model, data) {
    try {
      const item = await model.findOne({ email: data.email,status:"active" ,role:"admin"});
      return item; // Resolve the promise with the found item
    } catch (err) {
      console.log(err);
      throw err; // Re-throw the error to reject the promise
    }
  },

  async FindByAddressType(model, data) {
    try {
      const item = await model.findOne({ type: data.type == "primary" });
      return item; // Resolve the promise with the found item
    } catch (err) {
      console.log(err);
      throw err; // Re-throw the error to reject the promise
    }
  },

  async FindById(model, data) {
    try {
      if (!data) {
        throw new Error("id is missing");
      }
      const item = await model.findOne({ _id: data });
      return item; // Resolve the promise with the found item
    } catch (err) {
      console.log(err);
      throw err; // Re-throw the error to reject the promise
    }
  },
  async CreateToken(userId, role) {
    try {
      const token = jwt.sign(
        { id: userId, role: role },
        process.env.JWT_SECRET
        // { expiresIn: "1h" }
      );
      return token;
    } catch (error) {
      console.log("CT error", error);
      throw error;
    }
  },

  async UpdateOne(model, id, data) {
    try {
      const item = await model.findOneAndUpdate(
        { _id: id },
        { $set: { password: data } },
        { new: true }
      );
      console.log("item", item);
      return item;
    } catch (err) {
      console.log(err);
    }
  },

  async CreateOne(model, data) {
    try {
      const item = await model.findOneAndUpdate({ type: data.type }, data, {
        upsert: true,
        new: true,
        runValidators: true,
      });
      return item;
    } catch (error) {
      throw error;
    }
  },

  async FindByType(model, data) {
    try {
      const item = await model.findOne({ type: data.type });
      return item;
    } catch (error) {
      throw error;
    }
  },

  async UpdateProfile(model, id, data) {
    try {
      const updateFields = {};
      const fieldsToUpdate = ["image", "firstName", "lastName", "email", "bio"];
  
      fieldsToUpdate.forEach((field) => {
        if (data[field]) {
          updateFields[field] = data[field];
        }
      });
  
      const updatedItem = await model.findByIdAndUpdate(
        new mongoose.Types.ObjectId(id),
        updateFields,
        { new: true }
      );
  
      return updatedItem;
    } catch (error) {
      throw error;
    }
  },
  

  async CreateOne(model, data) {
    try {
    } catch (error) {
      throw error;
    }
  },

  async CreateCms(model, data) {
    try {
     
      const obj = {
        type: data.type,
      };
      const item = await model.findOneAndUpdate(obj, data, {
        upsert: true, // Insert if not found
        new: true, // Return the new/updated doc
        runValidators: true, // Run schema validators
      });

      return item;
    } catch (error) {
      throw error;
    }
  },

  async FindAllUser(model, data) {
    try {
      const { page = 1, limit = 10 } = data;
      const skip = (page - 1) * limit;
      const object = {
        role:"user"
      }; // Match all documents
  
      const items = await model.aggregate([
        {
          $match: object
        },
        {
          $lookup: {
            from: "orders",
            localField: "_id",
            foreignField: "userId",
            as: "orders"
          }
        },
        {
          $addFields: {
            orderCount: { $size: "$orders" } // Add order count
          }
        },
        {
          $lookup: {
            from: "addresses",
            localField: "_id",   // <- this is missing
            foreignField: "userId",
            as: "userAddress"
          }
        },
        {
          $skip: skip
        },
        {
          $limit: limit
        },
        {
          $project: {
            firstName: 1,
            lastName: 1,
            email: 1,
            role: 1,
            bio: 1,
            status:1,
            createdAt: 1,
            updatedAt: 1,
            orderCount: 1 ,
            userAddress:1
          }
        }
      ]);
  
      const totalItems = await model.countDocuments({});

      console.log("items", items);
  
      return {
        items,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: parseInt(page),
        totalItems
      };
  
    } catch (error) {
      console.log(error);
    }
  },

  async getAllcoupan(model, data) {
    try {
      console.log("data", data);
      const { page = 1, limit = 10 } = data;
      const skip = (page - 1) * limit;
      const object = {}; // Match all documents
      if(data){
        object.userId = new mongoose.Types.ObjectId(data)
      }
  
      const items = await model.aggregate([
        {
          $match: object
        },
        // {
        //   $lookup: {
        //     from: "orders",
        //     localField: "_id",
        //     foreignField: "userId",
        //     as: "orders"
        //   }
        // },
        // {
        //   $addFields: {
        //     orderCount: { $size: "$orders" } // Add order count
        //   }
        // },
        {
          $skip: skip
        },
        {
          $limit: limit
        },
        // {
        //   $project: {
        //     firstName: 1,
        //     lastName: 1,
        //     email: 1,
        //     role: 1,
        //     bio: 1,
        //     createdAt: 1,
        //     updatedAt: 1,
        //     orderCount: 1 // Include the order count in final output
        //   }
        // }
      ]);
  
      const totalItems = await model.countDocuments({});

      console.log("items", items);
  
      return {
        items,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: parseInt(page),
        totalItems
      };
  
    } catch (error) {
      console.log(error);
    }
  },
  async getAllCatrgory(model, data) {
    try {
      console.log("data", data);
      const { page = 1, limit = 10 } = data;
      const skip = (page - 1) * limit;
      const object = {}; // Match all documents
      if(data){
        // object.userId = new mongoose.Types.ObjectId(data)
      }
  
      const items = await model.aggregate([
        {
          $match: object
        },
        {
          $sort:{
            createdAt:-1
          }
        },
        // {
        //   $lookup: {
        //     from: "orders",
        //     localField: "_id",
        //     foreignField: "userId",
        //     as: "orders"
        //   }
        // },
        // {
        //   $addFields: {
        //     orderCount: { $size: "$orders" } // Add order count
        //   }
        // },
        {
          $skip: skip
        },
        {
          $limit: limit
        },
        // {
        //   $project: {
        //     firstName: 1,
        //     lastName: 1,
        //     email: 1,
        //     role: 1,
        //     bio: 1,
        //     createdAt: 1,
        //     updatedAt: 1,
        //     orderCount: 1 // Include the order count in final output
        //   }
        // }
      ]);
  
      const totalItems = await model.countDocuments({});

      console.log("items", items);
  
      return {
        items,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: parseInt(page),
        totalItems
      };
  
    } catch (error) {
      console.log(error);
    }
  },

  async FindByIdAndDelete (model, id) {
    try {
      const item = await model.findByIdAndDelete(id);
      return item;
    } catch (err) {
      console.log(err);
      throw err; // Re-throw the error to reject the promise
    }
  },

  async FindByIdAndUpDate (model, id, data) {
    try{
      const item = await model.findOneAndUpdate(
        { _id: id },
        { $set: data },
        { new: true }
      );
      return item;
    }catch(error){
      console.log("error", error);
      throw error;
    }
  },


  

  async productDetails(model, data) {
    try {
      console.log
      const object = {
        _id: new mongoose.Types.ObjectId(data)
      };
  
      const item = await model.aggregate([
        {
          $match: object
        },
        {
          $lookup: {
            from: "reviews",
            let: { id: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$product", "$$id"]
                  }
                }
              },
              {
                $lookup: {
                  from: "users",
                  localField: "userId",
                  foreignField: "_id",
                  as: "userDetails"
                }
              },
              {
                $unwind: {
                  path: "$userDetails",
                  preserveNullAndEmptyArrays: true
                }
              }
            ],
            as: "reviews"
          }
        },
     
      ]);
  
      return item;
  
    } catch (error) {
      return error;
    }
  },
  async productDetailse(model, data) {
    try {
      const object = {
        // _id: new mongoose.Types.ObjectId(data)
      };
  
      const item = await model.aggregate([
        {
          $match: object
        },
        {
          $lookup: {
            from: "reviews",
            let: { id: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$product", "$$id"]
                  }
                }
              },
              {
                $lookup: {
                  from: "users",
                  localField: "userId",
                  foreignField: "_id",
                  as: "userDetails"
                }
              },
              {
                $unwind: {
                  path: "$userDetails",
                  preserveNullAndEmptyArrays: true
                }
              }
            ],
            as: "reviews"
          }
        },
     
      ]);
  
      return item;
  
    } catch (error) {
      return error;
    }
  },

  async UserDeetails(model,data){
    try{
      const object = {
        _id:new mongoose.Types.ObjectId(data.id)
      }
      const item = await model.aggregate([
        {
          $match: object
        },
        {
          $lookup: {
            from: "orders",
            localField: "_id",
            foreignField: "userId",
            as: "orders"
          }
        },
        {
          $addFields: {
            orderCount: { $size: "$orders" } // Add order count
          }
        },
        {
          $lookup: {
            from: "addresses",
            localField: "_id",   // <- this is missing
            foreignField: "userId",
            as: "userAddress"
          }
        },
        {
          $project: {
            firstName: 1,
            lastName: 1,
            email: 1,
            role: 1,
            bio: 1,
            createdAt: 1,
            updatedAt: 1,
            orderCount: 1 ,
            userAddress:1
          }
        }
      ]);

      return item

    }catch(error){
      console.log(error)
    }
  },


  async createBanner(model, data, images) {
    try {
      console.log(">>>>>>>>>>>>images",images)
      if (images && images.length > 0) {
        data.images = images;
      }
  
      const item = await model.create(data);
      return item;
    } catch (error) {
      console.log(error);
      throw error;
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
