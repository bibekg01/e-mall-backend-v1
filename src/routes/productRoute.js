import {Router} from "express"
import {productCount, productUpdate, productDetails, productDelete, postProduct, getProduct} from '../controllers/productController.js'
import upload from '../middlewares/file-upload.js'
import { productValidation, validation } from "../validation/validator.js"

const router = Router()


router.post('/add-product',upload.array('product_images', 4),validation,productValidation, postProduct);
router.get('/product-list', getProduct);
router.put('/update-product/:slug',upload.array('product_images', 4), productUpdate);
router.get('/product-details/:slugp',productDetails);
router.delete('/delete-product/:slug', productDelete)
router.get('/product-count', productCount)

export default router;