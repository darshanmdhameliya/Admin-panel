import ordermodel from "../models/orderModel.js";
import { ThrowError } from "../utils/ErrorUtils.js";
import OrderServices from "../services/orderServices.js";
import productModel from "../models/productModel.js";

const orderServices = new OrderServices();

//add new order
// export const addNewOrder = async (req, res) => {
//   try {
//     const { userId, addressId, product, quantity, discount, paymentStatus, paymentMethod, transactionId, card_HolderName, card_Number } = req.body;

//     const productId = product.map(p => p.productId);
//     const products = await productModel.find({ _id: { $in: productId } });

//     let subTotal = 0;
//     product.forEach(p => {
//       const prodDetail = products.find(d => d._id.toString() === p.productId);
//       if (prodDetail) {
//         subTotal += prodDetail.discount * p.quantity;
//       }
//     });

//     const tax = 18;
//     const deliveryCharge = 150;
//     const discounted = (subTotal * discount) / 100;
//     const discountedPrice = subTotal - discounted;
//     const taxed = (discountedPrice * tax) / 100;
//     const taxedPrice = discountedPrice + taxed;
//     const totalAmount = taxedPrice + deliveryCharge;

//     const newOrder = new ordermodel({
//       userId,
//       product,
//       addressId,
//       quantity,
//       discount: totalAmount,
//       paymentStatus,
//       paymentMethod,
//       transactionId,
//       card_HolderName,
//       card_Number
//     });

//     await newOrder.save();

//     return res.status(201).json({
//       message: "Order added successfully",
//       data: newOrder,
//     });
//   } catch (error) {
//     return ThrowError(res, 500, error.message);
//   }
// };

export const addNewOrder = async (req, res) => {
  try {
    const {
      userId,
      addressId,
      product,
      discount,
      paymentStatus,
      paymentMethod,
      transactionId,
      card_HolderName,
      card_Number
    } = req.body;

    const productIds = product.map(p => p.productId);
    const products = await productModel.find({ _id: { $in: productIds } });

    let subTotal = 0;

    product.forEach(p => {
      const prodDetail = products.find(prod => prod._id.toString() === p.productId);
      if (prodDetail) {
        const price = prodDetail.price;
        const productDiscount = prodDetail.discount || 0; // Product-level discount %
        const discountedPrice = price - (price * productDiscount / 100);
        subTotal += discountedPrice * p.quantity;
      }
    });

    const orderLevelDiscount = discount || 0; // e.g., 10%
    const discountAmount = (subTotal * orderLevelDiscount) / 100;
    const discountedPrice = subTotal - discountAmount;

    const tax = 18; // Assume 18%
    const taxAmount = (discountedPrice * tax) / 100;

    const deliveryCharge = 150;
    const totalAmount = discountedPrice + taxAmount + deliveryCharge;

    const newOrder = new ordermodel({
      userId,
      addressId,
      product,
      discount: discountAmount,
      tax: taxAmount,
      deliveryCharge,
      subTotal,
      totalAmount,
      paymentStatus,
      paymentMethod,
      transactionId,
      card_HolderName,
      card_Number,
      orderStatus: 'Pending'
    });


    await newOrder.save();

    return res.status(201).json({
      message: "Order added successfully",
      data: newOrder,
    });
  } catch (error) {
    return ThrowError(res, 500, error.message);
  }
};


//get order
export const getAllOrder = async (req, res) => {
  try {
    const orderData = await ordermodel.aggregate([
      // Join with user data
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'userData'
        }
      },
      {
        $unwind: {
          path: '$userData',
          preserveNullAndEmptyArrays: true
        }
      },
      // Join with address data
      {
        $lookup: {
          from: 'addresses',
          localField: 'addressId',
          foreignField: '_id',
          as: 'addressData'
        }
      },
      {
        $unwind: {
          path: '$addressData',
          preserveNullAndEmptyArrays: true
        }
      },
      // Unwind the product array to work with each product
      {
        $unwind: {
          path: '$product',
          preserveNullAndEmptyArrays: true
        }
      },
      // Convert string ID to ObjectId
      {
        $addFields: {
          'product.productId': {
            $convert: {
              input: '$product.productId',
              to: 'objectId',
              onError: null,
              onNull: null
            }
          }
        }
      },
      // Join with products collection
      {
        $lookup: {
          from: 'products',
          localField: 'product.productId',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      {
        $unwind: {
          path: '$productDetails',
          preserveNullAndEmptyArrays: true
        }
      },
      // Group back by order ID
      {
        $group: {
          _id: '$_id',
          userId: { $first: '$userId' },
          addressId: { $first: '$addressId' },
          subTotal: { $first: '$subTotal' },
          discount: { $first: '$discount' },
          tax: { $first: '$tax' },
          deliveryCharge: { $first: '$deliveryCharge' },
          totalAmount: { $first: '$totalAmount' },
          paymentMethod: { $first: '$paymentMethod' },
          orderStatus: { $first: '$orderStatus' },
          createdAt: { $first: '$createdAt' },
          updatedAt: { $first: '$updatedAt' },
          userData: { $first: '$userData' },
          addressData: { $first: '$addressData' },
          products: {
            $push: {
              productId: '$product.productId',
              quantity: '$product.quantity',
              details: '$productDetails'
            }
          }
        }
      }
    ]);

    if (orderData.length <= 0) {
      return res.status(404).json({ status: false, message: 'Order Not Found' });
    }
    return res.status(200).json({
      status: true,
      message: 'All Orders Found Successfully',
      data: orderData
    });
  } catch (error) {
    return ThrowError(res, 500, error.message);
  }
};

//order accepted
export const orderAccepted = async (req, res) => {
  try {
    const orderId = req.params.id;
    const sellerId = req.seller._id; // from your sellerAuth middleware

    // Find order by ID
    const order = await ordermodel.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if this order belongs to the logged-in seller
    if (order.seller.toString() !== sellerId.toString()) {
      return res.status(403).json({ message: 'Unauthorized: This order does not belong to you' });
    }

    // Update status to Accepted
    order.status = 'Accepted';
    await order.save();

    res.status(200).json({
      message: 'Order accepted successfully',
      order,
    });

  } catch (err) {
    return ThrowError(res, 500, err.message);
  }

};


