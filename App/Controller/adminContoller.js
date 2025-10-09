const express = require("express");
const bcrypt = require("bcrypt");
const Middlewear = require("../Middlewear/comman");
// import model here
const User = require("../Model/User");
const Cms = require("../Model/cms");
const Product = require("../Model/Product");
const { forgotPassword } = require("../Middlewear/emailer");
const Sale = require("../Model/sale");
const Company = require("../Model/company");
const Payment = require('../Model/payment')
const Order = require("../Model/order");
const Category = require("../Model/category");
const Banner = require("../Model/Banner")
exports.Register = async (req, res) => {
  try {
    const data = req.body;
    const item = await User.create(data);
    return res.json({
      code: 200,
      item: item,
    });
  } catch (error) {
    console.log("register", error);
  }
};

exports.Login = async (req, res) => {
  try {
    const data = req.body;
    const admin = await Middlewear.FindByEmail2(User, data);
    if (!admin) {
      return res.json({
        code: 404,
        success: false,
        message: "Email and password not found",
        data: {},
      });
    }
    const isPasswordValid = await admin.matchPassword(data.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        code: 404,
        success: false,
        message: "Email and password not found",
        data: {},
      });
    }
    const token = await Middlewear.CreateToken(admin._id, admin.role);
    admin.token = token;
    return res.json({
      code: 200,
      success: true,
      message: "Login Successfully",
      data: token,
    });
  } catch (error) {
    console.log(error);
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const data = req.body;
    if (!data.oldPassword || !data.newPassword) {
      return res.json({
        code: 400,
        success: false,
        message: "Please provide old and new password",
        data: {},
      });
    }
    const admin = await Middlewear.FindById(User, req.adminData);
    if (!admin) {
      return res.json({
        code: 404,
        success: false,
        message: "User not found",
        data: {},
      });
    }

    const isPasswordValid = await admin.matchPassword(data.oldPassword);
    if (!isPasswordValid) {
      return res.status(401).json({
        code: 401,
        success: false,
        message: "Invalid Password",
        data: {},
      });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.newPassword, salt);
    const newPassword = await Middlewear.UpdateOne(
      User,
      req.adminData,
      hashedPassword
    );
    return res.json({
      code: 200,
      success: true,
      message: "Password Updated Successfully",
      data: newPassword,
    });
  } catch (error) {
    console.log("updatePassword", error);
  }
};

exports.addProduct = async (req, res) => {
  try {
    
    const {
      productId,
      productName,
      price,
      discount,
      hight,
      length,
      weight,
      HsnCode,
      gender,
      description,
      returnDescription,
      returnPolicy,
      basicProductDescription,
      category,
      stock,
    } = req.body;
    console.log("req.body", req.body);
    console.log("req.files", req.files);

    // Convert stock fields from string to number (if needed)
    let stockData = {};
    try {
      stockData = JSON.parse(req.body.stock || "{}");

      // Ensure all values are numbers (defensive coding)
      console.log(">>>>>>>>>>>>>>>>>>.",stockData)
      Object.entries(stockData).forEach(([key, val]) => {
        stockData[key] = Number(val);

        console.log(">>>>>>>>>>>>>>>>>>.",stockData)  
      });
    } catch (e) {
      console.error("Invalid stock JSON:", e);
    }

    // Get image URLs
    
    // Multer saves the files to disk and gives us the file info here:
    const images = req.files.images
      ? req.files.images.map((file) => ({ url: file.filename }))
      : [];
    const thumbnail = req.files.thumbnail
      ? req.files.thumbnail[0].filename
      : "";

    const newProduct = await Product.create({
      productId,
      userId: req.adminData,
      productName,
      price,
      discount,
      hight,
      length,
      weight,
      HsnCode,
      gender,
      description,
      returnDescription,
      category,
      returnPolicy,
      basicProductDescription,
      stock: stockData,
      images,
      thumbnail: thumbnail ? `${thumbnail}` : null,
    });

    return res.status(200).json({
      success: true,
      message: "Product added successfully",
      data: newProduct,
    });
  } catch (error) {
    console.error("addProduct error:", error);
  }
};

// exports.getProduct = async (req, res) => {
//   try {
//     let { page, pageSize } = req.query;
//     page = parseInt(page, 10) || 1;
//     pageSize = parseInt(pageSize, 10) || 2;

//     const object = {};
//     if (req.query.category) {
//       object.category = req.query.category;
//     }
//     if(req.query.gender) {
//       object.gender = req.query.gender
//     }
//     if(req.query.high) {
//       object.sort(price=1)
//     }
//     if(req.query.low) {
//       object.sort(price=-1)
//     }

//     const totalArticles = await Product.countDocuments();
//     const articles = await Product.find({object})
//       .skip((page - 1) * pageSize)
//       .limit(pageSize);
//     if(articles.length === 0){
//       return res.status(404).json({
//         success: false,
//         message: "No products found",
//         data: [],
//       });
//     }
//     return res.status(200).json({
//       success: true,
//       message: "Product List",
//       data: {
//         items: articles,
//         metadata: {
//           totalCount: totalArticles,
//           totalPages: Math.ceil(totalArticles / pageSize),
//           currentPage: page,
//           pageSize
//         },
//       }
//     });
//   } catch (error) {
//     console.error("getProduct error:", error);
//   }
// };

exports.getProduct = async (req, res) => {
  try {
    let { page = 1, pageSize = 16, category, gender, high, low,search } = req.query;
    page = parseInt(page);
    pageSize = parseInt(pageSize);
    const filter = {};
    if (category) filter.category = category;
    if (gender) filter.gender = gender;
    let sort = {};
    if (high) sort.price = 1;
    if (low) sort.price = -1;
    if(search){
      filter.$or=[
        {productId:{$regex: data.search, $options: 'i'}},
        { productName: { $regex: data.search, $options: 'i' } },
      ]
    }
    
    const totalProducts = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .sort(sort)
      .skip((page - 1) * pageSize)
      .limit(pageSize);
    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No products found",
        data: [],
      });
    }
    return res.status(200).json({
      success: true,
      message: "Product List",
      data: {
        items: products,
        metadata: {
          totalCount: totalProducts,
          totalPages: Math.ceil(totalProducts / pageSize),
          currentPage: page,
          pageSize,
          imagePath:""
        },
      },
    });
  } catch (error) {
    console.error("getProduct error:", error);
  }
};

exports.getProductById = async (req, res) => {
  try {
    const data = req.params.id;
    if(!data){
      return res.json({
        code: 400,
        success: false,
        message: "Product id is required",
        data: {},
      });
    }
    const product = await Middlewear.productDetails(Product, data);
    if (!product) {
      return res.json({
        code: 404,
        success: false,
        message: "Product not found",
        data: {},
      });
    }
    return res.json({
      code: 200,
      success: true,
      message: "Product found",
      data: product[0],
    });
  } catch (error) {
    console.log("getProductById", error);
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const Id = req.params.id;
    if (!Id) {
      return res.status(400).json({
        code: 400,
        success: false,
        message: "Product ID is required",
        data: {},
      });
    }
    const product = await Product.findById(Id);
    if (!product) {
      return res.status(404).json({
        code: 404,
        success: false,
        message: "Product not found",
        data: {},
      });
    }
    const {
      productName,
      productId,
      price,
      discount,
      hight,
      length,
      weight,
      HsnCode,
      gender,
      description,
      returnDescription,
      category,
      returnPolicy,
      basicProductDescription,
    } = req.body;

    // Process stock data
    console.log(">>>>>>>>>>>>>>>>>", req.body);
    let stockData = {};
      try {
      stockData = JSON.parse(req.body.stock || "{}");

      // Ensure all values are numbers (defensive coding)
      console.log(">>>>>>>>>>>>>>>>>>.",stockData)
      Object.entries(stockData).forEach(([key, val]) => {
        stockData[key] = Number(val);

        console.log(">>>>>>>>>>>>>>>>>>.",stockData)  
      });
    } catch (e) {
      console.error("Invalid stock JSON:", e);
    }

    // Handle image uploads
    const images =
      req.files?.images?.map((file) => ({ url: file.filename })) || [];
    const thumbnail = req.files?.thumbnail?.[0]?.filename || "";

    // Build update object
    const updateData = {
      productName,
      productId,
      price,
      discount,
      hight,
      length,
      weight,
      HsnCode,
      gender,
      description,
      returnPolicy,
      basicProductDescription,
      returnDescription,
      category,
      stock: stockData,
    };

    if (images.length > 0) updateData.images = images;
    if (thumbnail) updateData.thumbnail = thumbnail;

    console.log("updateData", updateData);

    const updatedProduct = await Product.findByIdAndUpdate(Id, updateData, {
      new: true,
    });
    console.log("updatedProduct", updatedProduct);
    if (!updatedProduct) {
      return res.status(404).json({
        code: 404,
        success: false,
        message: "Product not found",
        data: {},
      });
    }

    return res.json({
      code: 200,
      success: true,
      message: "Product Updated Successfully",
      data: updatedProduct,
    });
  } catch (error) {
    console.error("updateProduct error:", error);
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const data = req.params.id;
    if (!data) {
      return res.json({
        code: 400,
        success: false,
        message: "Product id is required",
        data: {},
      });
    }
    const product = await Middlewear.FindById(Product, data);
    if (!product) {
      return res.json({
        code: 404,
        success: false,
        message: "Product not found",
        data: {},
      });
    }
    await Product.findByIdAndDelete(data);
    return res.json({
      code: 200,
      success: true,  
      message: "Product Deleted Successfully",
      data: {},
    });
  } catch (error) {
    console.log("deleteProduct", error);
  }
};



exports.Cms = async (req, res) => {
  try {
    if (req.role !== "admin") {
      return res.json({
        code: 403,
        success: false,
        message: "You are not authorized to create cms",
        data: {},
      });
    }
    const data = req.body;
    console.log("data", data);
    if (!data.type) {
      return res.json({
        status: false,
        message: "Type is required",
      })
    }
    console.log("Cms", data);
    const cms = await Middlewear.CreateCms(Cms, data);
    return res.json({
      code: 200,
      success: true,
      message: "Cms created successfully",
      data: cms,
    });
  } catch (error) {
    console.log("Cms", error);
  }
};

exports.getCms = async (req, res) => {
  try { 
    const data = req.query;
    const cms = await Cms.findOne({ type: data.type });
    if (!cms) {
      return res.json({
        code: 404,
        success: false,
        message: "Cms not found",
        data: {},
      });
    }
    return res.json({
      code: 200,
      success: true,
      message: "Cms found",
      data: cms,
    });
  } catch (error) {
    console.log("getCms", error);
  }
};


exports.getAllUser = async(req,res)=>{
  try{
    const data = req.query;
    const item = await Middlewear.FindAllUser(User,data);
    if(!item){
      return res.json({
        code: 404,
        success: false,
        message: "User not found",
        data: [],
      });
    }
    return res.json({
      code: 200,
      success: true,
      message: "User List",
      data: item,
    });

  }catch(error){
    console.log("getAllUser", error);
  }
}

exports.forgotPassword = async(req,res)=>{
  try{
    const data = req.body;
    const email = await Middlewear.FindByEmail(User, data);
    if(!email){
      return res.json({
        code: 404,
        success: false,
        message: "Email not found",
        data: {},
      });
    }
    const link = `http://localhost:3000/resetpassword/${email._id}`;
    console.log("link", link);
    const mail = await forgotPassword(email.email, link);
    if(mail.success){
      return res.json({
        code: 200,
        success: true,
        message: "Email sent successfully",
        data: {},
      });
    }
    return res.json({
      code: 404,
      success: false,
      message: "Email not sent",
      data: {},
    });
  }catch(error){
    console.log("forgotPassword", error);
  }
};


exports.refreshToken = async(req,res)=>{
  try{
    const token = req.adminData
    const item = await Middlewear.FindById(User,token);
    const newToken = await Middlewear.CreateToken(decoded._id, decoded.role);
    return res.json({
      code: 200,
      success: true,
      message: "Token refreshed successfully",
      data: newToken,
    });
  }catch(err){
    console.log("refreshToken", err);
  }
};

exports.createSale = async(req,res)=>{
  try{
    const data = req.body;
    data.userId = req.adminData;
    console.log("data", req.files);
    if(req.files?.image){
      data.image = req.files.image[0].filename;
    }
    if(req.files?.mobileImage){
      data.mobileIamge = req.files.mobileImage[0].filename;
    }
    const item = await Sale.create(data);
    if(!item){
      return res.json({
        code: 404,
        success: false,
        message: "Sale not created",
        data: {},
      });
    }
    return res.json({
      code: 200,
      success: true,
      message: "Sale created successfully",
      data: item,
    });

  }catch(error){
    console.log("createSale", error);
  }
} ;


exports.getSale = async(req,res)=>{
  try{
    const data = req.query;
    console.log("data", data);
    const item = await Middlewear.getAllcoupan(Sale,req.adminData);
    if(!item){
      return res.json({
        code: 404,
        success: false,
        message: "Sale not found",
        data: {},
      });
    }
    return res.json({
      code: 200,
      success: true,
      message: "Sale List",
      data: item,
    });

  }catch(error){
    console.log("getSale", error);
  }
};


exports.updateSale = async(req,res)=>{
  try{
    const data = req.params.id;
    if(!data){
      return res.json({
        code: 400,
        success: false,
        message: "Sale id is required",
        data: {},
      });
    }
    const item = await Middlewear.FindById(Sale, data);
    if(!item){
      return res.json({
        code: 404,
        success: false,
        message: "Sale not found",
        data: {},
      });
    }
    const object = {}
    if(req.files?.image){
      object.image = req.files.image[0].filename;
    }
    if(req.files?.mobileImage){
      object.mobileImage = req.files.mobileImage[0].filename;
    }
    if(req.body.saleName){
      object.saleName = req.body.saleName;
    }
    if(req.body.discount){
      object.discount = req.body.discount;
    }
    if(req.body.status){
      object.status = req.body.status;
    }

    if(req.body.stratDate){
      object.stratDate = req.body.stratDate;
    }
    if(req.body.endDate){
      object.endDate = req.body.endDate;
    }
    if(req.body.categoryId){
      object.categoryId = req.body.categoryId;
    }
    const updatedItem = await Sale.findByIdAndUpdate(data, object, {new:true});
    return res.json({
      code: 200,
      success: true,
      message: "Sale updated successfully",
      data: updatedItem,
    });
  }catch(error){
    console.log("updateSale", error);
  }
};


exports.getSaleById = async(req,res)=>{
  try{
    const data = req.params.id;
    if(!data){
      return res.json({
        code: 400,
        success: false,
        message: "Sale id is required",
        data: {},
      });
    }
    const item = await Middlewear.FindById(Sale, data);
    if(!item){
      return res.json({
        code: 404,
        success: false,
        message: "Sale not found",
        data: {},
      });
    }
    return res.json({
      code: 200,
      success: true,
      message: "Sale found",
      data: item,
    });

  }catch(error){
    console.log("getSaleById", error);
  }
};

exports.deleteSale = async(req,res)=>{
  try{
    const data = req.params.id;
    if(!data){
      return res.json({
        code: 400,
        success: false,
        message: "Sale id is required",
        data: {},
      });
    }
    const item = await Middlewear.FindByIdAndDelete(Sale, data);
    if(!item){
      return res.json({
        code: 404,
        success: false,
        message: "Sale not found",
        data: {},
      });
    }
    return res.json({
      code: 200,
      success: true,
      message: "Sale deleted successfully",
      data: {},
    });
  }catch(error){
    console.log("deleteSale", error);
  }
};

exports.dashboard = async(req,res)=>{
  try{
    const custumer = await User.countDocuments();
    const product = await Product.countDocuments();
    // const sale = await Sale.countDocuments();
    // const order = await Order.countDocuments();
    // const coupon = await Coupon.countDocuments();
    const data = {
      custumer,
      product,
      revenue: 0,
      sale: 0,
    }
    return res.json({
      code: 200,
      success: true,
      message: "Dashboard data",
      data: data,
    });

  }catch(error){
    console.log("dashboard", error);
  }
};


exports.createComany = async(req,res)=>{
  try{
    const data = req.body;
    const item = await Company.create(data);
    if(!item){
      return res.json({
        code: 404,
        success: false,
        message: "Company not created",
        data: {},
      });
    }
    return res.json({
      code: 200,
      success: true,
      message: "Company created successfully",
      data: item,
    });

  }catch(error){
    console.log("createComany", error);
  }
};

exports.getCompany = async(req,res)=>{
  try{
    const data = req.query
    const item = await Company.find()
    if(!item){
      return res.json({
        code: 404,
        success: false,
        message: "company not found ",
        data: [],
      });
    }
    return res.json({
      code: 200,
      success: true,
      message: "Company gets  successfully",
      data: item,
    });

  }catch(error){
    console.log("getComapny",error)
  }
};


exports.getpaymnet = async(req,res)=>{
  try{
    const data = req.query
    const object = {}
    if (data.search) {
      object.$or = [
        { payment_id: { $regex: data.search, $options: 'i' } },
        { razorpay_signature: { $regex: data.search, $options: 'i' } }
        // Add more direct fields if needed
      ];
    }
    if(data.method){
      object.method = data.method 
    }
    const item = await Payment.find(object)
    return res.json({
      code:200,
      success: true,
      data:item
    })

  }catch(error){
    console.log(error)
  }
};


exports.updateOrderStatus = async (req, res) => {
  try {
    const { id, orderStatus } = req.body;
    console.log(id,orderStatus)

    if (!id) {
      return res.status(400).json({
        code: 400,
        success: false,
        message: "Missing 'id' in request body",
      });
    }

  
    const jnjnfe = await Payment.findOne({_id:id})
    console.log(">>>>>>>>>>>>>",jnjnfe)
    const updatedItem = await Order.findOneAndUpdate({_id:id}, {orderStatus}, { new: true });

    if (!updatedItem) {
      return res.status(404).json({
        code: 404,
        success: false,
        message: "Payment record not found",
      });
    }

    return res.status(200).json({
      code: 200,
      success: true,
      data: updatedItem,
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    
  }
};



exports.updateUserStatus = async (req, res) => {
  try {
    const data = req.body;
    const item = await User.findOneAndUpdate(
      {
        _id: data.userId,
        role: "user"
      },
      {
        status: data.status
      },
      {
        new: true // <-- this should be inside the options object
      }
    );
    return res.json({
      success: true,
      message: "User status updated successfully",
      data: item
    });

  } catch (error) {
    console.log(error);
  }
};

exports.UserDetails = async(req,res)=>{
  try{
    const data = req.query;
    const item = await Middlewear.UserDeetails(User,data)
    return res.json({
      code:200,
      success:true,
      data:item
    })

  }catch(error){
    console.log(error)
  }
};

exports.AddCategory = async (req, res) => {
  try {
    const data = req.body;

    if (!data.category) {
      return res.status(400).json({
        code: 400,
        message: "Category is missing"
      });
    }

    const isExist = await Category.findOne({ categoryType: data.category });

    if (isExist) {
      return res.status(409).json({
        code: 409,
        message: "Category already exists"
      });
    }

    const item = await Category.create({
      userId: req.adminData,  // Ensure req.adminData is a valid user ID
      categoryType: data.category
    });

    return res.status(201).json({
      code: 201,
      message: "Category created successfully",
      data: item
    });

  } catch (error) {
    console.error("AddCategory error:", error);
  }
};

exports.getAllCategory = async(req,res)=>{
  try{
    const data = req.query;
    const item = await Middlewear.getAllCatrgory(Category,data)
    if(!item){
      return res.json({
        code:404,
        success:false,
        data:[]
      })
    }
    return res.json({
      code:200,
      success:true,
      data:item
    })
  }catch(error){
    console.log(error)
  }
} ;

exports.updateCategory = async (req, res) => {
  try {
    const data = {
      ...req.query,
      ...req.body
    };

    // Validation
    if (!data.id || !data.categoryType) {
      return res.status(400).json({
        code: 400,
        success: false,
        message: "Missing 'id' or 'categoryType'"
      });
    }

    const item = await Middlewear.FindByIdAndUpDate(Category, data.id, {
      categoryType: data.categoryType
    });

    if (!item) {
      return res.status(404).json({
        code: 404,
        success: false,
        message: "Category not found"
      });
    }

    return res.status(200).json({
      code: 200,
      success: true,
      message: "Category updated successfully",
      data: item
    });

  } catch (error) {
    console.error("updateCategory error:", error);
  }
};

exports.DeleteCategory = async (req, res) => {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({
        code: 400,
        success: false,
        message: "Missing 'id'"
      });
    }

    const item = await Middlewear.FindByIdAndDelete(Category, id);

    if (!item) {
      return res.status(404).json({
        code: 404,
        success: false,
        message: "Category not found"
      });
    }

    return res.status(200).json({
      code: 200,
      success: true,
      message: "Category deleted successfully",
    });

  } catch (error) {
    console.error("DeleteCategory error:", error);
  }
};

exports.viewCategory = async(req,res)=>{
  try{
    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>")
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({
        code: 400,
        success: false,
        message: "Missing 'id'"
      });
    }
    console.log(">>>>>>>>>>>>>>id",id)
    const item = await Middlewear.FindById(Category,id)
    return res.json({
      code:200,
      success:true,
      data:item
    })
  }catch(errro){
    console.log(errro)
  }
};

exports.addBanner = async (req, res) => {
  try {
    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", req.files)
    const data = req.body;
    const files = req.files.map(file => ({
      url: file.filename  // or use file.path if storing URLs
    }));
    const item = await Middlewear.createBanner(Banner,
      data,
      files,
    );
    return res.json({
      code: 200,
      success: true,
      data: item,
    });
  } catch (error) {
    console.log(error);
  }
};

exports.UpdateBanner = async (req, res) => {
  try {
    const { bannerId, imageId } = req.body;
    const file = req.file; // Uploaded file

    if (!bannerId || !imageId || !file) {
      return res.status(400).json({
        code: 400,
        success: false,
        message: "Missing required fields (bannerId, imageId, or file)",
      });
    }

    const banner = await Banner.findOne({ _id: bannerId });
    if (!banner) {
      return res.status(404).json({
        code: 404,
        success: false,
        message: "Banner not found",
      });
    }

    // Update image URL for the matching imageId
    const updatedImages = banner.images.map((img) =>
      img._id.toString() === imageId
        ? { ...img.toObject(), url: file.filename }
        : img
    );

    banner.images = updatedImages;
    await banner.save();

    return res.json({
      code: 200,
      success: true,
      message: "Banner image updated successfully",
      data: banner,
    });
  } catch (error) {
    console.log(error);
  }
};

// exports.DeleteBannerImage = async(req,res)=>{
//   try{
//     const { bannerId, imageId } = req.body;
//     if (!bannerId || !imageId) {
//       return res.status(400).json({
//         code: 400,
//         success: false,
//         message: "Missing required fields (bannerId, imageId)",
//       });
//     };
//     const banner = await Banner.findOne({ _id: bannerId });
//     if (!banner) {
//       return res.status(404).json({
//         code: 404,
//         success: false,
//         message: "Banner not found",
//       });
//     }
//     const updatedImages = banner.images.map((img) =>
//       img._id.toString() === imageId
//         ? { ...img.toObject(), url: file.filename }
//         : img
//     );

//     banner.images = updatedImages;
//     await banner.save();

//   }catch(error){
//     console.log(error)
//   }
// };



exports.DeleteBannerImage = async (req, res) => {
  try {
    const { bannerId, imageId } = req.body;

    if (!bannerId || !imageId) {
      return res.status(400).json({
        code: 400,
        success: false,
        message: "Missing required fields (bannerId, imageId)",
      });
    }

    const banner = await Banner.findOne({ _id: bannerId });
    if (!banner) {
      return res.status(404).json({
        code: 404,
        success: false,
        message: "Banner not found",
      });
    }

    const originalLength = banner.images.length;
    banner.images = banner.images.filter(
      (img) => img._id.toString() !== imageId
    );

    if (banner.images.length === originalLength) {
      return res.status(404).json({
        code: 404,
        success: false,
        message: "Image not found in banner",
      });
    }

    await banner.save();

    return res.status(200).json({
      code: 200,
      success: true,
      message: "Image deleted successfully",
      data: banner,
    });
  } catch (error) {
    console.log(error);
  }
};


exports.getbanner = async(req,res)=>{
  try{
    const data = req.query;
    const item = await Middlewear.BannerImages(Banner,data);
    return res.json({
      code:200,
      success: true,
      data:item
    })
  }catch(error){
    console.log(error)
  }
};

exports.getBannerdetails = async(req,res)=>{
  try{
    const data = req.query;
    const item = await Middlewear.FindById(Banner,data.id)
    return res.json({
      code:200,
      success: true,
      data:item
    })

  }catch(error){
    console.log(error)
  }
}










