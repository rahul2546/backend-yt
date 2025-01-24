import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/apiError.js';
import { User } from '../models/user.model.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { ApiResponse } from '../utils/apiResponse.js';

const registerUser = asyncHandler( async (req, res, next) => {
    res.status(200).json({
        success: true,
        message: "User registered successfully"
    })

    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    //create user object - create entry in db
    // remove password and refreshToken from response
    // check for user creation
    // send response back to frontend

    const { fullName, email, username, password } = req.body
    console.log(fullName, email, username, password);

    if ([fullName,email,username,password].some((field) => field?.trim() ==="")){
        throw new ApiError(400, "All fields are required")  
    }

    const existedUser = await User.findOne({
        $or: [
            { email },
            { username }
        ]
    })

    if (existedUser){
        throw new ApiError(409, "User already exists")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImagePath = req.files?.coverImage[0]?.path;

    if (!avatarLocalPath){
        throw new ApiError(400, "Avatar is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImagePath);

    if (!avatar){
        throw new ApiError(500, "Failed to upload avatar")
    }

    const user = await User.create({
        fullName,
        email,
        username: username.toLowerCase(),
        password,
        avatar: avatar.url,
        coverImage: coverImage?.url || null
    })

    const createdUser = user.findById(user._id).select("-password -refreshToken")

    if (!createdUser){
        throw new ApiError(500, "Failed to create user")
    }

    return res.status(201).json(new ApiResponse(201, createdUser, "User registered successfully"))  




})

export { registerUser };