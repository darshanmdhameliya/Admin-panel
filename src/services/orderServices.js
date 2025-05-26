import order from "../models/orderModel.js";

class OrderServices {
  // Add Order
  async addNewOrder(body) {
    try {
      return await order.create(body);
    } catch (error) {
      return error.message;
    }
  }
  // Get Single Order
  async getOrder(body) {
    try {
      return await order.findOne(body);
    } catch (error) {
      return error.message;
    }
  }
  // Get Single Order By Id
  async getOrderById(id) {
    try {
      return await order.findById(id);
    } catch (error) {
      return error.message;
    }
  }
  // Get All Orders
  async getAllOrders(body) {
    try {
      return await order.find(body);
    } catch (error) {
      console.log(error);
    }
  }
  // Update Order
  async updateOrder(id, body) {
    try {
      return await order.findByIdAndUpdate(id, { $set: body }, { new: true });
    } catch (error) {
      return error.message;
    }
  }
  // Delete Order
  async deleteOrder(id) {
    try {
      return await order.findByIdAndDelete(id);
    } catch (error) {
      return error.message;
    }
  }
  // Get Order By Customer ID
  async getOrdersByCustomerId(customerId) {
    try {
      return await order.find({ customerId });
    } catch (error) {
      console.log(error);
    }
  }
  // Get Order By Product ID
  async getOrdersByProductId(productId) {
    try {
      return await order.find({ productId });
    } catch (error) {
      console.log(error);
    }
  }
  // Get Order By Status
  async getOrdersByStatus(status) {
    try {
      return await order.find({ status });
    } catch (error) {
      console.log(error);
    }
  }
}

export default OrderServices;