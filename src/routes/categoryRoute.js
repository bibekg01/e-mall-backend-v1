import {Router} from "express";
import { postCategory, getCategory, categoryDetails, categoryUpdate, categoryDelete, CategoryCount } from "../controllers/categoryController.js";
import { categoryValidation, validation } from "../validation/validator.js";
const router = Router()


//routes

router.post('/add-category',validation, categoryValidation, postCategory)
router.get('/categories-list', getCategory)
router.get('/category-details/:slugabc',categoryDetails)
router.put('/category-update/:slug', categoryUpdate)
router.delete('/category-delete/:slug',  categoryDelete)
router.get('/category-count', CategoryCount)

export default router;