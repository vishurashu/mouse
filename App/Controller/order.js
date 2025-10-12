const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const Razorpay = require("razorpay");
const Middlewear = require("../Middlewear/order");
const Comman = require("../Middlewear/comman");
const Review = require("../Model/review");
const axios = require("axios");
const path = require("path");
const fs = require("fs");
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

// exports.Pdf = async (req, res) => {
//   try {
//     const filePath = path.join(__dirname, "..", "..", "uploads", "test.pdf");

//     console.log(">>>>>>>>>>>>>>>>filePath", filePath);
//     // Check if file exists
//     if (!fs.existsSync(filePath)) {
//       return res
//         .status(404)
//         .json({ success: false, message: "File not found" });
//     }
//     // Read file as buffer
//     const file = fs.readFileSync(filePath);
//     // const file = req.file;
//     const pdfData = await pdfParse(file.buffer);
//     const lines = pdfData.text
//       .split("\n")
//       .map((l) => l.trim())
//       .filter((l) => l.length > 0);

//     const entries = [];
//     let currentEntry = null;
//     let narration = "";
//     let ledgerList = [];
//     let currentDate = "";
//     let entryCounter = 0; // resets each date section

//     for (let i = 0; i < lines.length; i++) {
//       const line = lines[i];

//       // 🔹 Skip header & irrelevant lines
//       if (
//         line.startsWith("ZAMINDARA FARMSOLUTIONS") ||
//         line.startsWith("FEROZEPUR ROAD") ||
//         line.startsWith("FAZILKA") ||
//         line.includes("Journal Book") ||
//         line.includes("Dr. Amount") ||
//         line.includes("Particulars") ||
//         line.includes("S.No.") ||
//         line.startsWith("Page")
//       )
//         continue;

//       // 🔹 Detect date line → "01/04/2025 B/F  0.00  0.00"
//       const dateMatch = line.match(/^(\d{2}\/\d{2}\/\d{4})\s+B\/F/);

//       if (dateMatch) {
//         const newDate = dateMatch[1];
//         // ✅ Reset numbering when new date section starts
//         if (newDate !== currentDate) {
//           currentDate = newDate;
//           entryCounter = 0;
//         }
//         continue;
//       }
//       // 🔹 Detect new journal entry → "1  47821.00SILAGE FACTORY"
//       const entryStart = line.match(/^(\d+)\s+([\d,.]+)(.+)$/);
//       // console.log(">>>>>>>>>>>>>>>>>dateMatch", entryStart);
//       if (entryStart) {
//         // Save previous entry if exists
//         if (currentEntry) {
//           ledgerList.forEach((l, index) => {
//             currentEntry[`ledname${index + 1}`] = l.name;
//             currentEntry[`Dbtamt${index + 1}`] = l.amount;
//           });
//           currentEntry.Narration = narration.trim();
//           entries.push({ Jrnlentry: currentEntry });
//         }

//         // Reset for new entry
//         narration = "";
//         ledgerList = [];
//         entryCounter += 1; // ✅ increment within current date

//         // Create new entry
//         ledgerList.push({
//           amount: entryStart[2].trim(),
//           name: entryStart[3].trim(),
//         });

//         currentEntry = {
//           number: entryCounter,
//           date: currentDate || "",
//         };
//         continue;
//       }

//       // 🔹 Detect additional ledgers → "47821.00WHEAT STRAW SALE"
//       // 🔹 Detect additional ledgers → e.g. "47821.00 WHEAT STRAW SALE"
//       // 🔹 Detect additional ledgers (true Dr/Cr lines only)
//       // 🔹 Detect additional ledgers (true Dr/Cr lines only)
//       const ledgerLine = line.match(/^([\d,.]+)\s*(.+)$/);
//       if (ledgerLine) {
//         const amount = ledgerLine[1].trim();
//         const name = ledgerLine[2].trim();

//         // 🧠 Skip invalid or narration-like lines
//         if (
//           // long numeric references like "196331288677 0"
//           amount.length > 8 ||
//           name.match(/^\d+$/) || // if name itself is just a number
//           name === "0" ||
//           name.match(/\d{6,}/) || // any long numeric string
//           name.includes("@") || // UPI or email-like content
//           name.match(/(Bill|Being|UPI|Tuda|Slip|No\.|Dated|Against)/i) ||
//           name.match(/^(Total|C\/F|B\/F)/i) ||
//           name.match(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i)
//         ) {
//           narration += (narration ? " " : "") + line;
//           continue;
//         }

//         // ✅ Only add if it’s a clean Dr/Cr style line
//         ledgerList.push({ amount, name });
//         continue;
//       }

//       // 🔹 Narration lines (Bill details, UPI, etc.)
//       if (
//         !line.match(/^(\d{2}\/\d{2}\/\d{4})\s+B\/F/) &&
//         !line.match(/^(\d+)\s+([\d,.]+)(.+)$/) &&
//         !line.match(/^([\d,.]+)\s*(.+)$/) &&
//         !line.match(/^(Total|C\/F|B\/F)/i)
//       ) {
//         narration += (narration ? " " : "") + line;
//         continue;
//       }
//     }

//     // 🔹 Push the last entry
//     if (currentEntry) {
//       ledgerList.forEach((l, index) => {
//         currentEntry[`ledname${index + 1}`] = l.name;
//         currentEntry[`Dbtamt${index + 1}`] = l.amount;
//       });
//       currentEntry.Narration = narration.trim();
//       entries.push({ Jrnlentry: currentEntry });
//     }

//     res.status(200).json({
//       success: true,
//       totalEntries: entries.length,
//       data: entries,
//     });
//   } catch (error) {
//     console.log(error);
//   }
// };

// exports.Pdf = async (req, res) => {
//   try {
//     // ✅ PDF file path
//     const filePath = path.join(__dirname, "..", "..", "uploads", "test.pdf");

//     if (!fs.existsSync(filePath)) {
//       return res.status(404).json({ success: false, message: "File not found" });
//     }

//     const fileBuffer = fs.readFileSync(filePath);
//     const pdfData = await pdfParse(fileBuffer);

//     const lines = pdfData.text
//       .split("\n")
//       .map((l) => l.trim())
//       .filter((l) => l.length > 0);

//     const entries = [];
//     let currentEntry = null;
//     let narration = "";
//     let ledgerList = [];
//     let currentDate = "";
//     let entryCounter = 0;

//     for (let i = 0; i < lines.length; i++) {
//       const line = lines[i];

//       // 🔹 Skip header / irrelevant lines
//       if (
//         line.startsWith("ZAMINDARA FARMSOLUTIONS") ||
//         line.startsWith("FEROZEPUR ROAD") ||
//         line.startsWith("FAZILKA") ||
//         line.includes("Journal Book") ||
//         line.includes("Dr. Amount") ||
//         line.includes("Particulars") ||
//         line.includes("S.No.") ||
//         line.startsWith("Page")
//       ) continue;

//       // 🔹 Detect date line → "01/04/2025 B/F"
//       const dateMatch = line.match(/^(\d{2}\/\d{2}\/\d{4})\s+B\/F/);
//       if (dateMatch) {
//         const newDate = dateMatch[1];
//         if (newDate !== currentDate) {
//           currentDate = newDate;
//           entryCounter = 0;
//         }
//         continue;
//       }

//       // 🔹 Detect new journal entry → "1  47821.00SILAGE FACTORY"
//       const entryStart = line.match(/^(\d+)\s+([\d,.]+)\s*(.+)$/);
//       if (entryStart) {
//         // Save previous entry if valid
//         if (currentEntry && ledgerList.length > 0 && ledgerList[0].name !== "0" && ledgerList[0].name !== "") {
//           ledgerList.forEach((l, index) => {
//             currentEntry[`ledname${index + 1}`] = l.name;
//             currentEntry[`Dbtamt${index + 1}`] = l.amount;
//           });
//           currentEntry.Narration = narration.trim();
//           entries.push({ Jrnlentry: currentEntry });
//         }

//         // Reset for new entry
//         ledgerList = [];
//         narration = "";
//         entryCounter += 1;

//         ledgerList.push({
//           amount: entryStart[2].trim(),
//           name: entryStart[3].trim(),
//         });

//         currentEntry = {
//           number: entryCounter,
//           date: currentDate || "",
//         };
//         continue;
//       }

//       // 🔹 Detect ledger lines (number first)
//       let ledgerLine = line.match(/^([\d,.]+)\s*(.+)$/);
//       if (!ledgerLine) {
//         // 🔹 Detect ledger lines (text first, with : or space)
//         ledgerLine = line.match(/^(.+?)[:\s]\s*([\d,.]+)$/);
//         if (ledgerLine) {
//           const name = ledgerLine[1].trim();
//           const amount = ledgerLine[2].trim();

//           // 🧠 Skip invalid ledger lines
//           if (
//             name === "0" ||
//             !name ||
//             name.match(/^\d+$/) ||
//             amount.length > 8 ||
//             name.includes("@") ||
//             name.match(/\d{6,}/) ||
//             name.match(/(Bill|Being|UPI|Tuda|Slip|No\.|Dated|Against|Interest|Payment)/i)
//           ) {
//             narration += (narration ? " " : "") + line;
//             continue;
//           }

//           ledgerList.push({ name, amount });
//           continue;
//         }
//       } else {
//         // Number-first style
//         const amount = ledgerLine[1].trim();
//         const name = ledgerLine[2].trim();

//         if (
//           amount.length > 8 ||
//           name.match(/^\d+$/) ||
//           name === "0" ||
//           name.match(/\d{6,}/) ||
//           name.includes("@") ||
//           name.match(/(Bill|Being|UPI|Tuda|Slip|No\.|Dated|Against|Interest|Payment)/i) ||
//           name.match(/^(Total|C\/F|B\/F)/i) ||
//           name.match(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i)
//         ) {
//           narration += (narration ? " " : "") + line;
//           continue;
//         }

//         ledgerList.push({ amount, name });
//         continue;
//       }

//       // 🔹 Fallback → narration
//       narration += (narration ? " " : "") + line;
//     }

//     // 🔹 Push last entry if valid
//     if (currentEntry && ledgerList.length > 0 && ledgerList[0].name !== "0" && ledgerList[0].name !== "") {
//       ledgerList.forEach((l, index) => {
//         currentEntry[`ledname${index + 1}`] = l.name;
//         currentEntry[`Dbtamt${index + 1}`] = l.amount;
//       });
//       currentEntry.Narration = narration.trim();
//       entries.push({ Jrnlentry: currentEntry });
//     }

//     res.status(200).json({
//       success: true,
//       totalEntries: entries.length,
//       data: entries,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: "Server error", error: error.message });
//   }
// };

// exports.Pdf = async (req, res) => {
//   try {
//     // ✅ PDF file path
//     const filePath = path.join(__dirname, "..", "..", "uploads", "test.pdf");

//     if (!fs.existsSync(filePath)) {
//       return res
//         .status(404)
//         .json({ success: false, message: "File not found" });
//     }

//     const fileBuffer = fs.readFileSync(filePath);
//     const pdfData = await pdfParse(fileBuffer);

//     const lines = pdfData.text
//       .split("\n")
//       .map((l) => l.trim())
//       .filter((l) => l.length > 0);

//     const entries = [];
//     let currentEntry = null;
//     let narration = "";
//     let ledgerList = [];
//     let currentDate = "";
//     let entryCounter = 0;

//     for (let i = 0; i < lines.length; i++) {
//       const line = lines[i];

//       // 🔹 Skip header / irrelevant lines
//       if (
//         line.startsWith("ZAMINDARA FARMSOLUTIONS") ||
//         line.startsWith("FEROZEPUR ROAD") ||
//         line.startsWith("FAZILKA") ||
//         line.includes("Journal Book") ||
//         line.includes("Dr. Amount") ||
//         line.includes("Particulars") ||
//         line.includes("S.No.") ||
//         line.startsWith("Page")
//       )
//         continue;

//       // 🔹 Detect date line → "01/04/2025 B/F"
//       const dateMatch = line.match(/^(\d{2}\/\d{2}\/\d{4})\s+B\/F/);
//       if (dateMatch) {
//         const newDate = dateMatch[1];
//         if (newDate !== currentDate) {
//           currentDate = newDate;
//           entryCounter = 0;
//         }
//         continue;
//       }

//       // 🔹 Detect new journal entry → "1  47821.00SILAGE FACTORY"
//       const entryStart = line.match(/^(\d+)\s+([\d,.]+)\s*(.+)$/);
//       if (entryStart) {
//         // Save previous entry if valid
//         if (
//           currentEntry &&
//           ledgerList.length > 0 &&
//           ledgerList[0].name !== "0" &&
//           ledgerList[0].name !== ""
//         ) {
//           ledgerList.forEach((l, index) => {
//             currentEntry[`ledname${index + 1}`] = l.name;
//             currentEntry[`Dbtamt${index + 1}`] = l.amount;
//           });
//           currentEntry.Narration = narration.trim();
//           entries.push({ Jrnlentry: currentEntry });
//         }

//         // Reset for new entry
//         ledgerList = [];
//         narration = "";
//         entryCounter += 1;

//         ledgerList.push({
//           amount: entryStart[2].trim(),
//           name: entryStart[3].trim(),
//         });

//         currentEntry = {
//           number: entryCounter,
//           date: currentDate || "",
//         };
//         continue;
//       }

//       // 🔹 Skip lines that are actually narration (dates, "Being", etc.)
//       const isNarrationDate = line.match(
//   /^(\d{1,2}\s+)?(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)(\s+\d{4})?$/i
// );

//       const startsWithBeing = line.match(/^Being/i);
//       if (isNarrationDate || startsWithBeing) {
//         narration += (narration ? " " : "") + line;
//         continue;
//       }

//       // 🔹 Detect ledger lines
//       // let ledgerLine = line.match(/^([\d,.]+)\s*(.+)$/); // number first
//       // if (!ledgerLine) {
//       //   ledgerLine = line.match(/^(.+?)[:\s]\s*([\d,.]+)$/); // text first
//       //   if (ledgerLine) {
//       //     const name = ledgerLine[1].trim();
//       //     const amount = ledgerLine[2].trim();

//       //     if (
//       //       name === "0" ||
//       //       !name ||
//       //       name.match(/^\d+$/) ||
//       //       amount.length > 8 ||
//       //       name.includes("@") ||
//       //       name.match(/\d{6,}/) ||
//       //       name.match(
//       //         /(Bill|Being|UPI|Tuda|Slip|No\.|Dated|Against|Interest|Payment)/i
//       //       )
//       //     ) {
//       //       narration += (narration ? " " : "") + line;
//       //       continue;
//       //     }

//       //     ledgerList.push({ name, amount });
//       //     continue;
//       //   }
//       // } else {
//       //   const amount = ledgerLine[1].trim();
//       //   const name = ledgerLine[2].trim();

//       //   if (
//       //     amount.length > 8 ||
//       //     name.match(/^\d+$/) ||
//       //     name === "0" ||
//       //     name.match(/\d{6,}/) ||
//       //     name.includes("@") ||
//       //     name.match(
//       //       /(Bill|Being|UPI|Tuda|Slip|No\.|Dated|Against|Interest|Payment)/i
//       //     ) ||
//       //     name.match(/^(Total|C\/F|B\/F)/i) ||
//       //     name.match(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i)
//       //   ) {
//       //     narration += (narration ? " " : "") + line;
//       //     continue;
//       //   }

//       //   ledgerList.push({ amount, name });
//       //   continue;
//       // }

//       let ledgerLine = null;

// // ✅ Format 1 → Amount first: "108066.00 WHEAT STRAW SALE"
// if (/^[\d.,]+\s+.+$/.test(line)) {
//   const parts = line.trim().split(/\s+/, 2);
//   ledgerLine = {
//     amount: parts[0],
//     name: line.replace(parts[0], "").trim()
//   };
// }

// // ✅ Format 2 → Name first: "WHEAT STRAW SALE 108066.00"
// else if (/.+\s+[\d.,]+$/.test(line)) {
//   const match = line.match(/^(.+?)\s+([\d.,]+)$/);
//   if (match) {
//     ledgerLine = {
//       name: match[1].trim(),
//       amount: match[2].trim()
//     };
//   }
// }

// if (ledgerLine) {
//   // ✅ Filter out wrong entries (irrelevant names)
//   if (
//     ledgerLine.name === "0" ||
//     !ledgerLine.name ||
//     ledgerLine.name.match(/^\d+$/) ||
//     ledgerLine.amount.length > 12 ||
//     ledgerLine.name.includes("@") ||
//     ledgerLine.name.match(/\d{6,}/) ||
//     ledgerLine.name.match(
//       /(Bill|Being|UPI|Tuda|Slip|No\.|Dated|Against|Interest|Payment|Total|C\/F|B\/F)/i
//     )
//   ) {
//     narration += (narration ? " " : "") + line;
//     continue;
//   }

//   // ✅ Valid ledger → push to ledgerList
//   ledgerList.push({
//     name: ledgerLine.name,
//     amount: ledgerLine.amount,
//   });
//   continue;
// }

//       // 🔹 Fallback → narration
//       // narration += (narration ? " " : "") + line;
//       narration += (narration ? " " : "") + line;
//     }

//     // 🔹 Push last entry if valid
//     if (
//       currentEntry &&
//       ledgerList.length > 0 &&
//       ledgerList[0].name !== "0" &&
//       ledgerList[0].name !== ""
//     ) {
//       ledgerList.forEach((l, index) => {
//         currentEntry[`ledname${index + 1}`] = l.name;
//         currentEntry[`Dbtamt${index + 1}`] = l.amount;
//       });
//       currentEntry.Narration = narration.trim();
//       entries.push({ Jrnlentry: currentEntry });
//     }

//     res.status(200).json({
//       success: true,
//       totalEntries: entries.length,
//       data: entries,
//     });
//   } catch (error) {
//     console.error(error);
//     res
//       .status(500)
//       .json({ success: false, message: "Server error", error: error.message });
//   }
// };

// exports.Pdf = async (req, res) => {
//   try {
//     // ✅ PDF file path
//     const filePath = path.join(__dirname, "..", "..", "uploads", "test.pdf");

//     if (!fs.existsSync(filePath)) {
//       return res
//         .status(404)
//         .json({ success: false, message: "File not found" });
//     }

//     const fileBuffer = fs.readFileSync(filePath);
//     const pdfData = await pdfParse(fileBuffer);

//     // Split into non-empty lines and normalize spaces
//     const rawLines = pdfData.text.split("\n");
//     const lines = rawLines
//       .map((l) => l.replace(/\u00A0/g, " ").replace(/\t/g, " ").trim())
//       .filter((l) => l.length > 0);

//     const entries = [];
//     let currentEntry = null;
//     let narration = "";
//     let ledgerList = [];
//     let currentDate = "";
//     let entryCounter = 0;

//     for (let i = 0; i < lines.length; i++) {
//       // Preprocess line: collapse multiple spaces, insert missing space between digits and letters
//       let raw = lines[i].replace(/\s+/g, " ").trim();

//       // Insert spaces where numbers and letters are concatenated (handles English + many Indic scripts)
//       raw = raw.replace(/(\d)([A-Za-z\u0900-\u097F])/g, "$1 $2");
//       raw = raw.replace(/([A-Za-z\u0900-\u097F])(\d)/g, "$1 $2");
//       raw = raw.replace(/\s+/g, " ").trim();

//       const line = raw;

//       // 🔹 Skip header / irrelevant lines
//       if (
//         line.startsWith("ZAMINDARA FARMSOLUTIONS") ||
//         line.startsWith("FEROZEPUR ROAD") ||
//         line.startsWith("FAZILKA") ||
//         line.includes("Journal Book") ||
//         line.includes("Dr. Amount") ||
//         line.includes("Particulars") ||
//         line.includes("S.No.") ||
//         line.startsWith("Page")
//       ) {
//         continue;
//       }

//       // 🔹 Detect date line → "01/04/2025 B/F"
//       const dateMatch = line.match(/^(\d{2}\/\d{2}\/\d{4})\s+B\/F/);
//       if (dateMatch) {
//         const newDate = dateMatch[1];
//         if (newDate !== currentDate) {
//           currentDate = newDate;
//           entryCounter = 0;
//         }
//         continue;
//       }

//       // 🔹 Detect new journal entry → "1  47821.00 SILAGE FACTORY"
//       const entryStart = line.match(/^(\d+)\s+([\d,]+(?:\.\d+)?)\s+(.+)$/);
//       if (entryStart) {
//         // Save previous entry if valid
//         if (
//           currentEntry &&
//           ledgerList.length > 0 &&
//           ledgerList[0].name !== "0" &&
//           ledgerList[0].name !== ""
//         ) {
//           ledgerList.forEach((l, index) => {
//             currentEntry[`ledname${index + 1}`] = l.name;
//             currentEntry[`Dbtamt${index + 1}`] = l.amount;
//           });
//           currentEntry.Narration = narration.trim();
//           entries.push({ Jrnlentry: currentEntry });
//         }

//         // Reset for new entry
//         ledgerList = [];
//         narration = "";
//         entryCounter += 1;

//         ledgerList.push({
//           name: entryStart[3].trim(),
//           amount: entryStart[2].trim(),
//         });

//         currentEntry = {
//           number: entryCounter,
//           date: currentDate || "",
//         };
//         continue;
//       }

//       // 🔹 Skip lines that are actually narration (dates, "Being", etc.)
//       const isNarrationDate = line.match(
//         /^(\d{1,2}\s+)?(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)(\s+\d{4})?$/i
//       );
//       const startsWithBeing = line.match(/^Being/i);
//       if (isNarrationDate || startsWithBeing) {
//         narration += (narration ? " " : "") + line;
//         continue;
//       }

//       // ------------------------------
//       // 🔹 Improved ledger detection
//       // ------------------------------
//       let ledgerLine = null;

//       // Pattern for an amount (commas allowed, optional decimals)
//       const amountPattern = "[\\d,]+(?:\\.\\d+)?";

//       // Format A: Amount first: "108066.00 WHEAT STRAW SALE"
//       const amtFirst = line.match(new RegExp("^(" + amountPattern + ")\\s+(.+)$"));

//       // Format B: Name first: "WHEAT STRAW SALE 108066.00"
//       const nameFirst = line.match(new RegExp("^(.+?)\\s+(" + amountPattern + ")$"));

//       // Choose best candidate (prefer entry-type lines already handled earlier)
//       if (amtFirst) {
//         ledgerLine = {
//           amount: amtFirst[1].trim(),
//           name: amtFirst[2].trim(),
//         };
//       } else if (nameFirst) {
//         ledgerLine = {
//           name: nameFirst[1].trim(),
//           amount: nameFirst[2].trim(),
//         };
//       }

//       // Additional validation: ensure amount is a "clean" number (no @ or slashes)
//       if (ledgerLine) {
//         const cleanAmountCheck = /^[\d,]+(?:\.\d+)?$/.test(
//           ledgerLine.amount.replace(/\s+/g, "")
//         );
//         const nameIsNumeric = /^[\d,\.]+$/.test(ledgerLine.name);

//         // Filter out lines that look like bills, slips, dates, totals, or are malformed
//         const nameLooksLikeNarration = ledgerLine.name.match(
//           /(Bill|Being|UPI|Tuda|Slip|No\.|Dated|Against|Interest|Payment|Total|C\/F|B\/F|BALES|WT|SLIP)/i
//         );

//         if (
//           !cleanAmountCheck ||
//           nameIsNumeric ||
//           !ledgerLine.name ||
//           ledgerLine.name === "0" ||
//           ledgerLine.amount.length > 15 ||
//           (ledgerLine.name && nameLooksLikeNarration)
//         ) {
//           // treat as narration if it fails validation
//           narration += (narration ? " " : "") + line;
//           continue;
//         }

//         // ✅ Valid ledger — push it
//         ledgerList.push({
//           name: ledgerLine.name,
//           amount: ledgerLine.amount,
//         });
//         continue;
//       }

//       // 🔹 If not ledger → treat as narration (fallback)
//       narration += (narration ? " " : "") + line;
//     }

//     // 🔹 Push last entry if valid
//     if (
//       currentEntry &&
//       ledgerList.length > 0 &&
//       ledgerList[0].name !== "0" &&
//       ledgerList[0].name !== ""
//     ) {
//       ledgerList.forEach((l, index) => {
//         currentEntry[`ledname${index + 1}`] = l.name;
//         currentEntry[`Dbtamt${index + 1}`] = l.amount;
//       });
//       currentEntry.Narration = narration.trim();
//       entries.push({ Jrnlentry: currentEntry });
//     }

//     res.status(200).json({
//       success: true,
//       totalEntries: entries.length,
//       data: entries,
//     });
//   } catch (error) {
//     console.error(error);
//     res
//       .status(500)
//       .json({ success: false, message: "Server error", error: error.message });
//   }
// };

// const fs = require("fs");
// const path = require("path");
// const pdfParse = require("pdf-parse");

// exports.Pdf = async (req, res) => {
//   try {
//     // ✅ PDF file path
//     const filePath = path.join(__dirname, "..", "..", "uploads", "test.pdf");

//     if (!fs.existsSync(filePath)) {
//       return res
//         .status(404)
//         .json({ success: false, message: "File not found" });
//     }

//     const fileBuffer = fs.readFileSync(filePath);
//     const pdfData = await pdfParse(fileBuffer);

//     // Split lines, normalize spaces, remove empty lines
//     const rawLines = pdfData.text.split("\n");
//     const lines = rawLines
//       .map((l) =>
//         l
//           .replace(/\u00A0/g, " ")
//           .replace(/\t/g, " ")
//           .trim()
//       )
//       .filter((l) => l.length > 0);

//     const entries = [];
//     let currentEntry = null;
//     let narration = "";
//     let ledgerList = [];
//     let currentDate = "";
//     let entryCounter = 0;

//     for (let i = 0; i < lines.length; i++) {
//       // Preprocess line: collapse spaces & insert missing space between digits and letters
//       let raw = lines[i].replace(/\s+/g, " ").trim();
//       raw = raw.replace(/(\d)([A-Za-z\u0900-\u097F])/g, "$1 $2");
//       raw = raw.replace(/([A-Za-z\u0900-\u097F])(\d)/g, "$1 $2");
//       raw = raw.replace(/\s+/g, " ").trim();

//       const line = raw;

//       // 🔹 Skip headers / irrelevant lines
//       if (
//         line.startsWith("ZAMINDARA FARMSOLUTIONS") ||
//         line.startsWith("FEROZEPUR ROAD") ||
//         line.startsWith("FAZILKA") ||
//         line.includes("Journal Book") ||
//         line.includes("Dr. Amount") ||
//         line.includes("Particulars") ||
//         line.includes("S.No.") ||
//         line.startsWith("Page") ||
//         line.startsWith("Total") ||
//         line.startsWith("C/F")
//       ) {
//         continue;
//       }

//       // 🔹 Detect date line → "01/04/2025 B/F"
//       const dateMatch = line.match(/^(\d{2}\/\d{2}\/\d{4})\s+B\/F/);
//       if (dateMatch) {
//         const newDate = dateMatch[1];
//         if (newDate !== currentDate) {
//           currentDate = newDate;
//           entryCounter = 0;
//         }
//         continue;
//       }

//       // 🔹 Detect new journal entry → "1  47821.00 SILAGE FACTORY"
//       const entryStart = line.match(/^(\d+)\s+([\d,]+(?:\.\d+)?)\s+(.+)$/);
//       if (entryStart) {
//         // Save previous entry if valid
//         if (
//           currentEntry &&
//           ledgerList.length > 0 &&
//           ledgerList[0].name !== "0" &&
//           ledgerList[0].name !== ""
//         ) {
//           ledgerList.forEach((l, index) => {
//             currentEntry[`ledname${index + 1}`] = l.name;
//             currentEntry[`Dbtamt${index + 1}`] = l.amount;
//           });
//           currentEntry.Narration = narration.trim();
//           entries.push({ Jrnlentry: currentEntry });
//         }

//         // Reset for new entry
//         ledgerList = [];
//         narration = "";
//         entryCounter += 1;

//         ledgerList.push({
//           name: entryStart[3].trim(),
//           amount: entryStart[2].trim(),
//         });
        

//         currentEntry = {
//           number: entryCounter,
//           date: currentDate || "",
//         };
//         continue;
//       }

//       // 🔹 Skip lines that are narration dates / start with Being
//       const isNarrationDate = line.match(
//         /^(\d{1,2}\s+)?(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)(\s+\d{4})?$/i
//       );
//       const startsWithBeing = line.match(/^Being/i);
//       if (isNarrationDate || startsWithBeing) {
//         narration += (narration ? " " : "") + line;
//         continue;
//       }

//       // ------------------------------
//       // 🔹 Improved ledger detection with UPI/Paytm/PhonePe filter
//       // ------------------------------
//       let ledgerLine = null;
//       const amountPattern = "[\\d,]+(?:\\.\\d+)?";

//       const amtFirst = line.match(
//         new RegExp("^(" + amountPattern + ")\\s+(.+)$")
//       );
//       const nameFirst = line.match(
//         new RegExp("^(.+?)\\s+(" + amountPattern + ")$")
//       );

//       if (amtFirst) {
//         ledgerLine = {
//           amount: amtFirst[1].trim(),
//           name: amtFirst[2].trim(),
//         };
//       } else if (nameFirst) {
//         ledgerLine = {
//           name: nameFirst[1].trim(),
//           amount: nameFirst[2].trim(),
//         };
//       }

//       // 🔹 Extra validation: ignore if line mentions UPI/Paytm/PhonePe/GPay/etc.
//       const isPaymentLine = /UPI|Paytm|PhonePe|GPay/i.test(line);
//       const amountNum = parseFloat(ledgerLine?.amount?.replace(/,/g, "")) || 0;
//       const isSmallOrYear =
//         (amountNum >= 1 && amountNum <= 31) ||
//         (amountNum >= 2023 && amountNum <= 2099);

//       if (ledgerLine && !isPaymentLine && !isSmallOrYear) {
//         const nameLooksLikeNarration = ledgerLine.name.match(
//           /(Bill|Being|Slip|No\.|Dated|Against|Interest|Payment|Total|C\/F|B\/F|BALES|WT|SLIP)/i
//         );
//         const cleanAmountCheck = /^[\d,]+(?:\.\d+)?$/.test(
//           ledgerLine.amount.replace(/\s+/g, "")
//         );
//         const nameIsNumeric = /^[\d,\.]+$/.test(ledgerLine.name);

//         if (
//           cleanAmountCheck &&
//           !nameIsNumeric &&
//           ledgerLine.name &&
//           !nameLooksLikeNarration &&
//           ledgerLine.name !== "0" &&
//           ledgerLine.amount.length <= 15
//         ) {
//           // ✅ Valid ledger
//           ledgerList.push({
//             name: ledgerLine.name,
//             amount: ledgerLine.amount,
//           });
//           continue;
//         }
//       }

//       // 🔹 If not ledger → treat as narration
//       narration += (narration ? " " : "") + line;
//     }

//     // 🔹 Push last entry if valid
//     if (
//       currentEntry &&
//       ledgerList.length > 0 &&
//       ledgerList[0].name !== "0" &&
//       ledgerList[0].name !== ""
//     ) {
//  const firstLedgerName = ledgerList[0]?.name || "";
// const firstLedgerAmount = ledgerList[0]?.amount || "";

// // Regex to detect month + year or month + year + number
// const isFakeLedger =
//   /^((Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4})(\s+[\d,]+(\.\d+)?)?$/.test(
//     firstLedgerName
//   ) ||
//   /^(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}$/.test(
//     firstLedgerName
//   );

// // Only push if it’s NOT fake
// if (!isFakeLedger) {
//   ledgerList.forEach((l, index) => {
//     currentEntry[`ledname${index + 1}`] = l.name;
//     currentEntry[`Dbtamt${index + 1}`] = l.amount;
//   });
//   currentEntry.Narration = narration.trim();
//   entries.push({ Jrnlentry: currentEntry });
// }
//     }

//     res.status(200).json({
//       success: true,
//       totalEntries: entries.length,
//       data: entries,
//     });
//   } catch (error) {
//     console.error(error);
//     res
//       .status(500)
//       .json({ success: false, message: "Server error", error: error.message });
//   }
// };




exports.Pdf = async (req, res) => {
  try {
    // ✅ PDF file path
    const filePath = path.join(__dirname, "..", "..", "uploads", "test.pdf");

    if (!fs.existsSync(filePath)) {
      return res
        .status(404)
        .json({ success: false, message: "File not found" });
    }

    const fileBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(fileBuffer);

    // Split lines, normalize spaces, remove empty lines
    const rawLines = pdfData.text.split("\n");
    const lines = rawLines
      .map((l) => l.replace(/\u00A0/g, " ").replace(/\t/g, " ").trim())
      .filter((l) => l.length > 0);

    const entries = [];
    let currentEntry = null;
    let narration = "";
    let ledgerList = [];
    let currentDate = "";
    let entryCounter = 0;

    for (let i = 0; i < lines.length; i++) {
      // Preprocess line: collapse spaces & insert missing space between digits and letters
      let raw = lines[i].replace(/\s+/g, " ").trim();
      raw = raw.replace(/(\d)([A-Za-z\u0900-\u097F])/g, "$1 $2");
      raw = raw.replace(/([A-Za-z\u0900-\u097F])(\d)/g, "$1 $2");
      raw = raw.replace(/\s+/g, " ").trim();

      const line = raw;

      // 🔹 Skip headers / irrelevant lines
      if (
        line.startsWith("ZAMINDARA FARMSOLUTIONS") ||
        line.startsWith("FEROZEPUR ROAD") ||
        line.startsWith("FAZILKA") ||
        line.includes("Journal Book") ||
        line.includes("Dr. Amount") ||
        line.includes("Particulars") ||
        line.includes("S.No.") ||
        line.startsWith("Page") ||
        line.startsWith("Total") ||
        line.startsWith("C/F")
      ) {
        continue;
      }

      // 🔹 Detect date line → "01/04/2025 B/F"
      const dateMatch = line.match(/^(\d{2}\/\d{2}\/\d{4})\s+B\/F/);
      if (dateMatch) {
        const newDate = dateMatch[1];
        if (newDate !== currentDate) {
          currentDate = newDate;
          entryCounter = 0;
        }
        continue;
      }

      // 🔹 Detect new journal entry → "1  47821.00 SILAGE FACTORY"
      const entryStart = line.match(/^(\d+)\s+([\d,]+(?:\.\d+)?)\s+(.+)$/);
      if (entryStart) {
        // Save previous entry if valid
        if (
          currentEntry &&
          ledgerList.length > 0 &&
          ledgerList[0].name !== "0" &&
          ledgerList[0].name !== ""
        ) {
          ledgerList.forEach((l, index) => {
  let amt = l.amount.replace(/,/g, ""); // keep as string

  // Only make negative for Dr. Amount (first ledger)
  if (index === 0) {
    let amtNum = parseFloat(amt);
    if (!isNaN(amtNum) && amtNum > 0) amt = (-amtNum).toString();
  }

  currentEntry[`ledname${index + 1}`] = l.name;
  currentEntry[`Dbtamt${index + 1}`] = amt;
});

          currentEntry.Narration = narration.trim();
          entries.push({ Jrnlentry: currentEntry });
        }

        // Reset for new entry
        ledgerList = [];
        narration = "";
        entryCounter += 1;

        ledgerList.push({
          name: entryStart[3].trim(),
          amount: entryStart[2].trim(),
        });

        currentEntry = {
          number: entryCounter,
          date: currentDate || "",
        };
        continue;
      }

      // 🔹 Skip lines that are narration dates / start with Being
      const isNarrationDate = line.match(
        /^(\d{1,2}\s+)?(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)(\s+\d{4})?$/i
      );
      const startsWithBeing = line.match(/^Being/i);
      if (isNarrationDate || startsWithBeing) {
        narration += (narration ? " " : "") + line;
        continue;
      }

      // ------------------------------
      // 🔹 Improved ledger detection with UPI/Paytm/PhonePe filter
      // ------------------------------
      let ledgerLine = null;
      const amountPattern = "[\\d,]+(?:\\.\\d+)?";

      const amtFirst = line.match(new RegExp("^(" + amountPattern + ")\\s+(.+)$"));
      const nameFirst = line.match(new RegExp("^(.+?)\\s+(" + amountPattern + ")$"));

      if (amtFirst) {
        ledgerLine = {
          amount: amtFirst[1].trim(),
          name: amtFirst[2].trim(),
        };
      } else if (nameFirst) {
        ledgerLine = {
          name: nameFirst[1].trim(),
          amount: nameFirst[2].trim(),
        };
      }

      if (!ledgerLine) {
        narration += (narration ? " " : "") + line;
        continue;
      }

      const isPaymentLine = /UPI|Paytm|PhonePe|GPay/i.test(line);
      const amountNum = parseFloat(ledgerLine.amount.replace(/,/g, "")) || 0;
      const isSmallOrYear =
        (amountNum >= 1 && amountNum <= 31) ||
        (amountNum >= 2023 && amountNum <= 2099);

      const nameLooksLikeNarration = ledgerLine.name.match(
        /(Bill|Being|Slip|No\.|Dated|Against|Interest|Payment|Total|C\/F|B\/F|BALES|WT|SLIP)/i
      );
      const cleanAmountCheck = /^[\d,]+(?:\.\d+)?$/.test(ledgerLine.amount.replace(/\s+/g, ""));
      const nameIsNumeric = /^[\d,\.]+$/.test(ledgerLine.name);

      if (
        cleanAmountCheck &&
        !nameIsNumeric &&
        ledgerLine.name &&
        !nameLooksLikeNarration &&
        !isPaymentLine &&
        !isSmallOrYear &&
        ledgerLine.amount.length <= 15
      ) {
        // ✅ Valid ledger
        ledgerList.push({
          name: ledgerLine.name,
          amount: ledgerLine.amount,
        });
        continue;
      }

      // If not ledger → treat as narration
      narration += (narration ? " " : "") + line;
    }

    // 🔹 Push last entry if valid
    if (
      currentEntry &&
      ledgerList.length > 0 &&
      ledgerList[0].name !== "0" &&
      ledgerList[0].name !== ""
    ) {
      ledgerList.forEach((l, index) => {
        let amt = parseFloat(l.amount.replace(/,/g, ""));
        if (!isNaN(amt) && amt > 0) amt = -amt; // Convert only positive to negative
        currentEntry[`ledname${index + 1}`] = l.name;
        currentEntry[`Dbtamt${index + 1}`] = amt.toString();
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
    console.error(error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};