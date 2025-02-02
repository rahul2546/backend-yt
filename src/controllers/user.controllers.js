import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/apiError.js';
import { User } from '../models/user.model.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { ApiResponse } from '../utils/apiResponse.js';
//import { TokenExpiredError } from 'jsonwebtoken';

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }

    } catch (error) {
        throw new ApiError(500, "Failed to generate token")
    }
}

const registerUser = asyncHandler(async (req, res, next) => {
    // res.status(200).json({
    //     success: true,
    //     message: "User registered successfully"
    // })

    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    //create user object - create entry in db
    // remove password and refreshToken from response
    // check for user creation
    // send response back to frontend

    const { fullname, email, username, password } = req.body
    console.log(fullname, email, username, password);

    if ([fullname, email, username, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        $or: [
            { email },
            { username }
        ]
    })

    if (existedUser) {
        throw new ApiError(409, "User already exists")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    console.log(avatarLocalPath);
    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }
    console.log(coverImageLocalPath);

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!avatar) {
        throw new ApiError(500, "Failed to upload avatar")
    }
    console.log(avatar);

    const user = await User.create({
        fullname,
        email,
        username: username.toLowerCase(),
        password,
        avatar: avatar,
        coverImage: coverImage || null
    })

    // const createdUser =   User.findById(User._id).select("-password -refreshToken")

    // if (!createdUser){
    //     throw new ApiError(500, "Failed to create user")
    // }

    const createdUser = await User.findById(user._id)
        .select("-password -refreshToken");

    const userObject = createdUser ? JSON.parse(JSON.stringify(createdUser)) : null;

    if (!userObject) {
        throw new ApiError(500, "Failed to create user");
    }

    return res.status(201).json(new ApiResponse(201, createdUser, "User registered successfully"))

    // try {
    //     const createdUser = await User.findById(user._id)
    //         .select("-password -refreshToken");

    //     const userObject = createdUser ? JSON.parse(JSON.stringify(createdUser)) : null;

    //     if (!userObject) {
    //         throw new ApiError(500, "Failed to create user");
    //     }

    //     return res.status(201).json({
    //         statusCode: 201,
    //         data: userObject,
    //         message: "User registered successfully",
    //         success: true
    //     });
    // }
    // catch (error) {
    //     next(error); // Pass errors to the error handler middleware
    // }





})

const loginUser = asyncHandler(async (req, res,) => {
    //req body -> data
    // username or email
    //find user
    //check password
    //generate access and refresh Token
    //send response back to frontend using cookie

    const { username, email, password } = req.body
    console.log(username, email, password);

    if (!(username || email)) {
        throw new ApiError(400, "Username or email is required")
    }

    const user = await User.findOne({
        $or: [
            { username: username?.toLowerCase() },
            { email }
        ]
    })

    if (!user) {
        throw new ApiError(404, "User not found")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id)
        .select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200,
        {
            user: loggedInUser,
            accessToken,
            refreshToken
        },
        "User logged in successfully"
    ))






})


const logoutUser = asyncHandler(async (req, res) => {
   await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshtoken: undefined
            }
        },
        {
            new: true,
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, null, "User logged out successfully"))
})

export {
    registerUser,
    loginUser,
    logoutUser

};