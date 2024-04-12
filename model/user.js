const mongoose= require("mongoose");
//Structure creating 
const userSchema= new mongoose.Schema({
    email:String,
    password:String
})

module.exports= mongoose.model("User",userSchema);