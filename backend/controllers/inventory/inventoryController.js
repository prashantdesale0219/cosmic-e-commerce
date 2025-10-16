const InventoryLog = require('../../models/inventory/inventoryLog');
const Product = require('../../models/products/product');

// Adjust inventory for a product
exports.adjustInventory = async (req, res) => {
    try {
        const { productId, quantity, action, notes } = req.body;
        
        if (!productId || !quantity || !action) {
            return res.status(400).json({
                success: false,
                message: 'Product ID, quantity and action are required'
            });
        }
        
        // Find the product
        const product = await Product.findById(productId);
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        
        // Calculate change based on action
        const change = action === 'add' ? parseInt(quantity) : -parseInt(quantity);
        
        // Check if adjustment would result in negative stock
        const previousStock = product.stockQty;
        const newStockQty = previousStock + change;
        
        if (newStockQty < 0) {
            return res.status(400).json({
                success: false,
                message: 'Adjustment would result in negative stock'
            });
        }
        
        // Create inventory log entry
        const inventoryLog = await InventoryLog.create({
            productId,
            change,
            previousStock,
            currentStock: newStockQty,
            action,
            reason: 'manual',
            updatedBy: req.user.id,
            notes
        });
        
        // Update product stock
        product.stockQty = newStockQty;
        await product.save();
        
        res.status(201).json({
            success: true,
            message: 'Inventory adjusted successfully',
            data: {
                inventoryLog,
                newStockQty
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get inventory logs
exports.getInventoryLogs = async (req, res) => {
    try {
        const { productId, action, startDate, endDate, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
        
        // Build query
        const query = {};
        
        if (productId) {
            query.productId = productId;
        }
        
        if (action) {
            query.action = action;
        }
        
        if (startDate || endDate) {
            query.createdAt = {};
            
            if (startDate) {
                query.createdAt.$gte = new Date(startDate);
            }
            
            if (endDate) {
                query.createdAt.$lte = new Date(endDate);
            }
        }
        
        // Pagination
        const skip = (page - 1) * limit;
        
        // Sort configuration
        const sort = {};
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
        
        // Execute query
        const logs = await InventoryLog.find(query)
            .populate({
                path: 'productId',
                select: 'name sku images',
                model: 'Product'
            })
            .populate({
                path: 'updatedBy',
                select: 'name email',
                model: 'User'
            })
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit));
        
        // Get total count
        const total = await InventoryLog.countDocuments(query);
        
        res.status(200).json({
            success: true,
            logs: logs.map(log => ({
                _id: log._id,
                product: {
                    _id: log.productId?._id,
                    name: log.productId?.name,
                    sku: log.productId?.sku,
                    image: log.productId?.images?.[0] || ''
                },
                action: log.action,
                quantity: Math.abs(log.change),
                previousStock: log.previousStock,
                currentStock: log.currentStock,
                updatedBy: log.updatedBy ? {
                    _id: log.updatedBy._id,
                    name: log.updatedBy.name,
                    email: log.updatedBy.email
                } : null,
                notes: log.notes,
                createdAt: log.createdAt
            })),
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page)
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get inventory log by ID
exports.getInventoryLog = async (req, res) => {
    try {
        const log = await InventoryLog.findById(req.params.id)
            .populate('productId', 'title sku')
            .populate('adminId', 'name')
            .populate('orderId', 'orderId');
        
        if (!log) {
            return res.status(404).json({
                success: false,
                message: 'Inventory log not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: log
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get inventory summary
exports.getInventorySummary = async (req, res) => {
    try {
        // Get products with low stock (less than 10)
        const lowStockProducts = await Product.find({ stockQty: { $gt: 0, $lt: 10 } })
            .select('name sku stockQty images')
            .sort({ stockQty: 1 });
        
        // Get total products count
        const totalProducts = await Product.countDocuments();
        
        // Get out of stock products count
        const outOfStockProducts = await Product.countDocuments({ stockQty: 0 });
        
        // Get recent inventory changes
        const recentAdjustments = await InventoryLog.countDocuments({
            createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        });
        
        res.status(200).json({
            success: true,
            totalProducts,
            lowStockProducts: lowStockProducts.length,
            outOfStockProducts,
            recentAdjustments,
            lowStockItems: lowStockProducts.map(product => ({
                _id: product._id,
                name: product.name,
                sku: product.sku,
                stockQty: product.stockQty,
                image: product.images?.[0] || ''
            }))
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Handle inventory change for order
exports.handleOrderInventory = async (orderId, items, action) => {
    try {
        const multiplier = action === 'decrement' ? -1 : 1;
        
        for (const item of items) {
            const product = await Product.findById(item.productId);
            
            if (!product) {
                throw new Error(`Product not found: ${item.productId}`);
            }
            
            const change = item.qty * multiplier;
            
            // Check if decrement would result in negative stock
            if (action === 'decrement' && product.stockQty < item.qty) {
                throw new Error(`Insufficient stock for product: ${product.title}`);
            }
            
            // Create inventory log
            await InventoryLog.create({
                productId: item.productId,
                change: change * -1, // Negative for decrement, positive for increment
                reason: action === 'decrement' ? 'order' : 'return',
                orderId
            });
            
            // Update product stock
            product.stockQty += change;
            await product.save();
        }
        
        return true;
    } catch (error) {
        throw error;
    }
};