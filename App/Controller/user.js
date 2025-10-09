const mongoose = require("mongoose");
const bcrypt = require("bcrypt"); 
const Middlewear = require("../Middlewear/comman");
const Address = require("../Model/address");

// models
const User = require("../Model/User");
const Product = require("../Model/Product")

const registerUser = async (req) => {
  try {
    const user = new User({
      firstName: req.firstName,
      lastName: req.lastName,
      email: req.email,
      password: req.password,
      role: "user",
      // image: req.file.filename,
      bio: req.bio,
    });

    const savedUser = await user.save(); // Now returns a Promise
    return savedUser;
  } catch (err) {
    throw err;
  }
};


exports.getProductById = async (req, res) => {
  try {
    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>")
    const data = req.params.id;
    if(!data){
      return res.json({
        code: 400,
        success: false,
        message: "Product id is required",
        data: {},
      });
    }
    const product = await Middlewear.productDetailse(Product, data);
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

exports.Register = async (req, res) => {
  try {
    console.log(">>>>>>>>>>>>>>test");
    const data = req.body;
    const emailExist = await Middlewear.FindByEmail(User, data);
    if (emailExist) {
      return res.json({
        code: 400,
        success: false,
        message: "Email already exists",
      });
    }
    const item = await registerUser(data);
    const token = await Middlewear.CreateToken(item._id, item.role);
    res.json({
      code: 200,
      success: true,
      message: "User registered successfully",
      data: item,
      token: token,
    });
  } catch (err) {
    console.log(err);
  }
};

exports.Login = async (req, res) => {
  try {
    const data = req.body;

    const user = await Middlewear.FindByEmail(User, data);
    if (!user) {
      return res.status(400).json({
        code: 400,
        success: false,
        message: "Incorrect email or password",
      });
    }

    if (user.status === "deactive") {
      return res.status(403).json({
        code: 403,
        success: false,
        message: "Your account is deactivated. Please contact the administrator.",
      });
    }

    const isMatch = await user.matchPassword(data.password);
    if (!isMatch) {
      return res.status(400).json({
        code: 400,
        success: false,
        message: "Incorrect email or password",
      });
    }

    const token = await Middlewear.CreateToken(user._id, user.role);
    res.status(200).json({
      code: 200,
      success: true,
      message: "User logged in successfully",
      data: user,
      token: token,
    });

  } catch (err) {
    console.error("Login Error:", err);
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
    const admin = await Middlewear.FindById(User,req.userData);
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
      req.userData,
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


exports.getProfile = async(req,res)=>{
    try{
        const user = await Middlewear.FindById(User,req.userData);
        if(!user){
            return res.json({
                code: 404,
                success: false,
                message: "User not found",
                data: {}
            })
        }
        return res.json({
            code: 200,
            success: true,
            message: "User Profile",
            data: user
        })

    }catch(err){
        console.log(err)
    }
};

exports.updateProfile = async (req, res) => {
  try {
    const data = { ...req.body };

    if (req.file && req.file.filename) {
      data.image = req.file.filename;
    }

    const user = await Middlewear.UpdateProfile(User, req.userData, data);

    if (!user) {
      return res.status(404).json({
        code: 404,
        success: false,
        message: "User not found",
        data: {}
      });
    }

    return res.status(200).json({
      code: 200,
      success: true,
      message: "User updated successfully",
      data: user
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      code: 500,
      success: false,
      message: "Internal server error",
      data: {}
    });
  }
};



exports.addAddress = async(req,res)=>{
  try{
    const data = req.body;
    const addressType = await Middlewear.FindByAddressType(Address, data)
    if(addressType){
        return res.json({
          code: 404,
          success: false,
          message: "Address type already exists",
          data: {}
        })
    }
    // const user = await Middlewear.FindByEmail(Address,data);
    // if(user){
    //   return res.json({
    //     code: 404,
    //     success: false,
    //     message: "User address already exists",
    //     data: {}
    //   })
    // }
    const address = new Address({
      address1: data.address1,
      address2: data.address2,
      city: data.city,
      state: data.state,
      country: data.country,
      pincode: data.pincode,
      userId: req.userData,
      isDefault: data.isDefault || false,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      email: data.email,
      landmark:data.landmark,
      type:data.type
    })
    const savedAddress = await address.save();
    return res.json({
      code: 200,
      success: true,
      message: "Address added successfully",
      data:savedAddress
    })

  }catch(err){
    console.log(err)
  }
};


exports.getAddress = async(req,res)=>{
  try{
    const address = await Middlewear.getAllcoupan(Address,req.userData);
    if(!address){
      return res.json({
        code: 404,
        success: false,
        message: "Address not found",
        data: {}
      })
    }
    return res.json({
      code: 200,
      success: true,
      message: "User Address",
      data: address
    })
  }catch(err){
    console.log(err)
  }
};

exports.updateAddress = async(req,res)=>{
  try{
    const data = req.body;
    if(!req.params.id){
      return res.json({
        code: 400,
        success: false,
        message: "Please provide address id",
        data: {}
      })
    }
    const address = await Middlewear.FindByIdAndUpDate(Address,req.params.id,data);
    if(!address){
      return res.json({
        code: 404,
        success: false,
        message: "Address not found",
        data: {}
      })
    }
    return res.json({
      code: 200,
      success: true,
      message: "Address updated successfully",
      data: address
    })

  }catch(err){
    console.log(err)
  }
};

exports.deleteAddress = async(req,res)=>{
  try{
    if(!req.params.id){
      return res.json({
        code: 400,
        success: false,
        message: "Please provide address id",
        data: {}
      })
    }
    const address = await Middlewear.FindByIdAndDelete(Address,req.params.id);
    if(!address){
      return res.json({
        code: 404,
        success: false,
        message: "Address not found",
        data: {}
      })
    }
    return res.json({
      code: 200,
      success: true,
      message: "Address deleted successfully",
      data: address
    })

  }catch(err){
    console.log(err)
  }
};


exports. addressDetails = async(req,res)=>{
  try{
    if(!req.params.id){
      return res.json({
        code: 400,
        success: false,
        message: "Please provide address id",
        data: {}
      })
    }
    const address = await Middlewear.FindById(Address,req.params.id);
    if(!address){
      return res.json({
        code: 404,
        success: false,
        message: "Address not found",
        data: {}
      })
    }
    return res.json({
      code: 200,
      success: true,
      message: "Address Details",
      data: address
    })
  }catch(error){
    console.log(error)
  }
}