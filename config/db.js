const mongoose = require('mongoose')
require("node:dns/promises").setServers(["1.1.1.1","8.8.8.8"])
const connectionString = process.env.DBCONNECTION

mongoose.connect(connectionString).then(res=>{
    console.log("Database Connection Successfull");
}).catch(error=>{
    console.log("Database Connection Failed");
    console.log(error);
})