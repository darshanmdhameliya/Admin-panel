import { ThrowError } from '../utils/ErrorUtils.js';
import orderModel from '../models/orderModel.js';
import productModel from '../models/productModel.js';

export const getDashboardSummary = async (req, res) => {
    try {
        const totalOrders = await orderModel.countDocuments();
        const totalProducts = await productModel.countDocuments();
        const cancelOrders = await orderModel.countDocuments({ orderStatus: 'cancelled' });
        const totalDelivered = await orderModel.countDocuments({ orderStatus: 'delivered' });

        // Sales by Category
        let getSalesData = await orderModel.aggregate([
            { $match: { orderStatus: "delivered" } },
            { $unwind: '$items' },
            {
                $lookup: {
                    from: 'products',
                    localField: "items.productId",
                    foreignField: "_id",
                    as: "productData"
                }
            },
            { $unwind: '$productData' },
            {
                $lookup: {
                    from: 'categories',
                    localField: 'productData.categoryId',
                    foreignField: '_id',
                    as: 'categoryData'
                }
            },
            { $unwind: '$categoryData' },
            {
                $group: {
                    _id: '$categoryData._id',
                    categoryName: { $first: '$categoryData.categoryName' },
                    totalSales: { $sum: '$items.quantity' },
                    totalAmount: { $sum: { $multiply: ['$items.quantity', '$productData.price'] } }
                }
            },
            {
                $project: {
                    categoryName: 1,
                    totalSales: 1,
                    totalAmount: 1
                }
            }
        ]);

        const totalSales = getSalesData.reduce((sum, item) => sum + item.totalSales, 0);

        const salesByCategory = getSalesData.map(item => ({
            ...item,
            percentage: parseFloat(((item.totalSales / totalSales) * 100).toFixed(2))
        }));

        // Revenue Stats
        const currentYear = new Date().getFullYear();
        const revenueStats = await orderModel.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: new Date(`${currentYear}-01-01T00:00:00Z`),
                        $lt: new Date(`${currentYear + 1}-01-01T00:00:00Z`)
                    }
                }
            },
            {
                $group: {
                    _id: { $month: '$createdAt' },
                    totalRevenue: {
                        $sum: {
                            $cond: [
                                { $isNumber: '$totalAmount' },
                                '$totalAmount',
                                { $toDouble: '$totalAmount' }
                            ]
                        }
                    }
                }
            },
            {
                $project: {
                    month: {
                        $arrayElemAt: [
                            ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May',
                                'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                            '$_id'
                        ]
                    },
                    totalRevenue: 1,
                    _id: 0
                }
            },
            { $sort: { month: 1 } }
        ]);

        res.status(200).json({
            status: true,
            message: 'Dashboard data retrieved successfully',
            data: {
                totalOrders,
                totalProducts,
                cancelOrders,
                totalDelivered,
                salesByCategory,
                revenueStats
            }
        });
    } catch (error) {
        return ThrowError(res, 500, error.message || 'Server Error');
    }
};
