//require is used to import a moudle inside another module  

// cjs pattern to import
// require("./xyz.js")
// const x = require("./sum.js")

// without object destructuring
// const obj = require("./sum.js")

//object destructuring
// const {x,calcsum} = require("./calculate/sum.js")
// const calcmul = require("./calculate/multiply.js") 

// instead of importing from two of them , we can create index.js in that folder and import them in that one and export them together from this index file 
const {calcmul,calcsum,x} = require("./calculate") // it makes it easier to import and also now that folder is acting like a module and we need not to write /calculate/index.js , only calculate does the work


// es6/mjs pattern to import
// import { calcsum,x } from './sum.js'


const data = require("./data.json")
console.log(data)

var a =10;
var b =20;

// calcsum(a,b), when we require a module , we cannot directly access varaibles and methods in that module simply by requiring it 

//with object destructuring
console.log(x)
calcsum(a,b)
calcmul(a,b)

// without object destructuring
// console.log(obj.x)
// obj.calcsum(a,b)

var name="ankit"

console.log(name)

