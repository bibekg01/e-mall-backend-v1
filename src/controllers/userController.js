import {User} from '../models/userModel.js'
import { hashPassword, comparePassword } from '../helper/auth-helper.js'
import { Token } from '../models/tokenModel.js'
import jwt from 'jsonwebtoken'
import sendEmail from '../utils/set-email.js'
import mongoose from 'mongoose'

const signup = async(req, res) => {
    try {
        const {name, email, password, phone} = req.body
        console.log(req.body);

        //Check if email already exist or not
        const existEmail = await User.findOne({email})

        if(existEmail){
            return res.status(400).json({success:false, message: "Email already exists"})
        }

        //hash password
        const hashedPassword = await hashPassword(password)

        //create the user data
        const user = new User({
            name,
            username: email.split('@')[0],
            phone,
            email,
            password:hashedPassword
        })

        // save data
        await user.save()

        // generate Token
        const token = jwt.sign({email}, process.env.JWT_SECRET, {expiresIn:"1d"})


        // create and save token
        const tokenDoc = new Token({
            token,
            user_id:user._id,
        })

        //save the token
        await tokenDoc.save()

        //email send
        // const url = `http://localhost:2000/api/v1/confirmation/${tokenDoc.token}`
        const url = process.env.FRONTEND_URL+ 'email\/confirmation/'+tokenDoc.token

        sendEmail({
            from: `noreply@mern.com`,
            to: user.email,
            subject: `Email Verification Link`,
            text: `Namaste !!! \n\nPlease Verify your Email by clicking in the link: ${url}`,
            html: `<h1> 
                    Verify Your Email.
                    <a href=${url}>Click to verify</a>
                    </h1>`
        })

        //return the success response
        return res.status(201).json({success:true, message: 'User Registered Successfully', user})
        
    } catch (err) {
        console.log(err);
        
        if(err instanceof mongoose.Error.CastError){
            return res.status(400).json({success:true, message:err.message})
        }

        return res.status(500).json({success:false, message: 'Error on signup api. '})
    }
}

const confirmEmail = async(req, res) => {
    try {
        //get the token from params
        const tokenValue = req.params.token;

        //validate token
        if(!tokenValue){
            return res.status(400).json({success:false, message: "Token is required."})
        }

        //find the token on the db
        const token = await Token.findOne({token:tokenValue})

        //validate input token
        if(!token){
            return res.status(400).json({success:false, message: "Invalid token or Token may be expired"})
        }

        //find the user for the given token
        const user = await User.findOne({_id:token.user_id})

        //validate user
        if(!user){
            return res.status(400).json({success:false, message: "Unable to find the user for this token"})
        }

        // check if the user is verified or not
        if(user.isverified){
            return res.status(400).json({success:false, message: "User Already verified. Please sign in to continue."})
        }

        //If user is not verified
        user.isverified = true
        
        //save the user data
        await user.save()

        return res.status(200).json({success:true, message: `Email id: ${user.email} is verified successfully. Please signin to continue.`})
        
    } catch (err) {
        console.log(err);
        
        if(err instanceof mongoose.Error.CastError){
            return res.status(400).json({success:true, message:err.message})
        }

        return res.status(500).json({success:false, message: 'Error on confirmation api. '})
    }
}

const signin = async(req, res) => {
    try {
        const {email, password} = req.body
        console.log(req.body)

        //find a user by email
        const user = await User.findOne({email:email})

        //validate user
        if(!user){
            return res.status(400).json({success:false, message: "User not found in the system."})
        }

        // compare if password is matched or not
        const isPasswordMatch = await comparePassword(password, user.password)

        //validate password
        if(!isPasswordMatch){
            return res.status(400).json({success:false, message: "Incorrect Password"})
        }

        //check if user is verified or not
        if(!user.isverified){
            return res.status(400).json({success:false, message: "User is not verified."})
        }
        
        // generate Token
        const token = jwt.sign({_id:user._id, role:user.role}, process.env.JWT_SECRET, {expiresIn:"1d"})
        res.cookie('authToken')

        //respond with success msg
        return res.status(200).json({success:true, message: "Login Successful", token, 
            user:{
                _id:user._id,
                name:user.name,
                role:user.role,
                email:user.email
            }
        })


    } catch (err) {
        console.log(err);
        
        if(err instanceof mongoose.Error.CastError){
            return res.status(400).json({success:true, message:err.message})
        }

        return res.status(500).json({success:false, message: 'Error on signup api. '})
    }
}

const userDetails = async(req, res) => {
    try {
        const username = req.params.username
        console.log(req.params.username)
        const details = await User.findOne({username:username})
        console.log(details);        
        

        if(!details){
            return res.status(400).json({success:false, message: "Cannot find the details in the system"})
        }
        
        return res.status(200).json({success:true, message: "User details", details})
        
    } catch (err) {
        console.log(err);
        
        if(err instanceof mongoose.Error.CastError){
            return res.status(400).json({success:true, message:err.message})
        }

        return res.status(500).json({success:false, message: 'Error on getting user details.'})
    }
}
const userList = async(req, res) => {
    try {
        const user = await User.find()
        if(!user || user.length === 0){
            return res.status(400).json({success:false, message: "User not found"})
        }
        return res.status(200).json({success:true, message: "Users List", user})


        
    } catch (err) {
        console.log(err);
        
        if(err instanceof mongoose.Error.CastError){
            return res.status(400).json({success:true, message:err.message})
        }

        return res.status(500).json({success:false, message: 'Error on signup api. '})
    }
}

const deleteUser = async(req, res) => {
    try {
        const username = req.params.username
        const usernameToDelete = await User.findOneAndDelete({username:username})
        if(!usernameToDelete){
            return res.status(400).json({success:false, message:"User not Found"})
        }
        return res.status(200).json({success:true, message:"User ID deleted"})
        


    } catch (err) {
        console.log(err);
        
        if(err instanceof mongoose.Error.CastError){
            return res.status(400).json({success:true, message:err.message})
        }

        return res.status(500).json({success:false, message: 'Error on signup api. '})
    }
}

const forgetPassword = async(req, res) => {
    try{
        const { email } = req.body;
        console.log(email)

        // check if the email exists or not
        const user = await User.findOne({email})

        if(!user){
            return res.status(404).json({success:false, message:"User not Found"})
        }

        // generate Token
        const token = jwt.sign({email}, process.env.JWT_SECRET, {expiresIn:"1d"})


        // create and save token
        const tokenDoc = new Token({
            token,
            user_id:user._id,
        })

        //save the token
        await tokenDoc.save()

            
            // send reset link in email
            const url = `http://localhost:2000/api/v1/reset-password/${tokenDoc.token}`
            
            sendEmail({
                from: 'passwordresetlink@mern.com',
                to: user.email,
                subject: `Password Reset Link`,
                text: `Namaste !!! \n\nPlease Reset your Password by clicking in the link: ${url}`,
                html: `<h1> 
                Reset Your Password.
                <a href=${url}>Click to Reset Password.</a>
                </h1>`
            })
            
            return res.status(200).json({success:true, message: "Password reset link Sent to your E-mail."})
        }

    catch(err){
        console.log(err);

        if(err instanceof mongoose.Error.CastError){
            return res.status(400).json({success:true, message:err.message})
        }

        return res.status(500).json({success:false, message: 'Error on Forget Password api'})
    }
}

const resetPassword = async(req, res) => {
    try {
        //get the token from params
        const tokenValue = req.params.token;

        //validate token
        if(!tokenValue){
            return res.status(400).json({success:false, message: "Token is required."})
        }

        //find the token on the db
        const token = await Token.findOne({token:tokenValue})

        //validate input token
        if(!token){
            return res.status(400).json({success:false, message: "Invalid token or Token may be expired"})
        }

        //find the user for the given token
        const user = await User.findOne({_id:token.user_id})

        //validate user
        if(!user){
            return res.status(400).json({success:false, message: "Unable to find the user for this token"})
        }


        //If user is not verified
        user.password = await hashPassword(req.body.password)
        
        //save the user data
        await user.save()

        return res.status(200).json({success:true, message: `Password reset successfully. Please signin to continue.`})
        
    } catch (err) {
        console.log(err);
        
        if(err instanceof mongoose.Error.CastError){
            return res.status(400).json({success:true, message:err.message})
        }

        return res.status(500).json({success:false, message: 'Error on reset password api. '})
    }
}

const signout = async(req, res) => {
    try {
        const {email} = req.body

        const user = await User.findOne({email})

        if(!user){
            return res.status(404).json({success:false, message:"Email not found in the system."})
        }
        res.clearCookie('authToken')
        res.status(200).json({success:true, message:'Signout SuccessFully.'})

        
    } catch (err) {
        console.log(err);
        
        if(err instanceof mongoose.Error.CastError){
            return res.status(400).json({success:true, message:err.message})
        }

        return res.status(500).json({success:false, message: 'Error on signout api. '})
    }
}




export {
    signup,
    confirmEmail,
    signin,
    userDetails,
    userList,
    deleteUser,
    forgetPassword,
    resetPassword,
    signout
}