const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const Razorpay = require("razorpay");
const Middlewear = require("../Middlewear/order");
const Comman = require("../Middlewear/comman");
const Review = require("../Model/review");
const axios = require("axios");
const path = require('path')
const fs = require("fs")
// const User = require("../Model/User")

// Models
const User = require("../Model/User");
const Order = require("../Model/order");
const Cart = require("../Model/cart");
const Product = require("../Model/Product");
const Banner = require("../Model/Banner");
const CMS = require("../Model/cms");
const Tally = require("../Model/tally");
const pdfParse = require("pdf-parse");

// Razorpay setup
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

exports.createOrder = async (req, res) => {
  try {
    console.log(">>>>>>>>>>>>>>test");

    const data = req.body;
    console.log("data", data);
    data.userId = req.userData;

    // const amount = parseFloat(data.amount);
    // console.log("amount", amount);
    // if (isNaN(amount)) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Invalid amount provided.",
    //   });
    // }

    // // Create Razorpay order
    // const razorpayOrder = await razorpay.orders.create({
    //   amount: amount * 100, // smallest currency unit (paise)
    //   currency: "INR",
    //   receipt: `receipt_${Date.now()}`,
    // });

    // console.log("Razorpay Order Response:", razorpayOrder);

    // // Validate Razorpay response
    // if (!razorpayOrder || !razorpayOrder.id) {
    //   throw new Error("Razorpay order creation failed");
    // }

    // Save order in DB
    const savedOrder = await Middlewear.CreateOder(Order, data);

    for (const cartItem of savedOrder.orderObj.cartData) {
      const { productId } = cartItem.productDetails;
      const { quantity, size } = cartItem;

      // Update the stock for the specific size
      await Product.findOneAndUpdate(
        { _id: productId },
        { $inc: { [`stock.${size}`]: -quantity } }
      );
    }
    return res.json({
      code: 200,
      success: true,
      message: "Order created successfully",
      data: savedOrder,
      // razorpayOrder,
    });
  } catch (error) {
    console.error("Order creation error:", error);
  }
};

exports.getProduct = async (req, res) => {
  try {
    let {
      page = 1,
      pageSize = 16,
      category,
      gender,
      high,
      low,
      search,
    } = req.query;
    page = parseInt(page);
    pageSize = parseInt(pageSize);
    const filter = {};
    if (category) filter.category = category;
    if (gender) filter.gender = gender;
    let sort = {};
    if (high) sort.price = 1;
    if (low) sort.price = -1;
    if (search) {
      filter.$or = [
        { productId: { $regex: data.search, $options: "i" } },
        { productName: { $regex: data.search, $options: "i" } },
      ];
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
          imagePath: "",
        },
      },
    });
  } catch (error) {
    console.error("getProduct error:", error);
  }
};

exports.getAllOrder = async (req, res) => {
  try {
    const data = req.query;
    console.log(">>>>", req.userData);
    const item = await Middlewear.FindAllOrder(Order, data, req.userData);
    console.log("item", item);
    return res.json({
      code: 200,
      success: true,
      message: "Order created successfully",
      data: item,
    });
  } catch (error) {
    console.log(error);
  }
};
exports.getAllOrderd = async (req, res) => {
  try {
    const data = req.query;
    console.log(">>>>", req.userData);
    const item = await Middlewear.FindAllOrderd(Order, data, req.userData);
    console.log("item", item);
    return res.json({
      code: 200,
      success: true,
      message: "Order created successfully",
      data: item,
    });
  } catch (error) {
    console.log(error);
  }
};

exports.addToCart = async (req, res) => {
  try {
    const data = req.body;
    console.log();
    data.productId = data.productId || data.produtctId;
    console.log(">>>>", data);
    const product = await Product.findOne({ _id: data.productId });
    if (!product) {
      return res.json({
        code: 404,
        success: false,
        message: "Product not found",
      });
    }
    const cart = await Cart.findOne({
      userId: req.userData,
      produtctId: data.productId,
      size: data.size,
    });
    if (cart) {
      cart.quantity = cart.quantity + 1;
      cart.total = cart.total + product.price;
      await cart.save();
      return res.json({
        code: 200,
        success: true,
        message: "added to cart successfully",
        data: cart,
      });
    }
    console.log("cart", cart);
    const item = await Middlewear.AddToCart(
      Cart,
      data,
      product.price,
      req.userData
    );
    return res.json({
      code: 200,
      success: true,
      message: "added to cart successfully",
      data: item,
    });
  } catch (error) {
    console.log(error);
  }
};

exports.getCartDetails = async (req, res) => {
  try {
    const data = req.query;
    const item = await Middlewear.getCartDetails(Cart, data, req.userData);
    console.log("item", item);
    if (item.code === 404) {
      return res.json({
        code: 404,
        success: false,
        message: "cart is empty",
      });
    }
    return res.json({
      code: 200,
      success: true,
      message: "cart details",
      data: item,
    });
  } catch (error) {
    console.log(error);
  }
};

exports.updateCart = async (req, res) => {
  try {
    const data = req.body;
    const cartId = req.query.cartId;
    data.cartId = data.cartId || data.cartId;
    if (!cartId) {
      return res.json({
        code: 404,
        success: false,
        message: "cartId is required",
      });
    }
    const cart = await Middlewear.updateCart(Cart, cartId, req.userData, data);
    if (!cart) {
      return res.json({
        code: 404,
        success: false,
        message: "cart not found",
      });
    }
    return res.json({
      code: 200,
      success: true,
      message: "cart updated successfully",
      data: cart,
    });
  } catch (error) {
    console.log(error);
  }
};

exports.deleteCart = async (req, res) => {
  try {
    const data = req.query;
    const cartId = req.query.cartId;
    const cart = await Middlewear.deleteCart(Cart, cartId, req.userData, data);
    if (!cart) {
      return res.json({
        code: 404,
        success: false,
        message: "cart not found",
      });
    }
    return res.json({
      code: 200,
      success: true,
      message: "cart deleted successfully",
      data: cart,
    });
  } catch (error) {
    console.log(error);
  }
};

exports.getCart = async (req, res) => {
  try {
    const data = req.params.cartId;
    if (!data) {
      return res.json({
        code: 404,
        success: false,
        message: "cartId is required",
      });
    }
    if (!data) {
      return res.json({
        code: 404,
        success: false,
        message: "cartId is required",
      });
    }
    const cart = await Comman.FindById(Cart, data);
    if (!cart) {
      return res.json({
        code: 404,
        success: false,
        message: "cart not found",
      });
    }
    return res.json({
      code: 200,
      success: true,
      message: "cart details",
      data: cart,
    });
  } catch (error) {
    console.log(error);
  }
};

exports.createReview = async (req, res) => {
  try {
    const data = req.body;
    const isexit = await Middlewear.findReview(
      Review,
      data.product,
      req.userData
    );
    if (isexit) {
      return res.json({
        code: 404,
        success: false,
        message: "Already review given",
      });
    }
    data.userId = req.userData;
    const item = await Review.create(data);
    return res.json({
      code: 200,
      success: true,
      message: "Review created successfully",
      data: item,
    });
  } catch (error) {
    console.log(error);
  }
};

exports.getReview = async (req, res) => {
  try {
    const data = req.params.productId;
    if (!data) {
      return res.json({
        code: 404,
        success: false,
        message: "productId is required",
      });
    }
    const review = await Middlewear.getReview(Review, data);
    if (!review) {
      return res.json({
        code: 404,
        success: false,
        message: "review not found",
      });
    }
    return res.json({
      code: 200,
      success: true,
      message: "review details",
      data: review,
    });
  } catch (error) {
    console.log(error);
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const data = req.params.id;
    if (!data) {
      return res.json({
        code: 404,
        success: false,
        message: "reviewId is required",
      });
    }
    const review = await Comman.FindByIdAndDelete(Review, data);
    if (!review) {
      return res.json({
        code: 404,
        success: false,
        message: "review not found",
      });
    }
    return res.json({
      code: 200,
      success: true,
      message: "review deleted successfully",
    });
  } catch (error) {
    console.log(error);
  }
};

exports.shipRocketToken = async (req, res) => {
  try {
    console.log(">>>>>>>>>>>>>>>>>>>");
    console.log(">><><><", process.env.ship_Api);
    console.log(">><><><", process.env.Ship_Email);
    console.log(">><><><", process.env.ship_Password);
    const user = await User.findOne({ _id: req.userData });
    console.log(">>>>>>>>>>>>>>>>>>>", user);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const response = await axios.post(process.env.ship_Api, {
      email: process.env.Ship_Email,
      password: process.env.ship_Password,
    });

    console.log("ShipRocket token response:", response.data);

    return res.status(200).json({
      success: true,
      token: response.data.token || response.data, // Adjust based on actual response
    });
  } catch (error) {
    console.error("ShipRocket token error:", error.message);
  }
};

// exports.test = async(req,res)=>{
//   try{
//     const item = await Order.findOne({_id:req.body.id})
//     for(var i= 0;i<item.orderObj.cartData.length;i++){
//       let productId = item.orderObj.cartData[i].productDetails.productId
//       let quantity = item.orderObj.cartData[i].quantity
//       let size = item.orderObj.cartData[i].size
//       console.log(">>>>>>",productId,quantity,size)
//       let product = await Product.findOne({
//          _id:productId
//       },{

//       })

//       console.log(">>>><<><><><><><><><><>",product.stock == size)
//     }
//     return res.json({
//       code :200,
//       data:item
//     })
//   }catch(error){
//     console.log(error)
//   }
// }

exports.test = async (req, res) => {
  try {
    const item = await Order.findOne({ _id: req.body.id });

    for (const cartItem of item.orderObj.cartData) {
      const { productId } = cartItem.productDetails;
      const { quantity, size } = cartItem;

      // Update the stock for the specific size
      await Product.findOneAndUpdate(
        { _id: productId },
        { $inc: { [`stock.${size}`]: -quantity } }
      );
    }

    return res.json({
      code: 200,
      data: item,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      code: 500,
      message: "Error updating product stock",
      error: error.message,
    });
  }
};

exports.CancleOrder = async (req, res) => {
  try {
    const data = req.body;
    const item = await Middlewear.updateOrderStatus(Order, data, req.userData);
    return res.json({
      code: 200,
      success: true,
      message: "order status update",
      data: item,
    });
  } catch (error) {
    console.log(error);
  }
};

exports.Bannerimages = async (req, res) => {
  try {
    const data = req.query;
    const item = await Middlewear.BannerImages(Banner, data);
    return res.json({
      code: 200,
      success: true,
      data: item,
    });
  } catch (error) {
    console.log(error);
  }
};

exports.getcms = async (req, res) => {
  try {
    const data = req.query;
    if (!data.type) {
      return res.json({
        code: 404,
        success: false,
        message: "type is missing ",
      });
    }
    const item = await CMS.findOne({ type: data.type });
    return res.json({
      code: 200,
      success: true,
      data: item,
    });
  } catch (error) {
    console.log(error);
  }
};

exports.AddLaser = async (req, res) => {
  try {
    const data = req.body;

    // ✅ Validate required fields
    if (!data.laserName || !data.parent) {
      return res.status(400).json({
        code: 400,
        message: "laserName and parent are required",
      });
    }

    // ✅ Create record
    const item = await Tally.create(data);

    return res.json({
      code: 200,
      message: "Data created successfully",
      data: item,
    });
  } catch (error) {
    console.log(error);
  }
};

exports.getLaser = async (req, res) => {
  try {
    const item = await Tally.find();
    if (item.length === 0) {
      return res.json({
        code: 400,
        message: "empty",
        data: {},
      });
    }
    return res.json({
      code: 201,
      message: "data fatch successfully ",
      data: item,
    });
  } catch (error) {
    console.log(error);
  }
};

exports.Pdf = async (req, res) => {
  try {
   const filePath = path.join(__dirname, "..", "..", "uploads", "test.pdf");

    console.log(">>>>>>>>>>>>>>>>filePath",filePath)
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: "File not found" });
    }
    // Read file as buffer
    const file = fs.readFileSync(filePath);
    // const file = req.file;
    const pdfData = await pdfParse(file.buffer);
    const lines = pdfData.text
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    const entries = [];
    let currentEntry = null;
    let narration = "";
    let ledgerList = [];
    let currentDate = "";
    let entryCounter = 0; // resets each date section

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // 🔹 Skip header & irrelevant lines
      if (
        line.startsWith("ZAMINDARA FARMSOLUTIONS") ||
        line.startsWith("FEROZEPUR ROAD") ||
        line.startsWith("FAZILKA") ||
        line.includes("Journal Book") ||
        line.includes("Dr. Amount") ||
        line.includes("Particulars") ||
        line.includes("S.No.") ||
        line.startsWith("Page")
      )
        continue;

      // 🔹 Detect date line → "01/04/2025 B/F  0.00  0.00"
      const dateMatch = line.match(/^(\d{2}\/\d{2}\/\d{4})\s+B\/F/);

      if (dateMatch) {
        const newDate = dateMatch[1];
        // ✅ Reset numbering when new date section starts
        if (newDate !== currentDate) {
          currentDate = newDate;
          entryCounter = 0;
        }
        continue;
      }
      // 🔹 Detect new journal entry → "1  47821.00SILAGE FACTORY"
      const entryStart = line.match(/^(\d+)\s+([\d,.]+)(.+)$/);
      // console.log(">>>>>>>>>>>>>>>>>dateMatch", entryStart);
      if (entryStart) {
        // Save previous entry if exists
        if (currentEntry) {
          ledgerList.forEach((l, index) => {
            currentEntry[`ledname${index + 1}`] = l.name;
            currentEntry[`Dbtamt${index + 1}`] = l.amount;
          });
          currentEntry.Narration = narration.trim();
          entries.push({ Jrnlentry: currentEntry });
        }

        // Reset for new entry
        narration = "";
        ledgerList = [];
        entryCounter += 1; // ✅ increment within current date

        // Create new entry
        ledgerList.push({
          amount: entryStart[2].trim(),
          name: entryStart[3].trim(),
        });

        currentEntry = {
          number: entryCounter,
          date: currentDate || "",
        };
        continue;
      }

      // 🔹 Detect additional ledgers → "47821.00WHEAT STRAW SALE"
      // 🔹 Detect additional ledgers → e.g. "47821.00 WHEAT STRAW SALE"
   // 🔹 Detect additional ledgers (true Dr/Cr lines only)
// 🔹 Detect additional ledgers (true Dr/Cr lines only)
const ledgerLine = line.match(/^([\d,.]+)\s*(.+)$/);
if (ledgerLine) {
  const amount = ledgerLine[1].trim();
  const name = ledgerLine[2].trim();

  // 🧠 Skip invalid or narration-like lines
  if (
    // long numeric references like "196331288677 0"
    amount.length > 8 || 
    name.match(/^\d+$/) || // if name itself is just a number
    name === "0" || 
    name.match(/\d{6,}/) || // any long numeric string
    name.includes("@") || // UPI or email-like content
    name.match(/(Bill|Being|UPI|Tuda|Slip|No\.|Dated|Against)/i) ||
    name.match(/^(Total|C\/F|B\/F)/i) ||
    name.match(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i)
  ) {
    narration += (narration ? " " : "") + line;
    continue;
  }

  // ✅ Only add if it’s a clean Dr/Cr style line
  ledgerList.push({ amount, name });
  continue;
}



      // 🔹 Narration lines (Bill details, UPI, etc.)
    if (
  !line.match(/^(\d{2}\/\d{2}\/\d{4})\s+B\/F/) &&
  !line.match(/^(\d+)\s+([\d,.]+)(.+)$/) &&
  !line.match(/^([\d,.]+)\s*(.+)$/) &&
  !line.match(/^(Total|C\/F|B\/F)/i)
) {
  narration += (narration ? " " : "") + line;
  continue;
}
    }

    // 🔹 Push the last entry
    if (currentEntry) {
      ledgerList.forEach((l, index) => {
        currentEntry[`ledname${index + 1}`] = l.name;
        currentEntry[`Dbtamt${index + 1}`] = l.amount;
      });
      currentEntry.Narration = narration.trim();
      entries.push({ Jrnlentry: currentEntry });
    }

    res.status(200).json({
      success: true,
      totalEntries: entries.length,
      data: entries,
    });
  } catch (error) {
    console.log(error);
  }
};
