import Seller from "../models/sellerModel.js";

class SellerServices {
  //Add Seller
  async addNewSeller(body) {
    try {
      return await Seller.create(body);
    } catch (error) {
      return error.message;
    }
  }
  //Get Single Seller
  async getSeller(body) {
    try {
      return await Seller.findOne(body);
    } catch (error) {
      return error.message;
    }
  }
  //Get Single Seller By Id
  async getSellerById(id) {
    try {
      return await Seller.findById(id);
    } catch (error) {
      return error.message;
    }
  }
  //Get All Sellers
  async getAllSellers(body) {
    try {
      return await Seller.find(body);
    } catch (error) {
      console.log(error);
      return error.message;
    }
  }
  //Update Seller
  async updateSeller(id, body) {
    try {
      return await Seller.findByIdAndUpdate(id, { $set: body }, { new: true });
    } catch (error) {
      return error.message;
    }
  }

  async getSellerByEmail(email) {
    try {
      return await Seller.findOne({ email }).exec();
    } catch (error) {
      return error.message;
    }
  }
  async addNewSeller(body) {
    try {
      return await Seller.create(body);
    } catch (error) {
      return error.message;
    }
  }

  //addNewGst
  async addNewGst(body) {
    try {
      return await Seller.create(body);
    } catch (error) {
      return error.message;
    }
  }

  //Get GstNo
  async getGst(body) {
    try {
      return await Seller.findOne(body);
    } catch (error) {
      return error.message;
    }
  }
 
}
export default SellerServices;