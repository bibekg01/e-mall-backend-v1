import { Product } from "../models/productModel.js";
import { Category } from "../models/categoryModel.js";
import slugify from "slugify";
import cloudinary from "../utils/cloudinaryConfig.js";
import fs from "fs-extra";


const postProduct = async (req, res) => {
    try {

        const { product_name, product_description, product_price, product_rating, count_in_stock, category } = req.body
        const slug = slugify(product_name, {lower:true, strict:true} )
        
        const existingProduct = await Product.findOne({ slug })
        if(existingProduct){
            return res.status(400).json({ success: false, message: "Product already exists" })
        }
        
        const imageFiles = req.files
        console.log(imageFiles);
        const uploadedImages = [];
        for (const file of imageFiles){
            const filePath = file.path
            console.log(filePath)
            try{
                const result = await cloudinary.uploader.upload(filePath, {folder: "products"})
                uploadedImages.push(result.secure_url)

                //
                await fs.remove(filePath)
            }
            catch(error){
                console.log( "Error on uploading image",error )
            }
        }

        let newProduct = new Product({
            product_name,
            slug,
            product_description,
            product_price,
            product_rating,
            count_in_stock,
            category,
            product_images: uploadedImages
        })

        newProduct = await newProduct.save()
        
        if(!newProduct){
            return res.status(500).json({ success: false, message: "Product not created" })
        }
        return res.status(201).json({ success: true, message: "Product created", newProduct })



    }
    catch (error) {
        console.log(error)

        if(uploadedImages.length > 0){
            for (const url of uploadedImages){
                const publicId = url.split('/').slice(-1)[0].split('.')[0];

                await cloudinary.uploader.destroy(`products/${publicId}`)
            }
        }

        return res.status(500).json({ success: false, message: "Error on post product api" })
    }
}


const getProduct = async(req,res)=>{

    const page=parseInt(req.query.page || 1)
    const itemsPerPage=parseInt(req.query.limit || 4) // items/page

    if(page<=0 || itemsPerPage<=0){
        return res.status(400).json({message:"Invalid page or limit parameters.", success:false})
    }

    const searchQuery=req.query.search || '';

    try{

        const totalProductsCount=await Product.countDocuments({
            $or:[
                {product_name: {
                    $regex:searchQuery, $options:'i' // case-insensitive
                }
                },
                {product_description: {
                    $regex:searchQuery, $options:'i' // case-insensitive
                }
                },

            ]
        })

        const totalPages= Math.ceil( totalProductsCount/itemsPerPage)
        const skip=(page-1)*itemsPerPage 
        // 2-1=1 * 4 =4
        
        const products = await Product.find(
            {
                $or:[
                    {product_name: {
                        $regex:searchQuery, $options:'i' // case-insensitive
                    }
                    },
                    {product_description: {
                        $regex:searchQuery, $options:'i' // case-insensitive
                    }
                    },
    
                ]
            }
        )
        .populate('category', 'category_name')
        .skip(skip)
        .limit(itemsPerPage)
        .exec()

        if(!products){
            return res.status(404).json({
                succes:false, 
                message:"product not found"})
        }
        return res.status(200).json({
            success:true,
            message:"Product List",
            products,
            count:products.length,
            currentPage:page,
            totalPages, 
            totalItems:totalProductsCount
        })

    }
    catch(error){
        console.log(error)
        if(error instanceof mongoose.Error.CastError){
            return res.status(400).json({
                message:"Cast Error. Invalid ObjectId"})
        }
        return res.status(400).json({
            success:false, message:"Error on getting the product list api", 
            details:error})
    }


}


const productDetails = async(req, res) => {
    try {
        const slug = req.params.slugp
        const product = await Product.findOne({slug}).populate('category', 'category_name')
        if(!product){
            return res.status(404).json({success:false, message: "Product not Found"})
        }
        return res.status(200).json({success:true, message: "Product Details", product})
        
    } catch (error) {
        console.log(error)
        return res.status(500).json({success:false, message: "Error on Product details"})
    }
}

const productUpdate = async(req,res)=>{

    try{
        const { product_name, product_price, product_description, product_rating, category, count_in_stock } = req.body;
        const imageFiles = req.files || [];

        const slug = req.params.slug 
        console.log(slug)

        let updatedFields = {}
        // if product name is provided, then create a new slug.
        if (product_name){
            updatedFields.product_name = product_name
            updatedFields.slug = slugify(product_name, {lower:true, strict:true})
        }

        // assign other fields from body.
        if (product_price){
            updatedFields.product_price = product_price
        }
        if (product_description){
            updatedFields.product_description = product_description
        }
        if (product_rating){
            updatedFields.product_rating = product_rating
        }
        if (count_in_stock){
            updatedFields.count_in_stock = count_in_stock
        }
        if (category){
            updatedFields.category = category
        }

        if (imageFiles && imageFiles.length>0){

            const uploadedImages = [];

            for (const file of imageFiles) {
                const filePath = file.path;
    
                try {
                    // Upload to Cloudinary
                    const result = await cloudinary.uploader.upload(filePath, {
                        folder: 'products',
                    });
    
                    uploadedImages.push(result.secure_url);
                    // remove the file from local storage after upload to cloudinary.
                    await fs.remove(filePath)
    
                } catch (error) {
                    console.error('Error uploading to Cloudinary:', error);
                    return res.status(400).json({
                        message: 'Error uploading images to Cloudinary',
                        success: false,
                    });
                }
            }

            // add new images to the updated field.
            updatedFields.product_images= uploadedImages
        }

        // find product by slug and update
        const updatedProduct = await Product.findOneAndUpdate({slug},updatedFields, {new:true} )

        console.log(updatedProduct)

        if (!updatedProduct){
            return res.status(404).json({success:false, message:"Product not found."})
        }

        return res.status(200).json({success:true, message:"Product Updated", updatedProduct})


    }
    catch(error){
        console.log(error) 
        return res.status(500).json({success:false, message:"Error on update product api."})
    }

}

const productDelete = async(req, res) => {
    try {
        const slug = req.params.slug
        const productToDelete = await Product.findOneAndDelete({slug})
        if(!productToDelete){
            return res.status(400).json({success:false, message:"Product not Found"})
        }
        return res.status(200).json({success:true, message:"Product deleted"})
        
    } catch (error) {
        console.log(error)
        return res.status(500).json({success:false, message: "Error on product delete"})       
    }
}

const productCount = async(req,res) => {
    try {
        const productCounter = await Product.countDocuments();
        if(!productCounter){
            return res.status(400).json({success:false, message: "Product not found"})
        }
        return res.status(200).json({success:true, message: `Product Count is ${productCounter}`, productCounter})
        
    } catch (error) {
        console.log(error)
        return res.status(500).json({success:false, message: "Error on product count"})           
    }
}

export {
    productCount, productUpdate, productDetails, productDelete, postProduct, getProduct
}
