
const Product = require("../models/product");
const formidable = require("formidable");
const _ = require("lodash");
const fs = require("fs");
const { check, validationResult } = require('express-validator');
const { sortBy } = require("lodash");

exports.getProductById = (req, res, next, id)=> {
    Product.findById(id)
    .populate("category")
    .exec((err, product) => {
        if(err){
            return res.status(400).json({
                error: "Invalid Product"
            })
        }
        req.product = product;
        next();
    })
}

exports.getProduct = (req, res) => {
    req.product.photo = undefined;
    return res.json(req.product);
}

//Middleware
exports.photo = (req, res, next) => {
    if(req.product.photo.data){
        res.set("Content Type", res.product.photo.contentType);
        return res.send(req.product.photo.data);
    }
    next();
}

exports.createProduct = (req, res) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.parse(req, (err, fields, file)=>{
        if(err){
            return res.status(400).json({
                error: "Problem with image"
            })
        }

        //destructure the fields
        const {name, description, price, category, stock} = fields;
        const errors = validationResult(fields);
        //TODO: restrictions on fields
        if(
            !name ||
            !description ||
            !price ||
            !category ||
            !stock
        ){
            return res.status(400).json({
                error: "Please include all fields"
            })
        }
        let product = new Product(fields);


        //Handle file here
        if(file.photo){
            //size * 1024 * 1024
            if(file.photo.size > 3000000){
                return res.status(400).json({
                    error: "File Size too big"
                })
            }
            product.photo.data = fs.readFileSync(file.photo.path);
            product.photo.contentType = file.photo.type;
        }

        //save to db
        product.save((err, product)=> {
            if(err){
                res.status(400).json({
                    error: "Saving T-shirt in db failed"
                })
            }
            res.json(product);
        })
    })
}


exports.deleteProduct = (req, res) => {
    let product = req.product;
    product.remove((err, deletedProduct)=>{
        if(err){
            return res.status(400).json({
                error: "Failed to delete the product"
            })
        }
        res.json({
            message: "Deletion was a successful.", deletedProduct
        })
    })
}

exports.updateProduct = (req, res) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.parse(req, (err, fields, file)=>{
        if(err){
            return res.status(400).json({
                error: "Problem with image"
            })
        }

        //Updation code
        let product = req.product;
        product = _.extend(product, fields)


        //Handle file here
        if(file.photo){
            //size * 1024 * 1024
            if(file.photo.size > 3000000){
                return res.status(400).json({
                    error: "File Size too big"
                })
            }
            product.photo.data = fs.readFileSync(file.photo.path);
            product.photo.contentType = file.photo.type;
        }

        //save to db
        product.save((err, product)=> {
            if(err){
                res.status(400).json({
                    error: "Updation of product failed"
                })
            }
            res.json(product);
        })
    })
}

//Listing all products
exports.getAllProducts = (req, res) => {
    let limit = req.query.limit ? parseInt(req.query.limit) : 8; 
    let sortBy = req.query.sortBy ? req.query.sortBy : "_id";

    Product.find()
    .select("-photo")   //Not select this
    .populate("category")
    .sort([[sortBy, "asc"]])
    .limit(limit)
    .exec((err, products)=>{
        if(err){
            return res.status(400).json({
                error: "No product found"
            })
        }
        res.json(products);
    })
}

exports.getAllUniqueCategories = (req, res) => {
    Product.distinct("category", {}, (err, category) => {
        if(err){
            return res.status(400).json({
                error: "No catgeory found"
            })
        }
        res.json(category);
    } )
}


//Updating stock
exports.updateStock = (req, res, next) => {
    let myOperation = req.body.order.products.map(prod => {
        return {
            updateOne : {
                filter : {_id : prod._id},
                update: {$inc : {stock: -prod.count, sold: +prod.count}}
            }
        }
    })
    Product.bulkWrite(myOperation, {}, (err, products) => {
        if(err){
            return res.status(400).json({
                error: "BULK operations failed"
            })
        }
        next();
    })
}

