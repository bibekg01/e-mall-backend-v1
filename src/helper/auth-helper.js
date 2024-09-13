import bcrypt from 'bcrypt'


export const hashPassword = async(password) => {
    try{
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        return hashedPassword;
    } catch (error) {
        console.log("Error hashing password", error)
    }
};


export const comparePassword = async(password, handlePassword) => {
    try{
        const match = await bcrypt.compare(password, handlePassword);
        return match;
    } catch(error){
        console.log("Error comparing passwords", error);
        
    }
}





// module.exports.errorHandler = (func) => {
//     return (req, res, next) => {
//       func(req, res, next).catch((err) => {
//         console.log("error is here", err);
//         if (typeof err === "string") {
//           console.log("Error in error handler");
//           res.json({ status: "error", message: err, data: null });
//         } else if (err.type === "VALIDATION_ERROR") {
//           res.json({ status: "error", message: err.message, data: null });
//         } else {
//           res.json({
//             status: "error",
//             message: "Internal Server Error",
//             data: null,
//           });
//         };
//       });
//     };
//   }