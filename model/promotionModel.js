var db = require('./databaseConfig.js');
var Promotion = require('./promotion.js');

var promotionDB = {
    // Get all active promotions (where current date is between startDate and endDate)
    getAllActivePromotions: function (countryId) {
        return new Promise((resolve, reject) => {
            var conn = db.getConnection();
            conn.connect(function (err) {
                if (err) {
                    console.log(err);
                    conn.end();
                    return reject(err);
                } else {
                    var sql;
                    var params = [];
                    
                    if (countryId == null || countryId == '') {
                        // Get all active promotions regardless of country
                        sql = 'SELECT p.ID as id, p.DESCRIPTION as description, p.DISCOUNTRATE as discountRate, ' +
                              'p.STARTDATE as startDate, p.ENDDATE as endDate, p.IMAGEURL as imageURL, ' +
                              'p.COUNTRY_ID as countryId, p.ITEM_ID as itemId, i.NAME as itemName, ' +
                              'i.CATEGORY as itemCategory, i.SKU as itemSku ' +
                              'FROM promotionentity p ' +
                              'INNER JOIN itementity i ON p.ITEM_ID = i.ID ' +
                              'WHERE i.ISDELETED = FALSE ' +
                              'AND CURDATE() BETWEEN p.STARTDATE AND p.ENDDATE ' +
                              'ORDER BY p.STARTDATE DESC;';
                    } else {
                        // Get active promotions for specific country with pricing
                        sql = 'SELECT p.ID as id, p.DESCRIPTION as description, p.DISCOUNTRATE as discountRate, ' +
                              'p.STARTDATE as startDate, p.ENDDATE as endDate, p.IMAGEURL as imageURL, ' +
                              'p.COUNTRY_ID as countryId, p.ITEM_ID as itemId, i.NAME as itemName, ' +
                              'i.CATEGORY as itemCategory, i.SKU as itemSku, ic.RETAILPRICE as originalPrice ' +
                              'FROM promotionentity p ' +
                              'INNER JOIN itementity i ON p.ITEM_ID = i.ID ' +
                              'INNER JOIN item_countryentity ic ON i.ID = ic.ITEM_ID ' +
                              'WHERE i.ISDELETED = FALSE ' +
                              'AND CURDATE() BETWEEN p.STARTDATE AND p.ENDDATE ' +
                              'AND ic.COUNTRY_ID = ? ' +
                              'AND p.COUNTRY_ID = ? ' +
                              'ORDER BY p.STARTDATE DESC;';
                        params = [countryId, countryId];
                    }
                    
                    conn.query(sql, params, function (err, result) {
                        if (err) {
                            conn.end();
                            return reject(err);
                        } else {
                            var promotionList = [];
                            for (var i = 0; i < result.length; i++) {
                                var promotion = new Promotion();
                                promotion.id = result[i].id;
                                promotion.description = result[i].description;
                                promotion.discountRate = result[i].discountRate;
                                promotion.startDate = result[i].startDate;
                                promotion.endDate = result[i].endDate;
                                promotion.imageURL = result[i].imageURL;
                                promotion.countryId = result[i].countryId;
                                promotion.itemId = result[i].itemId;
                                promotion.itemName = result[i].itemName;
                                promotion.itemCategory = result[i].itemCategory;
                                
                                if (result[i].originalPrice) {
                                    promotion.originalPrice = result[i].originalPrice;
                                    // Calculate discounted price
                                    promotion.discountedPrice = (result[i].originalPrice * (1 - result[i].discountRate / 100)).toFixed(2);
                                }
                                
                                promotionList.push(promotion);
                            }
                            conn.end();
                            return resolve(promotionList);
                        }
                    });
                }
            });
        });
    },

    // Get featured promotions (top 2 by start date or manually flagged)
    // For now, we'll return the 2 most recent active promotions
    getFeaturedPromotions: function (countryId) {
        return new Promise((resolve, reject) => {
            var conn = db.getConnection();
            conn.connect(function (err) {
                if (err) {
                    console.log(err);
                    conn.end();
                    return reject(err);
                } else {
                    var sql;
                    var params = [];
                    
                    if (countryId == null || countryId == '') {
                        sql = 'SELECT p.ID as id, p.DESCRIPTION as description, p.DISCOUNTRATE as discountRate, ' +
                              'p.STARTDATE as startDate, p.ENDDATE as endDate, p.IMAGEURL as imageURL, ' +
                              'p.COUNTRY_ID as countryId, p.ITEM_ID as itemId, i.NAME as itemName, ' +
                              'i.CATEGORY as itemCategory, i.SKU as itemSku ' +
                              'FROM promotionentity p ' +
                              'INNER JOIN itementity i ON p.ITEM_ID = i.ID ' +
                              'WHERE i.ISDELETED = FALSE ' +
                              'AND CURDATE() BETWEEN p.STARTDATE AND p.ENDDATE ' +
                              'ORDER BY p.STARTDATE DESC ' +
                              'LIMIT 2;';
                    } else {
                        sql = 'SELECT p.ID as id, p.DESCRIPTION as description, p.DISCOUNTRATE as discountRate, ' +
                              'p.STARTDATE as startDate, p.ENDDATE as endDate, p.IMAGEURL as imageURL, ' +
                              'p.COUNTRY_ID as countryId, p.ITEM_ID as itemId, i.NAME as itemName, ' +
                              'i.CATEGORY as itemCategory, i.SKU as itemSku, ic.RETAILPRICE as originalPrice ' +
                              'FROM promotionentity p ' +
                              'INNER JOIN itementity i ON p.ITEM_ID = i.ID ' +
                              'INNER JOIN item_countryentity ic ON i.ID = ic.ITEM_ID ' +
                              'WHERE i.ISDELETED = FALSE ' +
                              'AND CURDATE() BETWEEN p.STARTDATE AND p.ENDDATE ' +
                              'AND ic.COUNTRY_ID = ? ' +
                              'AND p.COUNTRY_ID = ? ' +
                              'ORDER BY p.STARTDATE DESC ' +
                              'LIMIT 2;';
                        params = [countryId, countryId];
                    }
                    
                    conn.query(sql, params, function (err, result) {
                        if (err) {
                            conn.end();
                            return reject(err);
                        } else {
                            var promotionList = [];
                            for (var i = 0; i < result.length; i++) {
                                var promotion = new Promotion();
                                promotion.id = result[i].id;
                                promotion.description = result[i].description;
                                promotion.discountRate = result[i].discountRate;
                                promotion.startDate = result[i].startDate;
                                promotion.endDate = result[i].endDate;
                                promotion.imageURL = result[i].imageURL;
                                promotion.countryId = result[i].countryId;
                                promotion.itemId = result[i].itemId;
                                promotion.itemName = result[i].itemName;
                                promotion.itemCategory = result[i].itemCategory;
                                
                                if (result[i].originalPrice) {
                                    promotion.originalPrice = result[i].originalPrice;
                                    promotion.discountedPrice = (result[i].originalPrice * (1 - result[i].discountRate / 100)).toFixed(2);
                                }
                                
                                promotionList.push(promotion);
                            }
                            conn.end();
                            return resolve(promotionList);
                        }
                    });
                }
            });
        });
    },

    // Get promotion by ID
    getPromotionById: function (promotionId, countryId) {
        return new Promise((resolve, reject) => {
            var conn = db.getConnection();
            conn.connect(function (err) {
                if (err) {
                    console.log(err);
                    conn.end();
                    return reject(err);
                } else {
                    var sql;
                    var params;
                    
                    if (countryId == null || countryId == '') {
                        sql = 'SELECT p.ID as id, p.DESCRIPTION as description, p.DISCOUNTRATE as discountRate, ' +
                              'p.STARTDATE as startDate, p.ENDDATE as endDate, p.IMAGEURL as imageURL, ' +
                              'p.COUNTRY_ID as countryId, p.ITEM_ID as itemId, i.NAME as itemName, ' +
                              'i.CATEGORY as itemCategory, i.SKU as itemSku ' +
                              'FROM promotionentity p ' +
                              'INNER JOIN itementity i ON p.ITEM_ID = i.ID ' +
                              'WHERE p.ID = ? AND i.ISDELETED = FALSE;';
                        params = [promotionId];
                    } else {
                        sql = 'SELECT p.ID as id, p.DESCRIPTION as description, p.DISCOUNTRATE as discountRate, ' +
                              'p.STARTDATE as startDate, p.ENDDATE as endDate, p.IMAGEURL as imageURL, ' +
                              'p.COUNTRY_ID as countryId, p.ITEM_ID as itemId, i.NAME as itemName, ' +
                              'i.CATEGORY as itemCategory, i.SKU as itemSku, ic.RETAILPRICE as originalPrice ' +
                              'FROM promotionentity p ' +
                              'INNER JOIN itementity i ON p.ITEM_ID = i.ID ' +
                              'INNER JOIN item_countryentity ic ON i.ID = ic.ITEM_ID ' +
                              'WHERE p.ID = ? AND i.ISDELETED = FALSE AND ic.COUNTRY_ID = ?;';
                        params = [promotionId, countryId];
                    }
                    
                    conn.query(sql, params, function (err, result) {
                        if (err) {
                            conn.end();
                            return reject(err);
                        } else {
                            if (result.length === 0) {
                                conn.end();
                                return reject(new Error('Promotion not found'));
                            }
                            
                            var promotion = new Promotion();
                            promotion.id = result[0].id;
                            promotion.description = result[0].description;
                            promotion.discountRate = result[0].discountRate;
                            promotion.startDate = result[0].startDate;
                            promotion.endDate = result[0].endDate;
                            promotion.imageURL = result[0].imageURL;
                            promotion.countryId = result[0].countryId;
                            promotion.itemId = result[0].itemId;
                            promotion.itemName = result[0].itemName;
                            promotion.itemCategory = result[0].itemCategory;
                            
                            if (result[0].originalPrice) {
                                promotion.originalPrice = result[0].originalPrice;
                                promotion.discountedPrice = (result[0].originalPrice * (1 - result[0].discountRate / 100)).toFixed(2);
                            }
                            
                            conn.end();
                            return resolve(promotion);
                        }
                    });
                }
            });
        });
    },

    // Get all promotions (including inactive ones) - for admin purposes if needed
    getAllPromotions: function (countryId) {
        return new Promise((resolve, reject) => {
            var conn = db.getConnection();
            conn.connect(function (err) {
                if (err) {
                    console.log(err);
                    conn.end();
                    return reject(err);
                } else {
                    var sql;
                    var params = [];
                    
                    if (countryId == null || countryId == '') {
                        sql = 'SELECT p.ID as id, p.DESCRIPTION as description, p.DISCOUNTRATE as discountRate, ' +
                              'p.STARTDATE as startDate, p.ENDDATE as endDate, p.IMAGEURL as imageURL, ' +
                              'p.COUNTRY_ID as countryId, p.ITEM_ID as itemId, i.NAME as itemName, ' +
                              'i.CATEGORY as itemCategory, i.SKU as itemSku ' +
                              'FROM promotionentity p ' +
                              'INNER JOIN itementity i ON p.ITEM_ID = i.ID ' +
                              'WHERE i.ISDELETED = FALSE ' +
                              'ORDER BY p.STARTDATE DESC;';
                    } else {
                        sql = 'SELECT p.ID as id, p.DESCRIPTION as description, p.DISCOUNTRATE as discountRate, ' +
                              'p.STARTDATE as startDate, p.ENDDATE as endDate, p.IMAGEURL as imageURL, ' +
                              'p.COUNTRY_ID as countryId, p.ITEM_ID as itemId, i.NAME as itemName, ' +
                              'i.CATEGORY as itemCategory, i.SKU as itemSku, ic.RETAILPRICE as originalPrice ' +
                              'FROM promotionentity p ' +
                              'INNER JOIN itementity i ON p.ITEM_ID = i.ID ' +
                              'INNER JOIN item_countryentity ic ON i.ID = ic.ITEM_ID ' +
                              'WHERE i.ISDELETED = FALSE ' +
                              'AND ic.COUNTRY_ID = ? ' +
                              'AND p.COUNTRY_ID = ? ' +
                              'ORDER BY p.STARTDATE DESC;';
                        params = [countryId, countryId];
                    }
                    
                    conn.query(sql, params, function (err, result) {
                        if (err) {
                            conn.end();
                            return reject(err);
                        } else {
                            var promotionList = [];
                            for (var i = 0; i < result.length; i++) {
                                var promotion = new Promotion();
                                promotion.id = result[i].id;
                                promotion.description = result[i].description;
                                promotion.discountRate = result[i].discountRate;
                                promotion.startDate = result[i].startDate;
                                promotion.endDate = result[i].endDate;
                                promotion.imageURL = result[i].imageURL;
                                promotion.countryId = result[i].countryId;
                                promotion.itemId = result[i].itemId;
                                promotion.itemName = result[i].itemName;
                                promotion.itemCategory = result[i].itemCategory;
                                
                                if (result[i].originalPrice) {
                                    promotion.originalPrice = result[i].originalPrice;
                                    promotion.discountedPrice = (result[i].originalPrice * (1 - result[i].discountRate / 100)).toFixed(2);
                                }
                                
                                promotionList.push(promotion);
                            }
                            conn.end();
                            return resolve(promotionList);
                        }
                    });
                }
            });
        });
    }
};

module.exports = promotionDB;
