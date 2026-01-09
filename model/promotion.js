class Promotion {
    constructor() { 
        this.id = null;
        this.description = null;
        this.discountRate = null;
        this.startDate = null;
        this.endDate = null;
        this.imageURL = null;
        this.countryId = null;
        this.itemId = null;
        // Additional fields from joined item data
        this.itemName = null;
        this.itemCategory = null;
        this.originalPrice = null;
        this.discountedPrice = null;
    }
}
module.exports = Promotion;
