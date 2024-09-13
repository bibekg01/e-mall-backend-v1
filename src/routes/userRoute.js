import {Router} from "express"
import { signup, forgetPassword, confirmEmail, signin, userDetails, userList, deleteUser, resetPassword, signout } from "../controllers/userController.js";


const router = Router()


router.post('/signup', signup);
router.put('/confirmation/:token', confirmEmail)
router.post('/signin',signin)
router.get('/user-details/:username', userDetails)
router.get('/user-list', userList)
router.get('/delete-user/:username', deleteUser)
router.post('/forget-password', forgetPassword)
router.put('/reset-password/:token', resetPassword)
router.post('/signout', signout)


export default router;