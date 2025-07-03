// Importing the Express framework
const express = require('express');
require('dotenv').config();
const cookieParser = require('cookie-parser')
const {connectDB} = require('./config/database');
const cors = require('cors');
const http = require('http')

require("./utils/cronjob.js")


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
const premiumRequestRouter = require("./routes/premiumRequestRouter")
const razorpayRouter = require("./routes/razorpayRouter");
const chatRouter = require("./routes/chatRouter")
const initializeSocket = require('./utils/socket.js');

app.use("/",authRouter)
app.use("/",profileRouter)
app.use("/",requestRouter)
app.use("/",userRouter)
app.use("/",premiumRequestRouter)
app.use("/",razorpayRouter)
app.use("/", chatRouter);

//creating a server using http module
const server = http.createServer(app)
initializeSocket(server)


 



//connecting to the database first then initializing the server
connectDB()
.then(()=>{
  console.log("database connection established successfully") 
  //after establishing database connection, we can start the server using app.listen
  server.listen(process.env.PORT, () => {
    console.log("✅ Server is running on port 7777 🚀");
  });
}
)
.catch((err)=>{
  console.log("database connection failed",err)
})



