const fs = require("fs")
//above can also be written like 
// const fs = require("node:fs") // this way of writing is just to represent that the the module we are using is a CORE module , it is optional to write

const https = require("https")

console.log("hello world")

var a = 1078698;
var b = 20986;

//async function, offloaded to libuv
https.get("https://dummyjson.com/products/1", (res) => {
    console.log("Fetched https Data successfully");
    res.resume();

   
});

//async function, offloaded to libuv
setTimeout( ()=>{
    console.log("This is a timeout message after 5s")
},5000)

//synchronously read file data
const filedata = fs.readFileSync("./gossip.txt", "utf8")
console.log("synchronously fetched data:",filedata)

// //async function, offloaded to libuv
fs.readFile("./gossip.txt", "utf8", (err,data)=>{
    console.log("file data: ", data)
})


function multiplyFn(a,b){
    const result = a * b
    return result
}

var c = multiplyFn(a,b);

console.log("result: ", c)