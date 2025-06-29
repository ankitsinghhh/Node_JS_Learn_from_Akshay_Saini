const mongoose = require('mongoose')

const connectionRequestSchema = new mongoose.Schema(
    {
        fromUserId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User", // it creates a link b/w the two tables user and connection requests -> basically a reference to the user collection/table
            required:true,
        },
        toUserId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true,
        },
        status:{
            type:String,
            required:true,
            // we create enum where we want the user to strict to some values
            enum:{
                values:["ignored","interested","accepted","rejected"],
                message:`{VALUE} is incorrect status type`
            } 
        },


    },
    {
    timestamps:true
    }
)

connectionRequestSchema.index({fromUserId:1, toUserId:1}) // here 1 means ascending order, -1 means descending order
// why compound index -> 


//in models , never use arrow functions ,user normal funcitons only
// the below function is kind of  like a middlware which will be called pre/before saving 
// simply , before saving the below function will be called
// next() is used coz its like a middlware
connectionRequestSchema.pre("save",function(next){
    const connectionRequest = this
    //CHECK if the frromUserId is same as toUserId
    if(connectionRequest.fromUserId.equals(connectionRequest.toUserId)){
        throw new Error("cannot send connection request to yourself")
    }
    next()
})

const ConnectionRequestModel = new mongoose.model(
    "ConnectionRequest",
    connectionRequestSchema
)

module.exports = ConnectionRequestModel