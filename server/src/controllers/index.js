module.exports = {
    Account: require('./account').AccountController,
    Item: require('./item').ItemController,
    Category: require('./category').CategoryController,
    Cart: require('./cart').CartController,
    Address: require('./address').AddressController,
    Order: require('./order').OrderController,
    DeliveryBoy: require("./delivery-boy").DeliveryBoyController,
    Merchant: require("./merchant").MerchantController,
    Distance: require("./distance").DistanceController,
    OfferImage: require("./offerImage").OfferImageController,
    MerchantCategory: require("./merchantCategory").MerchantCategoryController,
    MerchantItem: require("./merchantItem").MerchantItemController,
    MerchantCart: require("./merchantCart").MerchantCartController,
    OrderDelivery: require("./order-delivery").OrderDeliveryController,
    Unit: require("./unit").UnitController
}
