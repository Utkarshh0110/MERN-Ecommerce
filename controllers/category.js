const Category = require("../models/category");

exports.getCategoryById = (req, res, next, id) => {

    Category.findById(id).exec((err, category)=>{
        if(err){
            res.status(400).json({
                error: "Category not found in DB"
            })
        }
        req.category = category;
        next();
    })
}


exports.createCategory = (req, res) => {
    const category = new Category(req.body);
    category.save((err, category)=>{
        if(err){
            res.status(400).json({
                error: "Not able to save category in DB"
            })
        }
        res.json({category});
    })
}

exports.getCategory = (req, res)=>{
    return res.json(req.category);
}

exports.getAllCategories = (req, res)=>{
    Category.find().exec((err, categories)=>{
        if(err){
            res.status(400).json({
                error: "No categories found"
            })
        }
        res.json(categories);
    })

}

exports.updateCategory = (req, res)=> {
    //req.category is coming from getCategoryById method since it is fired
    const category = req.category;
    category.name = req.body.name;

    category.save((err, updatedCategory)=>{
        if(err){
            res.status(400).json({
                error: "Failed to update category"
            })
        }
        res.json(updatedCategory);
    })
}


exports.deleteCategory = (req, res)=>{
    const category = req.category;
    category.remove((err, category)=>{
        if(err){
            res.status(400).json({
                error: "Failed to delete category"
            })
        }
        res.json({
            message: `${category.name} deleted successfully`
        })
    })
}