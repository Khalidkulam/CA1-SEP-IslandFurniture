var express = require('express');
var app = express();
var promotion = require('../model/promotionModel.js');

// Get all active promotions (public access - no authentication required)
app.get('/api/getActivePromotions', function (req, res) {
    var countryId = req.query.countryId;
    promotion.getAllActivePromotions(countryId)
        .then((result) => {
            res.send(result);
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send("Failed to get active promotions");
        });
});

// Get featured promotions (top 2) (public access - no authentication required)
app.get('/api/getFeaturedPromotions', function (req, res) {
    var countryId = req.query.countryId;
    promotion.getFeaturedPromotions(countryId)
        .then((result) => {
            res.send(result);
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send("Failed to get featured promotions");
        });
});

// Get promotion by ID (public access - no authentication required)
app.get('/api/getPromotionById', function (req, res) {
    var promotionId = req.query.id;
    var countryId = req.query.countryId;
    
    if (!promotionId) {
        return res.status(400).send("Promotion ID is required");
    }
    
    promotion.getPromotionById(promotionId, countryId)
        .then((result) => {
            res.send(result);
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send("Failed to get promotion");
        });
});

// Get all promotions including inactive (public access - no authentication required)
// This could be restricted to admin users if needed in the future
app.get('/api/getAllPromotions', function (req, res) {
    var countryId = req.query.countryId;
    promotion.getAllPromotions(countryId)
        .then((result) => {
            res.send(result);
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send("Failed to get all promotions");
        });
});

module.exports = app;
