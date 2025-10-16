import React from 'react';
import { Link } from 'react-router-dom';
import { FaHeart, FaStar } from 'react-icons/fa';

const ProductCard = ({ product }) => {
  const {
    id,
    name,
    image,
    currentPrice,
    originalPrice,
    discount,
    rating,
    reviewCount,
    isBestseller,
    isOnSale,
    discountPercentage,
  } = product;

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 relative">
      {/* Product Tags */}
      <div className="absolute top-0 left-0 z-10 flex">
        {isBestseller && (
          <span className="bg-blue-600 text-white text-xs sm:text-sm font-bold px-2 py-1">
            Bestseller
          </span>
        )}
        {isOnSale && (
          <span className="bg-red-600 text-white text-xs sm:text-sm font-bold px-2 py-1 ml-1">
            On Sale
          </span>
        )}
        {discountPercentage > 0 && (
          <span className="bg-main text-white text-xs sm:text-sm font-bold px-2 py-1 ml-1">
            {discountPercentage}% Off
          </span>
        )}
      </div>

      {/* Wishlist Button */}
      <button className="absolute top-2 right-2 z-10 bg-white rounded-full p-1.5 sm:p-2 shadow-md text-gray-400 hover:text-red-500 transition-colors duration-300">
        <FaHeart className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>

      {/* Product Image */}
      <Link to={`/product/${id}`}>
        <div className="h-40 sm:h-48 md:h-52 overflow-hidden bg-gray-50 p-2 sm:p-3">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-contain transition-transform duration-300 hover:scale-105"
          />
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-3 sm:p-4 md:p-5">
        <Link to={`/product/${id}`}>
          <h3 className="text-sm sm:text-base font-medium text-gray-800 mb-2 line-clamp-2 h-10 sm:h-12 hover:text-main transition-colors duration-200">
            {name}
          </h3>
        </Link>

        {/* Price */}
        <div className="mb-2">
          <span className="text-base sm:text-lg md:text-xl font-bold">₹{currentPrice.toLocaleString()}</span>
          {originalPrice > currentPrice && (
            <span className="text-xs sm:text-sm text-gray-500 line-through ml-2">
              ₹{originalPrice.toLocaleString()}
            </span>
          )}
        </div>

        {/* Price dropped info */}
        {discount > 0 && (
          <p className="text-xs sm:text-sm text-red-500 mb-2 font-medium">
            Price dropped by ₹{discount.toLocaleString()}
          </p>
        )}

        {/* Ratings */}
        <div className="flex items-center mb-3">
          {[...Array(5)].map((_, i) => (
            <FaStar
              key={i}
              className={`w-3 h-3 sm:w-4 sm:h-4 ${
                i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'
              }`}
            />
          ))}
          <span className="text-xs sm:text-sm text-gray-500 ml-1">({reviewCount})</span>
        </div>

        {/* Action Button */}
        {product.inStock ? (
          <button 
            style={{backgroundColor: 'var(--main-color)'}}
            className="w-full py-2 sm:py-2.5 md:py-3 text-white text-sm sm:text-base font-medium rounded hover:brightness-90 transition-all duration-300 shadow-sm"
          >
            Add To Cart
          </button>
        ) : (
          <button 
            className="w-full py-2 sm:py-2.5 md:py-3 text-gray-700 text-sm sm:text-base font-medium rounded border border-gray-300 hover:bg-gray-50 transition-all duration-300 shadow-sm"
          >
            Choose Options
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductCard;