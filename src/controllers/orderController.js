import ordermodel from "./models/orderModel.js";
import { ThrowError } from "../utils/ErrorUtils.js";
import orderServices from "../services/orderServices.js";

const orderServices = new OrderServices();

// Add Order

export const addNewOrder = async (req, res) => {
  try {
    const { OrderId, Custoemr_name, product, Date_Time, Amount, status } =
      req.body;
    const order = await orderServices.addNewOrder({
      OrderId,
      Custoemr_name,
      product,
      Date_Time,
      Amount,
      status,
    });
    return res.status(200).json({ message: "Order added successfully", order });
  } catch (error) {
    return await ThrowError(res, 500, error.message);
  }
};
