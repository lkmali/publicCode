var log = require("../logger/winston").LOG;
const Order = require('../database/models/order');
const Merchant = require('../database/models/merchant');
const DeliveryBoy = require('../database/models/delivery-boy');
const errorFactory = require("../errorFactory/error-factory");
var messageServices = require('./message').MessageServices;
const MerchantItem = require('../database/models/merchant-item');

class DistanceService {
    /**
     * admin can register new user
     * @returns {Promise<void>}
     * @param orderId
     */
    async getDeliveryBoyDistance(orderId) {
        return new Promise(async (resolve, reject) => {
            try {
                let order = await Order.findOne({_id: orderId});
                if (!order) {
                    return reject(errorFactory.invalidRequest("Invalid order ID"));
                }
                let deliveryBoy = await DeliveryBoy.find({isDeleted: false, pinCode: order.billingInfo.pinCode});

                if (deliveryBoy && deliveryBoy.length) {
                    resolve(this.getSortedLocation(deliveryBoy, order.billingInfo.mapLocation.latlong))
                } else {
                    resolve([]);
                }

            } catch (error) {
                log.error("getDeliveryBoyDistance-->catch", error);
                return reject(errorFactory.dataBaseError(error));
            }
        });

    }

    async getMerchantDistanceWithItem(orderId) {
        return new Promise(async (resolve, reject) => {
            try {

                let itemsId = [];
                let merchantId = [];
                let merchantData = {};
                let order = await Order.findOne({_id: orderId}).populate("cart");
                if (!order) {
                    return reject(errorFactory.invalidRequest("Invalid order ID"));
                }

                for (let index = 0; index < order.cart.length; index++) {
                    itemsId.push(order.cart[index].item);
                }
                let merchant = await Merchant.find({isDeleted: false, pinCode: order.billingInfo.pinCode});

                if (merchant && merchant.length) {
                    let distance = this.getSortedLocation(merchant, order.billingInfo.mapLocation.latlong);
                    for (let index = 0; index < distance.length; index++) {
                        merchantId.push(distance[index]._id);
                        merchantData[distance[index]._id.toString()] = distance[index];
                    }
                    resolve(await this.getMerchantItem(itemsId, merchantId, merchantData))

                } else {
                    resolve({});
                }

            } catch (error) {
                log.error("getMerchantDistance-->catch", error);
                return reject(errorFactory.dataBaseError(error));
            }
        });

    }

    async getMerchantItem(itemsId, merchantId, merchantData) {
        return new Promise(async (resolve, reject) => {
            try {
                let items = {};

                let data = await MerchantItem.find({
                    merchant: {$in: merchantId},
                    item: {$in: itemsId}
                });
                for (let index = 0; index < data.length; index++) {
                    if (data[index].hasOwnProperty("_doc") && data[index]._doc) {
                        data[index] = data[index]._doc;
                    }
                    if (items.hasOwnProperty(data[index].item.toString())) {
                        items[data[index].item.toString()].push({
                            merchantId: merchantData[data[index].merchant.toString()]._id,
                            merchantName: merchantData[data[index].merchant.toString()].name,
                            phone: merchantData[data[index].merchant.toString()].phone,
                            itemPrice: data[index].price,
                            shopName: merchantData[data[index].merchant.toString()].shopName,
                            pinCode: merchantData[data[index].merchant.toString()].pinCode,
                            distance: merchantData[data[index].merchant.toString()].distance,
                        })
                    } else {
                        items[data[index].item.toString()] = [{
                            merchantId: merchantData[data[index].merchant.toString()]._id,
                            merchantName: merchantData[data[index].merchant.toString()].name,
                            phone: merchantData[data[index].merchant.toString()].phone,
                            itemPrice: data[index].price,
                            shopName: merchantData[data[index].merchant.toString()].shopName,
                            pinCode: merchantData[data[index].merchant.toString()].pinCode,
                            distance: merchantData[data[index].merchant.toString()].distance,
                        }]
                    }
                }
                resolve(items);
            } catch (error) {
                log.error("getMerchantDistance-->catch", error);
                return reject(errorFactory.dataBaseError(error));
            }
        });

    }

    async getMerchantDistance(orderId) {
        return new Promise(async (resolve, reject) => {
            try {
                let order = await Order.findOne({_id: orderId});
                if (!order) {
                    return reject(errorFactory.invalidRequest("Invalid order ID"));
                }
                let merchant = await Merchant.find({isDeleted: false, pinCode: order.billingInfo.pinCode});

                if (merchant && merchant.length) {
                    resolve(this.getSortedLocation(merchant, order.billingInfo.mapLocation.latlong))
                } else {
                    resolve([]);
                }

            } catch (error) {
                log.error("getMerchantDistance-->catch", error);
                return reject(errorFactory.dataBaseError(error));
            }
        });

    }


    getSortedLocation(data, orderLocation) {
        try {
            let orderLateLong = orderLocation.replace(/ /g, '').split(",");
            console.log(orderLateLong);
            for (let index = 0; index < data.length; index++) {
                if (data[index].hasOwnProperty("_doc") && data[index]._doc) {
                    data[index] = data[index]._doc;
                }
                const distArray = data[index]["mapLocation"].replace(/ /g, '').split(",");
                data[index]["distance"] = this.getDistanceFromLatLonInMiter(orderLateLong[0], orderLateLong[1], distArray[0], distArray[1])
            }


            for (let index = 0; index < data.length; index++) {
                for (let count = index + 1; count < data.length; count++) {
                    if (data[index]["distance"] > data[count]["distance"]) {
                        let temp = data[index];
                        data[index] = data[count];
                        data[count] = temp;
                    }
                }
            }

            return data;
        } catch (error) {
            log.error("getSortedLocation-->catch", error);
            throw errorFactory.dataBaseError(error);
        }

    }


    getDistanceFromLatLonInMiter(lat1, lon1, lat2, lon2) {
        var R = 6371 * 1000; // Radius of the earth in
        var dLat = this.deg2rad(lat2 - lat1);  // deg2rad below
        var dLon = this.deg2rad(lon2 - lon1);
        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2)
        ;
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        // Distance in km
        return R * c;
    }

    deg2rad(deg) {
        return deg * (Math.PI / 180)
    }

    /**
     * admin can register new user
     * @returns {Promise<void>}
     * @param data
     */
    async sendMessageToMerchant(data) {
        return new Promise(async (resolve, reject) => {
            try {
                let order = await Order.findOne({
                    isDeleted: false,
                    _id: data.orderId
                }).populate("payment").populate([{
                    path: 'cart',
                    model: 'cart',
                    populate: {
                        path: 'item',
                        model: 'items'
                    }
                }]);

                let items = "itemName \t  quantity ";
                if (!order) {
                    return reject(errorFactory.invalidRequest("Invalid order ID"));
                }
                if (order.hasOwnProperty("_doc") && order._doc) {
                    order = order._doc;
                }
                for (let index = 0; index < order.cart.length; index++) {
                    items = ` ${items} \n ${order.cart[index].item.name || ""} \t ${order.cart[index].quantity || ""} `;
                }

                let merchant = await Merchant.findOne({_id: data.userId});

                if (merchant) {
                    resolve(await messageServices.prototype.sendMessage(merchant.phone, this.getMerchantMessage(merchant.name, items)));
                } else {
                    return reject(errorFactory.invalidRequest("Invalid merchant ID"));
                }
            } catch (error) {
                log.error("sendMessageToMerchant-->catch", error);
                return reject(errorFactory.dataBaseError(error));
            }
        });

    }


    getMerchantMessage(userName, item) {
        return `Dear, ${userName} \n please sent me your price as below item \n ${item} `;

    }
}

module.exports.DistanceService = DistanceService;
