import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { FaHeart, FaChevronLeft, FaChevronRight, FaStar, FaShoppingCart, FaEye, FaTruck, FaCheckCircle } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { productsApi } from '../../services/api';
import { fixImageUrl } from '../../utils/imageUtils';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// Product Card Component
const ProductCard = ({ product }) => {
  
  // Calculate discount percentage if both prices are available
  const discountPercentage = product.originalPrice && product.price 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) 
    : 0;
  
  // Check if product is on sale
  const isOnSale = discountPercentage > 0;
  
  return (
    <div 
      className="bg-white shadow-sm overflow-hidden flex flex-col h-full relative"
    >
      {/* Bestseller Badge */}
      <div className="absolute top-0 left-0 z-10">
        <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white text-xs font-bold py-1 px-2 rounded-br shadow-sm">
          Bestseller
        </div>
      </div>
      
      {/* On Sale Badge - Only shows if product has a discount */}
      {isOnSale && (
        <div className="absolute top-0 right-0 z-10">
          <div className="bg-gradient-to-r from-red-500 to-red-700 text-white text-xs font-bold py-1 px-2 rounded-bl shadow-sm">
            On Sale
          </div>
        </div>
      )}
      
      {/* Wishlist Button */}
      <button className="absolute top-2 right-2 z-10 bg-white bg-opacity-90 rounded-full p-1.5 shadow-sm">
        <FaHeart className="text-gray-400 hover:text-red-500 transition-colors" size={14} />
      </button>
      
      {/* Product Image */}
      <Link to={`/product/${product._id}`} className="block">
        <div className="relative pt-[100%] bg-gray-50">
          <img 
            src={product.images && product.images.length > 0 
              ? fixImageUrl(product.images[0])
              : '/src/assets/images/placeholder.jpg'}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/src/assets/images/placeholder.jpg';
            }}
          />
        </div>
      </Link>
      
      {/* Product Info */}
      <div className="p-5 flex flex-col flex-grow">
        {/* Product Name */}
        <Link to={`/product/${product._id}`} className="block">
          <h3 className="text-base font-medium text-gray-800 line-clamp-2 mb-2 group-hover:text-blue-700 transition-colors">
            {product.name || "WAAREE 540Wp 144 Cells 24 Volts Mono PERC Solar Module"}
          </h3>
        </Link>
        
        {/* Price */}
        <div className="flex items-baseline mb-3">
          <span className="text-xl font-bold text-gray-900">₹{product.price ? product.price.toLocaleString() : "10,499.07"}</span>
          {product.originalPrice && (
            <span className="ml-2 text-sm text-gray-500 line-through">₹{product.originalPrice.toLocaleString()}</span>
          )}
          {isOnSale && (
            <span className="ml-2 text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
              {discountPercentage}% OFF
            </span>
          )}
        </div>
        
        {/* Ratings */}
        <div className="flex items-center mb-4">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <FaStar 
                key={i} 
                className={`${i < Math.floor(product.rating || 5) ? 'text-yellow-400' : 'text-gray-200'}`}
                size={16}
              />
            ))}
          </div>
          <span className="ml-2 text-sm text-gray-600">({product.reviewCount || 27})</span>
        </div>
        
        {/* Shipping Info */}
        <div className="flex flex-wrap items-center text-xs text-gray-500 mb-4">
          <div className="flex items-center mr-2 mb-1">
            <FaTruck className="mr-1 flex-shrink-0" />
            <span className="whitespace-nowrap">{product.freeShipping ? 'Free Delivery' : 'Standard Delivery'}</span>
          </div>
          <div className="flex items-center">
            <FaCheckCircle className="mr-1 text-green-500 flex-shrink-0" />
            <span className="whitespace-nowrap">Available in Stock</span>
          </div>
        </div>
        
        {/* Button */}
        <div className="mt-auto">
          <button className="w-full bg-main hover:bg-main-dark text-white font-medium py-3 px-4 rounded-lg text-center flex items-center justify-center gap-2">
            <FaShoppingCart size={16} />
            <span>Add to Basket</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const MostLoved = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // Fetch products with highest ratings
        const response = await productsApi.getAllProducts(1, 8, { sortBy: 'rating', sortOrder: 'desc' });
        console.log(response.data.data)
        if (response.data && response.data.success) {
          setProducts(response.data.data || []);
        } else {
          setProducts([]);
          setError('No products found');
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching most loved products:', err);
        setError('Failed to load products. Please try again later.');
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <section className="py-10 sm:py-12 md:py-16 px-4 sm:px-6 md:px-8 lg:px-12 bg-white">
      <div className="container mx-auto">
        {/* Section Title */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 sm:mb-0">Most Loved By Customers</h2>
          <Link to="/products" className="text-main hover:text-main-dark font-medium flex items-center gap-1 transition-colors">
            View All <FaChevronRight className="text-xs" />
          </Link>
        </div>
        
        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-main"></div>
          </div>
        )}
        
        {/* Error State */}
        {error && (
          <div className="text-center py-16 bg-gray-50 rounded-lg">
            <p className="text-red-500 font-medium">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 bg-main text-white px-4 py-2 rounded-md hover:bg-main-dark transition-colors"
            >
              Try Again
            </button>
          </div>
        )}
        
        {/* Products Swiper Slider */}
        {!loading && !error && products.length > 0 && (
          <div className="relative swiper-container most-loved-swiper">
            <Swiper
              modules={[Navigation, Pagination, Autoplay]}
              spaceBetween={20}
              slidesPerView={1}
              centeredSlides={false}
              loop={false}
              autoplay={{
                delay: 3000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true
              }}
              navigation={{
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
              }}
              pagination={{
                clickable: true,
                dynamicBullets: true,

                el: '.swiper-pagination'
              }}
              breakpoints={{
                // when window width is >= 640px
                640: {
                  slidesPerView: 2,
                  spaceBetween: 16
                },
                // when window width is >= 768px
                768: {
                  slidesPerView: 3,
                  spaceBetween: 20
                },
                // when window width is >= 1024px
                1024: {
                  slidesPerView: 4,
                  spaceBetween: 24
                }
              }}
              className="py-4 pb-16"
            >
              {products.map(product => (
                <SwiperSlide key={product._id}>
                  <ProductCard product={product} />
                </SwiperSlide>
              ))}
            </Swiper>
            
           
          </div>
        )}
        
        {/* No Products State */}
        {!loading && !error && products.length === 0 && (
          <div className="text-center py-16 bg-gray-50 rounded-lg">
            <p className="text-gray-500 font-medium">No products found.</p>
            <p className="text-gray-400 mt-2">Check back later for our most loved products!</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default MostLoved;