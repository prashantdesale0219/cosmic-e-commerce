const mongoose = require('mongoose'); 
 
// ---------------- Sub-schemas ---------------- 
 
// Kit component details 
const KitComponentSchema = new mongoose.Schema({ 
  name: { type: String, required: true }, 
  quantity: { type: Number, required: true, min: 0 }, 
  spec: { type: String } 
}); 
 
// Technical specifications 
const TechSpecSchema = new mongoose.Schema({ 
  systemCapacityKw: { 
    type: Number,
    min: [0, 'System capacity must be a positive number'],
    validate: {
      validator: function(v) {
        return v === undefined || v === null || v >= 0;
      },
      message: props => `${props.value} is not a valid system capacity!`
    }
  }, 
  phase: { 
    type: String,
    enum: {
      values: ['Single Phase', 'Three Phase', 'Dual Phase', 'Not Applicable'],
      message: '{VALUE} is not a valid phase type'
    }
  }, 
  moduleType: String, 
  modulePowerW: {
    type: Number,
    min: [0, 'Module power must be a positive number'],
    validate: {
      validator: function(v) {
        return v === undefined || v === null || v >= 0;
      },
      message: props => `${props.value} is not a valid module power!`
    }
  }, 
  moduleCount: {
    type: Number,
    min: [0, 'Module count must be a positive number'],
    validate: {
      validator: function(v) {
        return v === undefined || v === null || v >= 0;
      },
      message: props => `${props.value} is not a valid module count!`
    }
  }, 
  inverterType: String, 
  inverterCapacityW: {
    type: Number,
    min: [0, 'Inverter capacity must be a positive number'],
    validate: {
      validator: function(v) {
        return v === undefined || v === null || v >= 0;
      },
      message: props => `${props.value} is not a valid inverter capacity!`
    }
  }, 
  dcVoltageRange: String, 
  acOutput: String, 
  efficiencyPercent: {
    type: Number,
    min: [0, 'Efficiency must be a positive number'],
    max: [100, 'Efficiency cannot exceed 100%'],
    validate: {
      validator: function(v) {
        return v === undefined || v === null || (v >= 0 && v <= 100);
      },
      message: props => `${props.value} is not a valid efficiency percentage!`
    }
  }, 
  temperatureCoefficient: String, 
  operatingTemp: String, 
  protections: [String], 
  warranty: { 
    moduleYears: {
      type: Number,
      min: [0, 'Warranty years must be a positive number'],
      validate: {
        validator: function(v) {
          return v === undefined || v === null || v >= 0;
        },
        message: props => `${props.value} is not a valid warranty period!`
      }
    }, 
    powerOutputYears: {
      type: Number,
      min: [0, 'Power output warranty years must be a positive number'],
      validate: {
        validator: function(v) {
          return v === undefined || v === null || v >= 0;
        },
        message: props => `${props.value} is not a valid warranty period!`
      }
    }, 
    inverterYears: {
      type: Number,
      min: [0, 'Inverter warranty years must be a positive number'],
      validate: {
        validator: function(v) {
          return v === undefined || v === null || v >= 0;
        },
        message: props => `${props.value} is not a valid warranty period!`
      }
    }, 
    others: String 
  }, 
  weightKg: {
    type: Number,
    min: [0, 'Weight must be a positive number'],
    validate: {
      validator: function(v) {
        return v === undefined || v === null || v >= 0;
      },
      message: props => `${props.value} is not a valid weight!`
    }
  }, 
  dimensions: { 
    length: {
      type: Number,
      min: [0, 'Length must be a positive number'],
      validate: {
        validator: function(v) {
          return v === undefined || v === null || v >= 0;
        },
        message: props => `${props.value} is not a valid length!`
      }
    }, 
    width: {
      type: Number,
      min: [0, 'Width must be a positive number'],
      validate: {
        validator: function(v) {
          return v === undefined || v === null || v >= 0;
        },
        message: props => `${props.value} is not a valid width!`
      }
    }, 
    height: {
      type: Number,
      min: [0, 'Height must be a positive number'],
      validate: {
        validator: function(v) {
          return v === undefined || v === null || v >= 0;
        },
        message: props => `${props.value} is not a valid height!`
      }
    }, 
    unit: { 
      type: String, 
      default: 'mm',
      enum: {
        values: ['mm', 'cm', 'm', 'in', 'ft'],
        message: '{VALUE} is not a valid unit of measurement'
      }
    } 
  } 
}); 
 
// Installation / kit info 
const InstallationSchema = new mongoose.Schema({ 
  kitComponents: [KitComponentSchema], 
  notIncluded: [String], 
  notes: String, 
  installationType: String 
}); 
 
// Legal / manufacturer details 
const LegalSchema = new mongoose.Schema({ 
  manufacturer: { name: String, address: String }, 
  importer: { name: String, address: String }, 
  packingInfo: String, 
  countryOfOrigin: String 
}); 
 
// Offer information (like EMI, bank offers, etc.) 
const OfferSchema = new mongoose.Schema({ 
  type: { 
    type: String,
    enum: {
      values: ['EMI', 'Bank Offer', 'Brand Offer', 'Seasonal Offer', 'Cashback', 'Discount', 'Other'],
      message: '{VALUE} is not a valid offer type'
    },
    required: [true, 'Offer type is required']
  },
  title: { 
    type: String,
    required: [true, 'Offer title is required'],
    trim: true
  },
  details: { 
    type: String,
    trim: true
  },
  discountPercent: {
    type: Number,
    min: [0, 'Discount percentage must be a positive number'],
    max: [100, 'Discount percentage cannot exceed 100%'],
    validate: {
      validator: function(v) {
        return v === undefined || v === null || (v >= 0 && v <= 100);
      },
      message: props => `${props.value} is not a valid discount percentage!`
    }
  }
}); 
 
// Product applications (Solar System, Home, Industrial, etc.) 
const ApplicationSchema = new mongoose.Schema({ 
  name: { 
    type: String, 
    required: [true, 'Application name is required'],
    trim: true
  },
  icon: { 
    type: String,
    validate: {
      validator: function(v) {
        return v === undefined || v === null || v === '' || /^(http|https):\/\/[^ "]+$/.test(v);
      },
      message: props => `${props.value} is not a valid URL!`
    }
  }
}); 
 
// Warranty & support 
const WarrantySchema = new mongoose.Schema({ 
  warrantyPeriod: { 
    type: String, 
    default: '1 Year',
    required: [true, 'Warranty period is required']
  }, 
  warrantyType: { 
    type: String, 
    default: 'Manufacturer Warranty',
    enum: {
      values: ['Manufacturer Warranty', 'Seller Warranty', 'Brand Warranty', 'No Warranty'],
      message: '{VALUE} is not a valid warranty type'
    }
  }, 
  freeShipping: { type: Boolean, default: true }, 
  easyReturns: { type: Boolean, default: true }, 
  support: { type: String, default: '24/7 Support' } 
}); 
 
// Size options enum 
const PackSizeEnum = [ 
  'Pack of 1', 'Pack of 2', 'Pack of 4', 'Pack of 6', 
  'Pack of 8', 'Pack of 10', 'Pack of 12', 'Pack of 16', 
  'Pack of 18', 'Pack of 20', 'Pallet Pack of 31' 
]; 
 
// ---------------- Main Product Schema ---------------- 
 
const ProductSchema = new mongoose.Schema({ 
  name: { 
    type: String, 
    required: [true, 'Product name is required'], 
    trim: true 
  }, 
  slug: { type: String, lowercase: true, unique: true }, 
  sku: { type: String, unique: true, trim: true }, 
  
  // Description 
  description: { 
    type: String, 
    required: [true, 'Product description is required'], 
    trim: true 
  }, 
  features: { type: String }, // key features or HTML content 
  highlights: [String], // e.g., "High efficiency 21%", "Durable glass" 
  
  // Pricing 
  price: { 
    type: Number, 
    required: [true, 'Product price is required'], 
    min: [0.01, 'Price must be greater than 0'] 
  }, 
  oldPrice: { type: Number, min: 0 }, 
  mrp: { type: Number, min: 0 }, 
  discountPercent: Number, 
  
  // Quantity / Stock 
  size: { type: String, enum: PackSizeEnum, default: 'Pack of 1' }, 
  availableSizes: [{ type: String, enum: PackSizeEnum }], 
  defaultQuantity: { type: Number, default: 1, min: 1 }, 
  maxOrderQuantity: { type: Number, min: 1, default: 100 }, 
  stock: { type: Number, required: true, min: 0, default: 0 }, 
  isOutOfStock: { type: Boolean, default: false }, 
  
  // Category & tags 
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true }, 
  tags: [String], 
  
  // Images 
  images: [{ 
    type: String, 
    validate: { 
      validator: v => /^(http|https):\/\/[^ "]+$/.test(v) || v === '', 
      message: props => `${props.value} is not a valid URL!` 
    } 
  }], 
  
  // Documentation (Downloads) 
  documentation: { 
    dataSheet: String, 
    installationGuide: String, 
    warrantyCard: String 
  }, 
  
  // Technical, installation, legal, offers, applications, warranty 
  technical: TechSpecSchema, 
  installation: InstallationSchema, 
  legal: LegalSchema, 
  offers: [OfferSchema], 
  applications: [ApplicationSchema], 
  warrantyDetails: WarrantySchema, 
  
  // Reviews 
  reviewCount: { type: Number, default: 0 }, 
  averageRating: { type: Number, min: 0, max: 5 }, 
  
  // Meta info 
  createdAt: { type: Date, default: Date.now }, 
  updatedAt: { type: Date, default: Date.now } 
}); 
 
// ---------------- Indexes ---------------- 
ProductSchema.index({ name: 'text', description: 'text', features: 'text' }); 
ProductSchema.index({ categoryId: 1 }); 
ProductSchema.index({ price: 1 }); 
ProductSchema.index({ sku: 1 }); 
ProductSchema.index({ tags: 1 }); 
 
// ---------------- Hooks ---------------- 
ProductSchema.pre('save', function(next) { 
  this.updatedAt = Date.now(); 
  this.isOutOfStock = this.stock <= 0; 
  
  // Calculate discount percentage if oldPrice is provided
  if (this.oldPrice && this.price && this.oldPrice > this.price) {
    this.discountPercent = Math.round(((this.oldPrice - this.price) / this.oldPrice) * 100);
  }
  
  next(); 
}); 
 
ProductSchema.pre('findOneAndUpdate', function(next) { 
  const update = this.getUpdate(); 
  
  // Update isOutOfStock based on stock level
  if (update.stock !== undefined) {
    update.isOutOfStock = update.stock <= 0;
  }
  
  // Calculate discount percentage if oldPrice and price are provided
  if (update.oldPrice !== undefined && update.price !== undefined && update.oldPrice > update.price) {
    update.discountPercent = Math.round(((update.oldPrice - update.price) / update.oldPrice) * 100);
  }
  
  this.set({ updatedAt: Date.now() }); 
  next(); 
}); 
 
module.exports = mongoose.model('Product', ProductSchema);