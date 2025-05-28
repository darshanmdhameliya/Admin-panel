import ordermodel from "../models/orderModel.js";
import { ThrowError } from "../utils/ErrorUtils.js";
import productModel from "../models/productModel.js";
import orderModel from "../models/orderModel.js";

//add new order
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
      card_Number,
      orderStatus
    } = req.body;

    const productIds = product.map(p => p.productId);
    const products = await productModel.find({ _id: { $in: productIds } });

    const insufficientStock = [];

    for (const p of product) {
      const prod = products.find(pr => pr._id.toString() === p.productId);
      if (!prod) {
        insufficientStock.push({
          productId: p.productId,
          message: "Product not found"
        });
      } else if (p.quantity > prod.quantity) {
        insufficientStock.push({
          productId: p.productId,
          name: prod.name,
          requested: p.quantity,
          available: prod.quantity,
          message: `Only ${prod.quantity} available`
        });
      }
    }

    if (insufficientStock.length > 0) {
      return res.status(400).json({
        message: "Some products are not available in the requested quantity.",
        insufficientStock
      });
    }


    let subTotal = 0;
    for (const p of product) {
      const prod = products.find(pr => pr._id.toString() === p.productId);
      const price = prod.price;
      const prodDiscount = prod.discount || 0;
      const discountedPrice = price - (price * prodDiscount / 100);
      subTotal += discountedPrice * p.quantity;
    }


    const discountAmount = (subTotal * (discount || 0)) / 100;
    const discountedPrice = subTotal - discountAmount;
    const tax = 18;
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
      orderStatus
    });

    await newOrder.save();
   
    for (const p of product) {
      await productModel.findByIdAndUpdate(p.productId, {
        $inc: { quantity: -p.quantity }
      });
    }

    return res.status(201).json({
      message: "Order added successfully",
      data: newOrder,
    });

  } catch (error) {
    return ThrowError(res, 500, error.message);
  }
};


export const deleteOrder = async (req, res) => {
  try {
    const orderId = req.params.id;

    const order = await ordermodel.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }


    for (const item of order.product) {
      await productModel.findByIdAndUpdate(item.productId, {
        $inc: { quantity: item.quantity }
      });
    }

 
    await ordermodel.findByIdAndDelete(orderId);

    return res.status(200).json({ message: "Order deleted and product quantity restored." });

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

//update order
export const updateOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { orderStatus } = req.body;

    if (!orderId || !orderStatus) {
      return res.status(400).json({ status: false, message: 'Order ID and status are required' });
    }

    const validStatuses = ['accepted', 'rejected', 'pending', 'under process', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(orderStatus)) {
      return res.status(400).json({ status: false, message: 'Invalid order status' });
    }

    // Check if the order exists
    const order = await ordermodel.findById(orderId);
    if (!order) {
      return res.status(404).json({ status: false, message: 'Order not found' });
    }

    // Update the order status
    const updatedOrder = await ordermodel.findByIdAndUpdate(
      orderId,
      { orderStatus },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ status: false, message: 'Order not found' });
    }

    return res.status(200).json({
      status: true,
      message: 'Order status updated successfully',
      data: updatedOrder
    });
  } catch (error) {
    return ThrowError(res, 500, error.message);
  }
};

//seller accepet order
export const sellerAcceptOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { orderStatus } = req.body;


    if (!orderId || !orderStatus) {
      return res.status(400).json({ status: false, message: 'Order ID and status are required' });
    }
    const validStatuses = ['accepted'];
    if (!validStatuses.includes(orderStatus)) {
      return res.status(400).json({ status: false, message: 'Invalid order status' });
    }
    // Check if the order exists
    const order = await ordermodel.findById(orderId);
    if (!order) {
      return res.status(404).json({ status: false, message: 'Order not found' });
    }
    // Check if the order is already accepted or rejected
    if (order.orderStatus === 'accepted') {
      return res.status(400).json({ status: false, message: 'Order has already been accepted' });
    }

    const updatedOrder = await ordermodel.findByIdAndUpdate(
      orderId,
      { orderStatus },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ status: false, message: 'Order not found' });
    }

    return res.status(200).json({
      status: true,
      message: 'Order status updated successfully',
      data: updatedOrder
    });
  } catch (error) {
    return ThrowError(res, 500, error.message);
  }
};

//get api for payment status
export const getOrderPayments = async (req, res) => {
  try {
    const orders = await orderModel.find({}, {
      _id: 1,
      transactionId: 1,
      createdAt: 1,
      card_HolderName: 1,
      paymentMethod: 1,
      totalAmount: 1,
      paymentStatus: 1
    }).sort({ createdAt: -1 });

    const formattedOrders = orders.map(order => {
      return {
        orderId: order._id.toString(),
        transactionId: order.transactionId,
        date: order.createdAt.toLocaleString('en-GB', {
          day: '2-digit', month: 'short', year: 'numeric',
          hour: '2-digit', minute: '2-digit', hour12: true
        }),
        customerName: order.card_HolderName,
        paymentMethod: order.paymentMethod,
        amount: `$${order.totalAmount}`,
        paymentStatus: order.paymentStatus
      };
    });

    res.status(200).json({
      status: true,
      message: "Order payment data retrieved successfully",
      data: formattedOrders
    });

  } catch (error) {
    return ThrowError(res, 500, error.message || 'Server Error');
  }
};
