var express = require('express');
var app = express();
let middleware = require('./middleware');
var multer  = require('multer');
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './view/img/products/')
    },
    filename: function (req, file, cb) {
        cb(null, req.body.sku + '.jpg')
    }
});
var upload = multer({ storage: storage });
var furniture = require('../model/furnitureModel.js');
app.get('/api/getFurnitureByCat', function (req, res) {
    var cat = req.query.cat;
    var countryId = req.query.countryId;
    furniture.getFurnitureByCat(countryId, cat)
        .then((result) => {
            res.send(result);
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send("Failed to get furniture by category");
        });
});

app.get('/api/getFurnitureBySku', function (req, res) {
    var sku = req.query.sku;
    var countryId = req.query.countryId;
    furniture.getFurnitureBySku(countryId, sku)
        .then((result) => {
            res.send(result);
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send("Failed to get furniture by sku");
        });
});

app.get('/api/getAllFurniture', middleware.checkToken, function (req, res) {
    furniture.getAllFurniture()
        .then((result) => {
            res.send(result);
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send("Failed to get all furniture");
        });
});

// Room to furniture category mapping
var roomToCategories = {
    'Living Room': ['Sofas & Chair', 'Tables & Desks', 'Cabinets & Storage', 'Lightings'],
    'Bedroom': ['Beds & Mattresses', 'Cabinets & Storage', 'Lightings'],
    'Study Room': ['Tables & Desks', 'Cabinets & Storage', 'Lightings', 'Study'],
    'Kitchen': ['Cabinets & Storage', 'Tables & Desks'],
    'Bathroom': ['Bathroom', 'Cabinets & Storage'],
    'Garden': ['Tables & Desks', 'Lightings']
};

app.get('/api/getFurnitureByRoom', function (req, res) {
    var room = req.query.room;
    var countryId = req.query.countryId;
    
    if (!room || !roomToCategories[room]) {
        return res.status(400).send("Invalid room type");
    }
    
    var categories = roomToCategories[room];
    var promises = categories.map(function(cat) {
        return furniture.getFurnitureByCat(countryId, cat);
    });
    
    Promise.all(promises)
        .then(function(results) {
            // Flatten and combine all furniture from all categories
            var allFurniture = [];
            results.forEach(function(furnitureList) {
                allFurniture = allFurniture.concat(furnitureList);
            });
            res.send(allFurniture);
        })
        .catch(function(err) {
            console.log(err);
            res.status(500).send("Failed to get furniture by room");
        });
});

var bodyParser = require('body-parser');
var jsonParser = bodyParser.json({ extended: false });
app.post('/api/addFurniture', upload.single('imgfile'), function (req, res) {
    var name = req.body.name;
    var category = req.body.category;
    var description = req.body.description;
    var sku = req.body.sku;
    var length = req.body.length;
    var width = req.body.width;
    var height = req.body.height;

    var data = {
        name: name,
        category: category,
        description: description,
        sku: sku,
        length: length,
        width: width,
        height: height,
        imgPath: '/img/products/' + sku + '.jpg'
    };
    furniture.addFurniture(data)
        .then((result) => {
            if(result.success) {
                res.redirect('/A6/furnitureManagement_Add.html?goodMsg=Furniture with SKU "' + result.sku + '" has been created successfully.')
            }
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send("Failed to add furniture");
        });
});

app.post('/api/removeFurniture', [middleware.checkToken, jsonParser], function (req, res) {
    furniture.removeFurniture(req.body)
        .then((result) => {
            res.send(result);
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send("Failed to remove Furniture");
        });
});

app.post('/api/updateFurniture', upload.single('imgfile'), function (req, res) {
    var id = req.body.id;
    var name = req.body.name;
    var category = req.body.category;
    var description = req.body.description;

    var data = {
        id: id,
        name: name,
        category: category,
        description: description
    };
    furniture.updateFurniture(data)
        .then((result) => {
            if(result) {
                res.redirect('/A6/furnitureManagement.html?goodMsg=Furniture updated successfully.')
            }
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send("Failed to update furniture");
        });
});

module.exports = app;