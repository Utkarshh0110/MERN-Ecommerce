var mongoose = require('mongoose');
const crypto = require('crypto');
const uuidv1 = require('uuid/v1');

var userSchema = new mongoose.Schema({
  name: {
      type: String,
      required: true,
      maxlength: 32,
      trim: true
  },
  lastname:{
      type: String,
      trim: true,
      maxlength: 32
  },
  email:{
      type: String,
      trim: true,
      required: true,
      unique: true
  },
  userinfo:{
      type: String,
      trim: true
  },
  //TODO: come back here
  encry_password:{
      type: String,
      required: true
  },
  salt: String,
  role:{
      type: Number,
      default: 0
  },
  purchases:{
      type: Array,
      default: []
  }
  
}, {timestamps: true});


userSchema.virtual("password")
    .set(function(password){
        //Saving the password for later use.
        this._password = password;
        this.salt = uuidv1();   //setting the salt key
        this.encry_password = this.securePassword(password); //securing the password.
    })
    .get(function(){
        return this._password;
    })

//Securing the password.
userSchema.methods = {

    authenticate : function(plainpassword){
        return this.securePassword(plainpassword) === this.encry_password;
    },

    securePassword: function(plainpassword){
        if(!plainpassword) return "";
        try{
            return crypto.createHmac('sha256', this.salt)
            .update(plainpassword)
            .digest('hex');
        } catch(err){
            return err;
        }
    }
}
module.exports = mongoose.model("User", userSchema)