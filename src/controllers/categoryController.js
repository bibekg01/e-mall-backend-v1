import {Category} from '../models/categoryModel.js'
import slugify from 'slugify'


//CUD

const postCategory = async(req, res) => {
    try{
        // const {category_name} = req.body
        // console.log("Category Name:", category_name)
        // if(!category_name || typeof(category_name) !== 'string'){
        //     return res.status(400).json({success:false, message: "ctegory Invalid"})
        // }
        // //check if the category already exist

        const category_name = req.body.category_name;

        const categoryExists = await Category.findOne({
            category_name :category_name
        })
        if(categoryExists){
            return res.status(400).json({success:false, message: 'Category already exists'})
        }


        const slug = slugify(category_name,{lower:true, strict:true} )
        // Laptop and Accessories
        const newCategory = await Category.create({category_name:category_name, slug})


        return res.status(201).json({success: true, message: 'Category Created Successfullt', newCategory})
    }
    catch(error){
        console.log(error)
        return res.status(400).json({success:false, message: "Error on post category api"})
    }
}




const getCategory = async(req, res) => {
    try{
        const categories = await Category.find()
        if(!categories || categories.length == 0){
            return res.status(404).json({success:false, message: "Categories not found. "})
        }
        return res.status(200).json({success:true, message: "Category List", categories})
    }catch(error){
        console.log(error)
        return res.status(400).json({success:false, message: "Error on post category api"})
    }
}


// const categoryDetails = async(req,res)=>{
//     try{
//         const id= req.params.id
//         console.log("id",id)
//         const category = await Category.findById(id)

//         if(!category){
//             return res.status(404).json({success:false, message: "Category not found"})
//     }

//         return res.status(200).json({success:true, message: "Category Details", category})
// }
//     catch(error){
//         console.log(error)
//         return res.status(500),json({success: true, message:"error on category details"})
//     }
// }

const categoryDetails = async(req,res)=>{
    try{
        const slug= req.params.slugabc

        const category = await Category.findOne({slug})

        if(!category){
            return res.status(404).json({success:false, message: "Category not found"})
    }

        return res.status(200).json({success:true, message: "Category Details", category})
}
    catch(error){
        console.log(error)
        return res.status(500),json({success: true, message:"error on category details"})
    }
}

const categoryUpdate = async(req, res)=>{
    try{
        const slug = req.params.slug
        const category_name = req.body.category_name
        console.table(category_name)

        const updatedCategory = await Category.findOneAndUpdate({slug}, {category_name, slug:slugify(category_name,{lower:true, strict:true} )}, {new:true})
        
        if(!updatedCategory){
            return res.status(404).json({success:false, message: "Category not found"})
        }
        return res.status(200).json({success:true, message: "Category Updated", updatedCategory})

    }
    catch{
        console.log(error)
        return res.status(500),json({success: true, message:"error on category update"})
    }
}

const categoryDelete = async(req,res) => {
    try{
        const slug = req.params.slug
        const catagoryToDelete = await Category.findOneAndDelete({slug})

        if(!catagoryToDelete){
            return res.status(404).json({success:false, message: "Category not found"})
        }
        return res.status(200).json({success:true, message: "Category Deleted", catagoryToDelete})
    }
    catch(error){
        console.log(error)
        return res.status(500).json({success: true, message:"error on category delete"})
    }
}


//Homework
const CategoryCount =async(req, res)=>{
    try{
        const categoryCounter = await Category.countDocuments()
        if(!categoryCounter){
            return res.status(400).json({success:false, message: "Category not Found"})
        }
        return res.status(200).json({success:true, message: `Number of Categories: ${categoryCounter}`, categoryCounter})
    }
    catch(error){
        console.log(error)
        return res.status(500).json({success:false, message: "Error on Category Count"})
    }
}

export{
    getCategory, postCategory, categoryDetails, categoryUpdate, categoryDelete, CategoryCount
}
