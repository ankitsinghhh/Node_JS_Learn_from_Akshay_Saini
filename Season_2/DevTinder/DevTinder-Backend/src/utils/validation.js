const validator = require('validator')
const { validate } = require('../models/user')

const validateSignupData = (req)=>{
    const {firstName,lastName,email, password} = req.body

    if(!firstName || !lastName ){
        throw new Error("Name is not valid")
    }
    else if(!validator.isEmail(email)){
        throw new Error("Email is not valid")
    }
    else if(!validator.isStrongPassword(password)){
        throw new Error("Please enter a Strong Password")
    }
}

const validateLoginData = (req) =>{
    const {email} = req.body
    if(!validator.isEmail(email)){
        throw new Error("Email is not valid")
    }
}

//creating validateProfileData function to validate the data for editing profile such that only those fields which are allowed to be edited are edited
const validateEditProfileData = (req) =>{
    const allowedEditFields = [
        "firstName",
        "lastName",
        "email",
        "gender",
        "age",
        "skills",
        "about",
        "photoUrl"        
    ]

    const isEditAllowed = Object.keys(req.body).every(
        (field) => allowedEditFields.includes(field)
    ) //check if the field is allowed to be edited

    return isEditAllowed

}

module.exports = {
    validateSignupData,
    validateLoginData,
    validateEditProfileData,
}