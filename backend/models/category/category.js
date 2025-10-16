const mongoose = require('mongoose');

// Category Schema
const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true
  },
  slug: {
    type: String,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  image: {
    type: String,
    validate: {
      validator: function(v) {
        // Allow null or empty string or valid URL
        return v === null || v === '' || /^(http|https):\/\/[^ "]+$/.test(v);
      },
      message: props => `${props.value} is not a valid URL!`
    }
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  isMainCategory: {
    type: Boolean,
    default: false
  },
  level: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Create index for faster search
CategorySchema.index({ name: 'text' });
CategorySchema.index({ parent: 1 });
CategorySchema.index({ slug: 1 });
CategorySchema.index({ isMainCategory: 1 });

// Generate slug from name
CategorySchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
  
  // Update level based on parent
  if (this.isModified('parent')) {
    if (!this.parent) {
      this.level = 0;
      this.isMainCategory = true;
    } else {
      this.isMainCategory = false;
      // Level will be updated in the controller
    }
  }
  
  this.updatedAt = Date.now();
  next();
});

// Virtual for getting subcategories
CategorySchema.virtual('subcategories', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parent',
  options: { sort: { name: 1 } }
});

// Method to check if category has subcategories
CategorySchema.methods.hasSubcategories = async function() {
  const count = await mongoose.model('Category').countDocuments({ parent: this._id });
  return count > 0;
};

module.exports = mongoose.model('Category', CategorySchema);