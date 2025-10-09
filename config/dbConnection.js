const mongoose = require("mongoose")

const Db = process.env.Db
console.log(">>>>>>>>",Db)
 const connetion = async()=>{
    try{
        await mongoose.connect(Db,{})
        console.log("db is connect ")
    }catch(error){
        console.log(error)
    }
 }


 module.exports = connetion