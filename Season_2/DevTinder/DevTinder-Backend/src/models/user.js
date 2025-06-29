const mongoose = require('mongoose');
const validator = require('validator')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

const userSchema = new mongoose.Schema(
    {
        firstName: { 
            type: String,
            required: true,
            minLength:4,
            maxLength:50,
            trim:true
            },
        lastName: { 
            type: String, 
            required: true ,
            trim:true
        },
        //if email is not index . then /login api will become very slow as db has go one by one through each meail  { if unique:true is applied , then automatically index is created  } otherwise to apply indexing , you can just use index:true
        email: { 
            type: String, 
            required: true, 
            unique: true,
            lowercase: true,
            trim:true,
            validate(value){
                if(!validator.isEmail(value)){
                    throw new Error("invalid Email address: " + value)
                }
            }
        },
        password: { 
            type: String,
            required: true ,
            trim:true, 
            validate(value){
                if(!validator.isStrongPassword(value)){
                    throw new Error("Enter Strong password "+ value + `
                       suggestions for strong password => { minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1}`)
                }
            }
            },
        age: {
            type: Number,
            min:18,
            max:99
            },
        gender: { 
            type: String,
            enum: {
                values:["male","female","others"],
                message:`{VALUE} is not a valid gender type`
            }
            // validate(value){ //by default validate method is only called when new object is created ( wont run while patching by default)
            //     if(!["male","female","others"].includes(value)){
            //         throw new Error("Gender Data is not valid | it should be one of these values: male, female, others")
            //     }   
            // }
        },
        photoUrl:{
            type:String,
            default:"https://avatars.githubusercontent.com/u/40992581?v=4",
            validate(value){
                if(!validator.isURL(value)){
                    throw new Error("Invalid photo URL address: " + value)
                }
            }

        },
        about:{
            type:String,
            default:"Write your about here..."
        },
        skills:{
            type:[String],
        }
    },
    {timestamps:true}
);

//compound index to search a user by firstName and lastName
userSchema.index({firstName:1,lastName:1})
userSchema.index({gender:1})

//why we are not using arrow function is becuase inside an arrow function, {this} will not work
userSchema.methods.getJWT = async function(){
    const user=this;
     //create a JWT token
     const token = await jwt.sign({_id:user._id}, "Dev@Tinder&798",{expiresIn: "1d"})
    //  console.log(token)
    return token
}

userSchema.methods.validatePassword = async function(passwordInputByUser){
    const user = this
    const passwordHash = user.password
    //checking if the password is valid or not using bcrypt.compare
    const isPasswordValid = await bcrypt.compare(
        passwordInputByUser,
        passwordHash
    )

    return isPasswordValid
}

// creating mongoose model 
const User = mongoose.model("User", userSchema);

module.exports = User;  // Export the model properly
