import jwt from 'jsonwebtoken';


const requireSignin = (req, res) => {
    const token = req.headers.authorization.split(".")[1]
    console.log(token);
    
    if(!token){
        res.status(400).json({success:false, message: "Authorization required. "})
    }

    try {
        const user = jwt.verify(token, process.env.JWT_SECRET)
        req.user = user
        next()


    } catch (err) {
        console.log(err);        
        return res.status(401).json({success:false, message: "Unauthorized."})
        
    }

}

const requireAdmin = (req, res) => {
    if(req.user?.role === 1){
        console.log("admin access granted");
        next()
    }
    else{
        console.log('Unauthorized Admin');   
    }
}
const requireUser = (req, res) => {
    if(req.user?.role === 0){
        console.log("User access granted");
        next()
    }
    else{
        console.log('Unauthorized ');   
    }
}


export {
    requireAdmin,
    requireUser,
    requireSignin
}