// Importing the Express framework
const express = require('express');
const cookieParser = require('cookie-parser')
const {connectDB} = require('./config/database');
const cors = require('cors');


// Creating an instance/object of an Express application
const app = express();
//middlware to parse the json data coming from the request body to the javascript object
app.use(
  cors({
        origin: "http://localhost:5173", // this is the frontend url
        credentials: true, // this is to allow the cookies to be sent to the frontend
      })
)
app.use(express.json())
app.use(cookieParser())


const authRouter = require("./routes/authRouter")
const profileRouter = require("./routes/profileRouter")
const requestRouter = require("./routes/requestRouter")
const userRouter = require("./routes/userRouter")

app.use("/",authRouter)
app.use("/",profileRouter)
app.use("/",requestRouter)
app.use("/",userRouter)

// now the above code means that , when the request will come lets say /login , then it will check in first authRouter and it will match there 
// but when the request will come as /profile , then also it will first check inside the authRouter and it will not find , then move on to the next one , then in profileRouter where the request /profile will be matched and response will be sent 

//connecting to the database first then initializing the server
connectDB()
.then(()=>{
  console.log("database connection established successfully") 
  //after establishing database connection, we can start the server using app.listen
  app.listen(7777, () => {
    console.log("✅ Server is running on port 7777 🚀");
  });
}
)
.catch((err)=>{
  console.log("database connection failed",err)
})



