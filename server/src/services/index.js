module.exports = {
    Account: require('./account').AccountService,
    Encryption: require('./encryption').EncryptionService,
    Http: require('./http').HttpService,
    Helper: require('./helper').HelperService,
    Message: require('./message').MessageServices,
    Category: require('./category').CategoryService,
    Item: require('./item').ItemService,
    Cart: require('./cart').CartService,
    Address: require('./address').AddressService,
    Order: require('./order').OrderService,
    DeliveryBoy: require("./deliveryBoy").DeliveryBoyService,
    Merchant: require("./merchant").MerchantService,
    Distance: require("./distance").DistanceService,
    OfferImage: require("./offerImage").OfferImageService,
    MerchantCategory: require("./merchantCategory").MerchantCategoryService,
    MerchantItem: require("./merchantItem").MerchantItemService,
    MerchantCartService: require("./merchantCart").MerchantCartService,
    OrderDelivery: require("./order-delivery").OrderDeliveryService,
    Unit: require("./unit").UnitService,
    DynamicLinkServices: require("./dynamicLink").DynamicLinkServices
};

