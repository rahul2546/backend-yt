import {app} from "./app.js";
import dotenv from "dotenv";
import connectDB from "./db/index.js";

dotenv.config({
    path: './env'
})




connectDB()
.then(() => {
    
    
    app.listen(process.env.PORT || 8000, () => {
         console.log(`server is running on port : ${process.env.PORT}`);
    })

})
.catch((err) => {
   console.log("MONGO db connection failed !!!", err);
})











/*
import express from "express";
const app = express();


;( async ()=> {
    try {
       await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}` )  //Connecting to the database
         console.log("Connected to database")

         app.on("error", (err) => { //Error handling related to the database and express communication
            console.error("Error: ", err); 
            throw err
        })

        app.listen(process.env.PORT, () => { //Listening to the port
            console.log(`Server is running on port {process.env.PORT}`);
        })

    } catch (error) {
        console.error("Error: ", error)
        throw err
    }
})()

*/