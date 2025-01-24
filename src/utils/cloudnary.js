import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs';


cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});


const uploadOnCloudinary = async (localFilePath) => {
    
    try {
        if (!localFilePath){
            throw new Error("File path is required")
        }
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        // file uploaded on cloudinary
        console.log("file uploaded on cloudinary", response.url);
        return response.url;
    }catch(error){
        fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the upload operation got failed
        console.log(error);
        return null;
    }
}

export {uploadOnCloudinary};


