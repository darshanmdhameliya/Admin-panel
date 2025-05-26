import express from 'express';
import { addNewCoupon, deleteCoupon, getAllCoupons, getCoupon, updateCoupon } from '../controllers/couponController.js';

const couponRoutes = express.Router();


couponRoutes.post('/addCoupon', addNewCoupon);
couponRoutes.get('/getCoupon', getCoupon);
couponRoutes.get('/getAllCoupon', getAllCoupons);
couponRoutes.put('/updateCoupon/:id', updateCoupon);
couponRoutes.delete('/deleteCoupon/:id', deleteCoupon);

export default couponRoutes;