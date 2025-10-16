import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { 
  FaStar, 
  FaStarHalfAlt, 
  FaRegStar, 
  FaShoppingCart, 
  FaHeart, 
  FaShare, 
  FaCheck, 
  FaInfoCircle,
  FaShieldAlt,
  FaTruck,
  FaUndo,
  FaHeadset,
  FaSolarPanel,
  FaHome,
  FaIndustry,
  FaBuilding,
  FaLeaf,
  FaDownload,
  FaCheckCircle,
  FaEye,
  FaTimes,
  FaCreditCard,
  FaMoneyBillWave,
  FaChevronRight,
  FaTag
} from 'react-icons/fa';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import { productsApi, cartApi, wishlistApi, reviewApi } from '../../services/api';
import { toast } from 'react-toastify';

// Add custom CSS for no scrollbar
const noScrollbarStyle = `
  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`;

const ProductDetails = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [ratingDistribution, setRatingDistribution] = useState([]);
  
  const [mainImage, setMainImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showOffersOffcanvas, setShowOffersOffcanvas] = useState(false);
  const [activeOfferTab, setActiveOfferTab] = useState('emi');
  const [showEmiDetailsModal, setShowEmiDetailsModal] = useState(false);
  const [selectedEmiOffer, setSelectedEmiOffer] = useState(null);
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Fetch product data
  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);
        
        // Get product details
        const productResponse = await productsApi.getProductDetails(id);
        const productData = productResponse.data.data;
        console.log(productData)
        setProduct(productData);
        
        if (productData.images && productData.images.length > 0) {
          setMainImage(productData.images[0]);
        }
        
        // Get related products
        const relatedResponse = await productsApi.getRelatedProducts(id);
        setRelatedProducts(relatedResponse.data.data);
        
        // Get rating summary
        const ratingResponse = await productsApi.getRatingSummary(id);
        const ratingData = ratingResponse.data.data;
        
        if (ratingData) {
          setReviews(ratingData.reviews || []);
          setRatingDistribution(ratingData.ratingDistribution || []);
          setRecommendedProducts(ratingData.recommendedProducts || []);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching product data:', error);
        toast.error('Failed to load product details');
        setLoading(false);
      }
    };
    
    if (id) {
      fetchProductData();
    }
  }, [id]);

  const handleQuantityChange = (e) => {
    setQuantity(parseInt(e.target.value));
  };

  const handleImageClick = (image) => {
    setMainImage(image);
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };
  
  const handleAddToCart = async () => {
    try {
      if (!product) return;
      
      const response = await cartApi.addToCart({
        productId: product._id,
        quantity: quantity
      });
      
      if (response.data.success) {
        toast.success('Product added to cart successfully');
      } else {
        toast.error(response.data.message || 'Failed to add product to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      if (error.response && error.response.status === 401) {
        toast.error('Please login to add items to cart');
      } else if (error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to add product to cart');
      }
    }
  };
  
  const handleAddToWishlist = async () => {
    try {
      if (!product) return;
      
      const response = await wishlistApi.addToWishlist(product._id);
      
      if (response.data.success) {
        toast.success('Product added to wishlist');
      } else {
        toast.error(response.data.message || 'Failed to add product to wishlist');
      }
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      if (error.response && error.response.status === 401) {
        toast.error('Please login to add items to wishlist');
      } else if (error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to add product to wishlist');
      }
    }
  };
  
  const handleSubmitReview = async () => {
    try {
      if (!product || !userRating) {
        toast.error('Please select a rating');
        return;
      }
      
      setSubmittingReview(true);
      
      await reviewApi.createReview({
        productId: product._id,
        rating: userRating,
        review: reviewText
      });
      
      toast.success('Review submitted successfully');
      setShowReviewModal(false);
      setUserRating(0);
      setReviewText('');
      
      // Refresh reviews
      const ratingResponse = await productsApi.getRatingSummary(id);
      const ratingData = ratingResponse.data.data;
      
      if (ratingData) {
        setReviews(ratingData.reviews || []);
        setRatingDistribution(ratingData.ratingDistribution || []);
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Function to render star ratings
  const renderRating = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(<FaStar key={i} className="text-yellow-500" />);
      } else if (i - 0.5 <= rating) {
        stars.push(<FaStarHalfAlt key={i} className="text-yellow-500" />);
      } else {
        stars.push(<FaRegStar key={i} className="text-yellow-500" />);
      }
    }
    return stars;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 font-sans">
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-main"></div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 font-sans">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Product Not Found</h2>
          <p className="text-gray-600 mb-6">The product you are looking for does not exist or has been removed.</p>
          <Link to="/products" className="bg-main hover:bg-main-dark text-white font-bold py-2 px-4 rounded">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 font-sans">
      <style>{noScrollbarStyle}</style>
      {/* Breadcrumb */}
      <nav className="flex flex-wrap text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6 overflow-hidden">
        <Link to="/" className="text-main hover:text-main-dark">Home</Link>
        <span className="mx-1 sm:mx-2">/</span>
        <Link to="/products" className="text-main hover:text-main-dark">Products</Link>
        <span className="mx-1 sm:mx-2">/</span>
        <span className="text-gray-800 font-medium truncate">{product.name}</span>
      </nav>

      {/* EMI Details Modal */}
      {showEmiDetailsModal && selectedEmiOffer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b p-4">
              <h2 className="text-xl font-bold text-gray-800">{selectedEmiOffer.title}</h2>
              <button 
                onClick={() => setShowEmiDetailsModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes size={20} />
              </button>
            </div>
            
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="text-4xl font-bold text-main">
                  {selectedEmiOffer.discount}
                </div>
                <div className="flex-1">
                  <div className="text-lg font-semibold">{selectedEmiOffer.title}</div>
                  <div className="text-sm text-gray-600">{selectedEmiOffer.description}</div>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h3 className="font-semibold text-gray-800 mb-3">Offer Details</h3>
                <p className="text-sm text-gray-600">{selectedEmiOffer.details}</p>
                
                <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-800 mb-2">How to avail:</h4>
                  <ol className="list-decimal list-inside text-sm text-gray-600 space-y-2">
                    <li>Add product to cart</li>
                    <li>Apply coupon code at checkout</li>
                    <li>Select payment method</li>
                    <li>Complete your purchase</li>
                  </ol>
                </div>
                
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setShowEmiDetailsModal(false)}
                    className="bg-main hover:bg-main-dark text-white font-bold py-2 px-4 rounded"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment & Delivery Details Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b p-4">
              <h2 className="text-xl font-bold text-gray-800">Payment & Delivery Details</h2>
              <button 
                onClick={() => setShowPaymentModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes size={20} />
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-8">
                <h3 className="text-lg font-bold mb-4">1. Accepted Payment Methods</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <span className="mr-2 mt-1 text-main"><FaCheck size={14} /></span>
                    <span>UPI, NEFT/RTGS, and Direct Bank Transfers</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 mt-1 text-main"><FaCheck size={14} /></span>
                    <span>Credit Cards and Debit Cards</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 mt-1 text-main"><FaCheck size={14} /></span>
                    <span>Wallet payments, EMI options, and DC/CC support</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 mt-1 text-main"><FaCheck size={14} /></span>
                    <span>BNPL (Buy Now, Pay Later) services supported</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-bold mb-4">2. Shipping & Delivery Details</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <span className="mr-2 mt-1 text-main"><FaCheck size={14} /></span>
                    <span>Orders are typically shipped within <strong>72 hours</strong> of confirmation.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 mt-1 text-main"><FaCheck size={14} /></span>
                    <span>Estimated delivery time ranges from <strong>7 to 21 days</strong> based on location and availability.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Write a Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b p-4">
              <h2 className="text-xl font-bold text-gray-800">Write a Review</h2>
              <button 
                onClick={() => setShowReviewModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes size={20} />
              </button>
            </div>
            
            <div className="p-6">
              <form>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="rating">
                    Rating
                  </label>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className="text-2xl focus:outline-none"
                        onClick={() => setUserRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                      >
                        <FaStar 
                          className={
                            (hoverRating || userRating) >= star 
                              ? "text-yellow-400" 
                              : "text-gray-300"
                          }
                        />
                      </button>
                    ))}
                  </div>
                  <div className="mt-1 text-sm text-gray-600">
                    {userRating ? `You selected ${userRating} star${userRating !== 1 ? 's' : ''}` : 'Click to rate'}
                  </div>
                </div>
                  
                  <div className="mb-6">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="review">
                    Review
                  </label>
                  <textarea
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="review"
                    placeholder="Write your review here..."
                    rows="4"
                  ></textarea>
                </div>
                
                <div className="flex items-center justify-end">
                  <button
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2"
                    type="button"
                    onClick={() => setShowReviewModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="bg-main hover:bg-main-dark text-white font-bold py-2 px-4 rounded"
                    type="button"
                  >
                    Submit Review
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Offers Offcanvas */}
      {showOffersOffcanvas && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
          <div className="bg-white w-full max-w-md h-full overflow-y-auto transform transition-transform duration-300 ease-in-out">
            <div className="flex justify-between items-center border-b p-4">
              <h2 className="text-xl font-bold text-gray-800">All Offers</h2>
              <button 
                onClick={() => setShowOffersOffcanvas(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes size={20} />
              </button>
            </div>
            
            <div className="p-4">
              <div className="flex border-b pb-2 mb-4">
                <div className="w-1/2 text-center">
                  <div 
                    onClick={() => setActiveOfferTab('emi')}
                    className={`text-sm sm:text-base font-semibold pb-1 cursor-pointer ${
                      activeOfferTab === 'emi' 
                        ? 'text-main border-b-2 border-main' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    EMI Offers
                  </div>
                </div>
                <div className="w-1/2 text-center">
                  <div 
                    onClick={() => setActiveOfferTab('brand')}
                    className={`text-sm sm:text-base font-semibold pb-1 cursor-pointer ${
                      activeOfferTab === 'brand' 
                        ? 'text-main border-b-2 border-main' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Brand Offers
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-3">EMI Offers</h3>
                <div className="space-y-4">
                  <div className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl font-bold text-main">
                        0<span className="text-sm align-top">%</span>
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold">EMI3MONTHS</div>
                        <div className="text-xs text-gray-600">No interest EMI for 3 months</div>
                        <div 
                          className="text-xs text-main mt-1 font-medium cursor-pointer"
                          onClick={() => {
                            setSelectedEmiOffer({
                              title: "EMI3MONTHS",
                              description: "No interest EMI for 3 months",
                              discount: "0%",
                              details: "Get 0% interest EMI for 3 months on all major credit cards. Minimum purchase value ₹3,000."
                            });
                            setShowEmiDetailsModal(true);
                            setShowOffersOffcanvas(false);
                          }}
                        >
                          Read more
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl font-bold text-main">
                        5<span className="text-sm align-top">%</span>
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold">HDFC10EMI</div>
                        <div className="text-xs text-gray-600">5% cashback on HDFC EMI</div>
                        <div 
                          className="text-xs text-main mt-1 font-medium cursor-pointer"
                          onClick={() => {
                            setSelectedEmiOffer({
                              title: "HDFC10EMI",
                              description: "5% cashback on HDFC EMI",
                              discount: "5%",
                              details: "Get 5% cashback up to ₹1,000 on HDFC credit card EMI transactions. Valid on 3, 6, 9, and 12 month EMI options."
                            });
                            setShowEmiDetailsModal(true);
                            setShowOffersOffcanvas(false);
                          }}
                        >
                          Read more
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Brand Offers</h3>
                <div className="space-y-4">
                  <div className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl font-bold text-main">
                        10<span className="text-sm align-top">%</span>
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold">NORETURNNOEXCHANGE</div>
                        <div className="text-xs text-gray-600">Apply this coupon code to get 10% off</div>
                        <div 
                          className="text-xs text-main mt-1 font-medium cursor-pointer"
                          onClick={() => {
                            setSelectedEmiOffer({
                              title: "NORETURNNOEXCHANGE",
                              description: "Apply this coupon code to get 10% off",
                              discount: "10%",
                              details: "Get 10% off on your purchase by accepting no-return and no-exchange policy. Maximum discount up to ₹2,000."
                            });
                            setShowEmiDetailsModal(true);
                            setShowOffersOffcanvas(false);
                          }}
                        >
                          Read more
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl font-bold text-main">
                        ₹500
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold">WELCOMEOFFER</div>
                        <div className="text-xs text-gray-600">Get ₹500 off on your first purchase</div>
                        <div 
                          className="text-xs text-main mt-1 font-medium cursor-pointer"
                          onClick={() => {
                            setSelectedEmiOffer({
                              title: "WELCOMEOFFER",
                              description: "Get ₹500 off on your first purchase",
                              discount: "₹500",
                              details: "First-time customers can avail ₹500 off on their purchase. Minimum order value ₹2,000. Valid once per customer."
                            });
                            setShowEmiDetailsModal(true);
                            setShowOffersOffcanvas(false);
                          }}
                        >
                          Read more
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Product Main Section */}
      <div className="flex flex-col lg:flex-row gap-4 sm:gap-8 mb-8 sm:mb-12">
        {/* Product Images */}
        <div className="w-full lg:w-2/5">
          <div className="border border-gray-200 rounded-lg p-2 sm:p-4 bg-white mb-3 sm:mb-4 shadow-sm">
            <img 
              src={mainImage || '/placeholder-image.png'} 
              alt={product?.name || 'Product Image'} 
              className="w-full h-auto object-contain aspect-square"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/no-image-available.png';
              }}
            />
          </div>
          <div className="flex gap-2 sm:gap-3 pb-2 no-scrollbar">
            {product?.images?.map((image, index) => (
              <div 
                key={index} 
                className={`w-14 h-14 sm:w-16 sm:h-16 border cursor-pointer p-1 rounded ${mainImage === image ? 'border-main ring-1 ring-main' : 'border-gray-200'}`}
                onClick={() => handleImageClick(image)}
              >
                <img 
                  src={image} 
                  alt={`${product?.name} - view ${index + 1}`} 
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="w-full lg:w-3/5 bg-white p-4 sm:p-6 rounded-lg shadow-sm">
          <div className="relative">
            {/* Bestseller Badge */}
            <div className="absolute top-0 left-0 z-10">
              <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white text-xs font-bold py-1 px-2 rounded-br shadow-sm">
                Bestseller
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-2 sm:mb-3">{product.name}</h1>
            
            {/* Product ID removed */}
            
            {/* Ratings */}
            <div className="flex items-center mb-3 sm:mb-4">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <FaStar 
                    key={i} 
                    className={`${i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-200'} ${
                      i === Math.floor(product.rating) && product.rating % 1 > 0 ? 'text-yellow-400' : ''
                    }`}
                    size={14}
                  />
                ))}
              </div>
              <span className="ml-2 text-xs sm:text-sm text-gray-600">({product.reviewCount})</span>
            </div>

            {/* Price */}
            <div className="mb-4 sm:mb-6">
              <div className="flex flex-wrap items-baseline mb-2">
                <span className="text-xl sm:text-2xl font-bold text-gray-900">₹{product?.discountPrice?.toLocaleString() || '0'}</span>
                <span className="ml-2 text-base sm:text-lg text-gray-500 line-through">₹{product?.price?.toLocaleString() || '0'}</span>
                <span className="ml-2 text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                  {product?.price ? Math.round(((product.price - (product.discountPrice || 0)) / product.price) * 100) : 0}% OFF
                </span>
              </div>
              <div className="flex items-center mb-2">
                <div className="flex items-center text-green-600 text-xs sm:text-sm mr-3">
                  <FaCheckCircle className="mr-1" />
                  <span>In Stock</span>
                </div>
                <button 
                  onClick={() => setShowPaymentModal(true)}
                  className="text-main hover:text-main-dark underline text-xs flex items-center"
                >
                  <FaInfoCircle className="mr-1" />
                  View Payment & Delivery Details
                </button>
              </div>
            </div>

         

            
            {/* Quantity and Add to Cart */}
            <div className="mb-6 sm:mb-8">
              <div className="flex flex-wrap gap-3 sm:gap-4 mb-3 sm:mb-4">
                <div className="flex items-center">
                  <label htmlFor="quantity" className="mr-2 text-sm sm:text-base text-gray-700">Quantity:</label>
                  <div className="flex border border-gray-300 rounded-md overflow-hidden">
                    <button 
                      onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                      className="px-3 py-1 bg-white text-main hover:bg-gray-100 border-r border-gray-300 flex items-center justify-center"
                    >
                      <span className="text-xl font-bold">−</span>
                    </button>
                    <div className="w-12 flex items-center justify-center text-center">
                      {quantity}
                    </div>
                    <button 
                      onClick={() => setQuantity(prev => Math.min(10, prev + 1))}
                      className="px-3 py-1 bg-white text-main hover:bg-gray-100 border-l border-gray-300 flex items-center justify-center"
                    >
                      <span className="text-xl font-bold">+</span>
                    </button>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mb-4">
                <button 
                  onClick={handleAddToCart}
                  className="bg-main hover:bg-main-dark text-white px-3 sm:px-6 py-2 sm:py-3 rounded-lg flex items-center justify-center gap-1 sm:gap-2 transition-colors duration-300 text-sm sm:text-base"
                >
                  <FaShoppingCart size={14} /> Add to Cart
                </button>
                <Link to="/checkout" className="bg-green-600 hover:bg-green-700 text-white px-3 sm:px-6 py-2 sm:py-3 rounded-lg flex items-center justify-center gap-1 sm:gap-2 transition-colors duration-300 text-sm sm:text-base">
                  Buy Now
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button className="border border-gray-300 hover:border-main text-gray-600 hover:text-red-500 p-2 sm:p-3 rounded-lg transition-colors duration-300 flex items-center justify-center gap-1 sm:gap-2">
                  <FaHeart size={14} />
                  <span className="text-xs sm:text-sm">Wishlist</span>
                </button>
                <button className="border border-gray-300 hover:border-main text-gray-600 hover:text-main p-2 sm:p-3 rounded-lg transition-colors duration-300 flex items-center justify-center gap-1 sm:gap-2">
                  <FaShare size={14} />
                  <span className="text-xs sm:text-sm">Share</span>
                </button>
              </div>
            </div>

            {/* Offers Section */}
            <div className="mb-6 sm:mb-8 border border-dashed border-gray-300 rounded-lg p-3 sm:p-4">
              <div className="mb-4">
                <div className="flex border-b pb-2">
                  <div className="w-1/2 text-center">
                    <div 
                      onClick={() => setActiveOfferTab('emi')}
                      className={`text-sm sm:text-base font-semibold pb-1 cursor-pointer ${
                        activeOfferTab === 'emi' 
                          ? 'text-main border-b-2 border-main' 
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      EMI Offers
                    </div>
                  </div>
                  <div className="w-1/2 text-center">
                    <div 
                      onClick={() => setActiveOfferTab('brand')}
                      className={`text-sm sm:text-base font-semibold pb-1 cursor-pointer ${
                        activeOfferTab === 'brand' 
                          ? 'text-main border-b-2 border-main' 
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      Brand Offers
                    </div>
                  </div>
                </div>
                
                <div className="mt-3 sm:mt-4">
                  {activeOfferTab === 'emi' ? (
                    <>
                      <div className="flex items-center gap-3 p-2 border-b border-gray-100">
                        <div className="text-3xl sm:text-4xl font-bold text-main">
                          0<span className="text-sm sm:text-base align-top">%</span>
                        </div>
                        <div className="flex-1">
                          <div className="text-xs sm:text-sm font-semibold">EMI3MONTHS</div>
                          <div className="text-xs text-gray-600">No interest EMI for 3 months</div>
                          <div 
                            className="text-xs text-main mt-1 font-medium cursor-pointer" 
                            onClick={() => {
                              setSelectedEmiOffer({
                                title: "EMI3MONTHS",
                                description: "No interest EMI for 3 months",
                                discount: "0%",
                                details: "Get 0% interest EMI for 3 months on all major credit cards. Minimum purchase value ₹3,000."
                              });
                              setShowEmiDetailsModal(true);
                            }}
                          >
                            Read more
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-2">
                        <div className="text-3xl sm:text-4xl font-bold text-main">
                          5<span className="text-sm sm:text-base align-top">%</span>
                        </div>
                        <div className="flex-1">
                          <div className="text-xs sm:text-sm font-semibold">HDFC10EMI</div>
                          <div className="text-xs text-gray-600">5% cashback on HDFC EMI</div>
                          <div 
                            className="text-xs text-main mt-1 font-medium cursor-pointer" 
                            onClick={() => {
                              setSelectedEmiOffer({
                                title: "HDFC10EMI",
                                description: "5% cashback on HDFC EMI",
                                discount: "5%",
                                details: "Get 5% cashback up to ₹1,000 on HDFC credit card EMI transactions. Valid on 3, 6, 9, and 12 month EMI options."
                              });
                              setShowEmiDetailsModal(true);
                            }}
                          >
                            Read more
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-3 p-2 border-b border-gray-100">
                        <div className="text-3xl sm:text-4xl font-bold text-main">
                          10<span className="text-sm sm:text-base align-top">%</span>
                        </div>
                        <div className="flex-1">
                          <div className="text-xs sm:text-sm font-semibold">NORETURNNOEXCHANGE</div>
                          <div className="text-xs text-gray-600">Apply this coupon code to get 10% off</div>
                          <div 
                            className="text-xs text-main mt-1 font-medium cursor-pointer" 
                            onClick={() => {
                              setSelectedEmiOffer({
                                title: "NORETURNNOEXCHANGE",
                                description: "Apply this coupon code to get 10% off",
                                discount: "10%",
                                details: "Get 10% off on your purchase by accepting no-return and no-exchange policy. Maximum discount up to ₹2,000."
                              });
                              setShowEmiDetailsModal(true);
                            }}
                          >
                            Read more
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-2">
                        <div className="text-3xl sm:text-4xl font-bold text-main">
                          ₹500
                        </div>
                        <div className="flex-1">
                          <div className="text-xs sm:text-sm font-semibold">WELCOMEOFFER</div>
                          <div className="text-xs text-gray-600">Get ₹500 off on your first purchase</div>
                          <div 
                            className="text-xs text-main mt-1 font-medium cursor-pointer" 
                            onClick={() => {
                              setSelectedEmiOffer({
                                title: "WELCOMEOFFER",
                                description: "Get ₹500 off on your first purchase",
                                discount: "₹500",
                                details: "First-time customers can avail ₹500 off on their purchase. Minimum order value ₹2,000. Valid once per customer."
                              });
                              setShowEmiDetailsModal(true);
                            }}
                          >
                            Read more
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                  
                  <div className="mt-3 text-center">
                    <button 
                      onClick={() => setShowOffersOffcanvas(true)}
                      className="text-main hover:text-main-dark text-sm font-medium flex items-center mx-auto"
                    >
                      View All <FaChevronRight size={12} className="ml-1" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            </div>
            
            {/* Services */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 border-t border-gray-200 pt-4 sm:pt-6">
              <div className="flex flex-col items-center text-center p-2 sm:p-3 bg-gray-50 rounded-lg">
                <FaShieldAlt className="text-main text-lg sm:text-xl mb-1 sm:mb-2" />
                <span className="text-xs sm:text-sm text-gray-700">1 Year Warranty</span>
              </div>
              <div className="flex flex-col items-center text-center p-2 sm:p-3 bg-gray-50 rounded-lg">
                <FaTruck className="text-main text-lg sm:text-xl mb-1 sm:mb-2" />
                <span className="text-xs sm:text-sm text-gray-700">Free Shipping</span>
              </div>
              <div className="flex flex-col items-center text-center p-2 sm:p-3 bg-gray-50 rounded-lg">
                <FaUndo className="text-main text-lg sm:text-xl mb-1 sm:mb-2" />
                <span className="text-xs sm:text-sm text-gray-700">30-Day Returns</span>
              </div>
              <div className="flex flex-col items-center text-center p-2 sm:p-3 bg-gray-50 rounded-lg">
                <FaHeadset className="text-main text-lg sm:text-xl mb-1 sm:mb-2" />
                <span className="text-xs sm:text-sm text-gray-700">24/7 Support</span>
              </div>
            </div>
          </div>
        </div>


      {/* Product Applications */}
      <div className="mb-8 sm:mb-12">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">Product Applications</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-4">
          {product.applications.map((app, index) => (
            <div key={index} className="flex flex-col items-center text-center p-3 sm:p-4 border border-gray-200 rounded-lg hover:border-main hover:shadow-md transition-all duration-300">
              <div className="text-main text-2xl sm:text-3xl mb-2 sm:mb-3">{app.icon}</div>
              <span className="text-sm sm:text-base text-gray-700">{app.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Product Tabs */}
      <div className="mb-8 sm:mb-12">
        <div className="border-b border-gray-200 overflow-x-auto no-scrollbar">
          <div className="flex -mb-px min-w-max">
            <button 
              className={`inline-block py-3 sm:py-4 px-4 sm:px-6 border-b-2 font-medium text-xs sm:text-sm ${
                activeTab === 'description' 
                  ? 'border-main text-main' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => handleTabClick('description')}
            >
              Description
            </button>
            <button 
              className={`inline-block py-3 sm:py-4 px-4 sm:px-6 border-b-2 font-medium text-xs sm:text-sm ${
                activeTab === 'specifications' 
                  ? 'border-main text-main' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => handleTabClick('specifications')}
            >
              Specifications
            </button>
            <button 
              className={`inline-block py-3 sm:py-4 px-4 sm:px-6 border-b-2 font-medium text-xs sm:text-sm ${
                activeTab === 'reviews' 
                  ? 'border-main text-main' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => handleTabClick('reviews')}
            >
              Reviews
            </button>
          </div>
        </div>
        
        <div className="py-4 sm:py-6">
          {activeTab === 'description' && (
            <div className="space-y-6 sm:space-y-8">
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4">Product Description</h3>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">{product.description}</p>
              </div>
              
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4">Key Features</h3>
                <ul className="space-y-1.5 sm:space-y-2">
                  {product?.features && (
                    <li className="flex items-start">
                      <FaCheck className="text-main mt-1 mr-2 flex-shrink-0 text-sm" />
                      <span className="text-sm sm:text-base text-gray-700">{product.features}</span>
                    </li>
                  )}
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4">Technical Documentation</h3>
                <div className="flex flex-wrap gap-2 sm:gap-4">
                  <button className="flex items-center bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-colors duration-300 text-xs sm:text-sm">
                    <FaDownload className="mr-1 sm:mr-2" /> Product Datasheet
                  </button>
                  <button className="flex items-center bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-colors duration-300 text-xs sm:text-sm">
                    <FaDownload className="mr-1 sm:mr-2" /> Installation Guide
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'specifications' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Technical Specifications</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <tbody className="divide-y divide-gray-200">
                      {Object.entries(product?.specifications || {}).map(([key, value], index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">{key}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{value}</td>
                </tr>
              ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Compliance & Certifications</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  <div className="flex flex-col items-center text-center p-4 border border-gray-200 rounded-lg">
                    <FaShieldAlt className="text-main text-2xl mb-2" />
                    <span className="text-sm font-medium text-gray-700">CE Certified</span>
                  </div>
                  <div className="flex flex-col items-center text-center p-4 border border-gray-200 rounded-lg">
                    <FaShieldAlt className="text-main text-2xl mb-2" />
                    <span className="text-sm font-medium text-gray-700">RoHS Compliant</span>
                  </div>
                  <div className="flex flex-col items-center text-center p-4 border border-gray-200 rounded-lg">
                    <FaShieldAlt className="text-main text-2xl mb-2" />
                    <span className="text-sm font-medium text-gray-700">ISO 9001</span>
                  </div>
                  <div className="flex flex-col items-center text-center p-4 border border-gray-200 rounded-lg">
                    <FaShieldAlt className="text-main text-2xl mb-2" />
                    <span className="text-sm font-medium text-gray-700">IEC 61215</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-main-light p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Request Custom Specifications</h3>
                <p className="text-gray-700 mb-4">Need this product with different specifications? Contact our team for customization options.</p>
                <button className="bg-main hover:bg-main-dark text-white px-6 py-2 rounded-lg transition-colors duration-300">
                  Contact Sales Team
                </button>
              </div>
            </div>
          )}
          
          {activeTab === 'reviews' && (
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row gap-8">
                <div className="w-full md:w-1/3 bg-gray-50 p-6 rounded-lg text-center">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Customer Reviews</h3>
                  <div className="text-4xl font-bold text-gray-800 mb-2">{product.rating}</div>
                  <div className="flex justify-center mb-2">
                    {renderRating(product.rating)}
                  </div>
                  <div className="text-gray-600 text-sm">{product.reviewCount} reviews</div>
                </div>
                
                <div className="w-full md:w-2/3">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Rating Breakdown</h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <span className="w-16 text-sm text-gray-600">5 Star</span>
                      <div className="flex-1 h-2 mx-2 bg-gray-200 rounded-full">
                        <div className="h-2 bg-main rounded-full" style={{ width: '70%' }}></div>
                      </div>
                      <span className="w-12 text-sm text-gray-600">70%</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-16 text-sm text-gray-600">4 Star</span>
                      <div className="flex-1 h-2 mx-2 bg-gray-200 rounded-full">
                        <div className="h-2 bg-main rounded-full" style={{ width: '20%' }}></div>
                      </div>
                      <span className="w-12 text-sm text-gray-600">20%</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-16 text-sm text-gray-600">3 Star</span>
                      <div className="flex-1 h-2 mx-2 bg-gray-200 rounded-full">
                        <div className="h-2 bg-main rounded-full" style={{ width: '7%' }}></div>
                      </div>
                      <span className="w-12 text-sm text-gray-600">7%</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-16 text-sm text-gray-600">2 Star</span>
                      <div className="flex-1 h-2 mx-2 bg-gray-200 rounded-full">
                        <div className="h-2 bg-main rounded-full" style={{ width: '2%' }}></div>
                      </div>
                      <span className="w-12 text-sm text-gray-600">2%</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-16 text-sm text-gray-600">1 Star</span>
                      <div className="flex-1 h-2 mx-2 bg-gray-200 rounded-full">
                        <div className="h-2 bg-main rounded-full" style={{ width: '1%' }}></div>
                      </div>
                      <span className="w-12 text-sm text-gray-600">1%</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="text-center">
                <button 
                  onClick={() => setShowReviewModal(true)}
                  className="bg-main hover:bg-main-dark text-white px-8 py-3 rounded-lg transition-colors duration-300"
                >
                  Write a Review
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      <div className="mb-8 sm:mb-12">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">Related Products</h2>
        <Swiper
          modules={[Autoplay]}
          spaceBetween={15}
          slidesPerView={1}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
          }}
          breakpoints={{
            640: {
              slidesPerView: 2,
              spaceBetween: 20,
            },
            1024: {
              slidesPerView: 4,
              spaceBetween: 20,
            },
          }}
          className="related-products-swiper no-scrollbar"
        >
          {product?.relatedProducts?.map((item, index) => (
            <SwiperSlide key={index}>
              <div className="bg-white shadow-sm overflow-hidden flex flex-col h-full relative rounded-lg">
                {/* Bestseller Badge */}
                {item.isNew && (
                  <div className="absolute top-0 left-0 z-10">
                    <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white text-xs font-bold py-1 px-2 rounded-br shadow-sm">
                      NEW
                    </div>
                  </div>
                )}
                
                {/* On Sale Badge - Only shows if product has a discount */}
                {item.discount > 0 && (
                  <div className="absolute top-0 right-0 z-10">
                    <div className="bg-gradient-to-r from-red-500 to-red-700 text-white text-xs font-bold py-1 px-2 rounded-bl shadow-sm">
                      ON SALE
                    </div>
                  </div>
                )}
                
                {/* Wishlist Button */}
                <button className="absolute top-2 right-2 z-10 bg-white bg-opacity-90 rounded-full p-1.5 shadow-sm">
                  <FaHeart className="text-gray-400 hover:text-red-500 transition-colors" size={14} />
                </button>
                
                {/* Product Image */}
                <a href={`/product/${item.id}`} className="block">
                  <div className="relative pt-[100%] bg-gray-50">
                    <img 
                      src={item.image}
                      alt={item.name}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>
                </a>
                
                {/* Product Info */}
                <div className="p-3 sm:p-5 flex flex-col flex-grow">
                  {/* Product Name */}
                  <a href={`/product/${item.id}`} className="block">
                    <h3 className="text-sm sm:text-base font-medium text-gray-800 line-clamp-2 mb-1 sm:mb-2 hover:text-blue-700 transition-colors">
                      {item.name}
                    </h3>
                  </a>
                  
                  {/* Price */}
                  <div className="flex items-baseline mb-2 sm:mb-3">
                    <span className="text-lg sm:text-xl font-bold text-gray-900">₹{item.discountPrice.toFixed(2)}</span>
                    {item.discount > 0 && (
                      <span className="ml-2 text-xs sm:text-sm text-gray-500 line-through">₹{item.price.toFixed(2)}</span>
                    )}
                  </div>
                  
                  {/* Ratings */}
                  <div className="flex items-center mb-2 sm:mb-4">
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <FaStar 
                          key={i} 
                          className={`${i < Math.floor(item.rating) ? 'text-yellow-400' : 'text-gray-200'}`}
                          size={12}
                        />
                      ))}
                    </div>
                    <span className="ml-1 sm:ml-2 text-xs text-gray-600">({item.reviewCount})</span>
                  </div>
                  
                  {/* Shipping Info */}
                  <div className="flex flex-wrap items-center text-xs text-gray-500 mb-2 sm:mb-4">
                    <div className="flex items-center mr-2 mb-1">
                      <FaTruck className="mr-1 flex-shrink-0 text-xs" />
                      <span className="whitespace-nowrap text-xs">Free Delivery</span>
                    </div>
                    <div className="flex items-center">
                      <FaCheckCircle className="mr-1 text-green-500 flex-shrink-0 text-xs" />
                      <span className="whitespace-nowrap text-xs">In Stock</span>
                    </div>
                  </div>
                  
                  {/* Button */}
                  <div className="mt-auto">
                    <button 
                      className="w-full bg-blue-700 hover:bg-blue-800 text-white py-1.5 sm:py-2 px-3 sm:px-4 rounded-md transition-colors flex items-center justify-center text-sm"
                    >
                      <FaShoppingCart className="mr-1 sm:mr-2 text-xs sm:text-sm" />
                      Add to Basket
                    </button>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* You might be interested */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">You might be interested</h2>
        <Swiper
          modules={[Autoplay]}
          spaceBetween={15}
          slidesPerView={1}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
          }}
          breakpoints={{
            640: {
              slidesPerView: 2,
              spaceBetween: 20,
            },
            1024: {
              slidesPerView: 4,
              spaceBetween: 20,
            },
          }}
          className="recommended-products-swiper no-scrollbar"
        >
          {product?.recommended?.map((item, index) => (
            <SwiperSlide key={index}>
              <div className="bg-white shadow-sm overflow-hidden flex flex-col h-full relative">
                {/* Bestseller Badge */}
                {item.isNew && (
                  <div className="absolute top-0 left-0 z-10">
                    <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white text-xs font-bold py-1 px-2 rounded-br shadow-sm">
                      NEW
                    </div>
                  </div>
                )}
                
                {/* On Sale Badge - Only shows if product has a discount */}
                {item.discount > 0 && (
                  <div className="absolute top-0 right-0 z-10">
                    <div className="bg-gradient-to-r from-red-500 to-red-700 text-white text-xs font-bold py-1 px-2 rounded-bl shadow-sm">
                      -{item.discount}% OFF
                    </div>
                  </div>
                )}
                
                {/* Wishlist Button */}
                <button className="absolute top-2 right-2 z-10 bg-white bg-opacity-90 rounded-full p-1.5 shadow-sm">
                  <FaHeart className="text-gray-400 hover:text-red-500 transition-colors" size={14} />
                </button>
                
                {/* Product Image */}
                <a href={`/product/${item.id}`} className="block">
                  <div className="relative pt-[100%] bg-gray-50">
                    <img 
                      src={item.image}
                      alt={item.name}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>
                </a>
                
                {/* Product Info */}
                <div className="p-5 flex flex-col flex-grow">
                  {/* Product Name */}
                  <a href={`/product/${item.id}`} className="block">
                    <h3 className="text-base font-medium text-gray-800 line-clamp-2 mb-2 hover:text-blue-700 transition-colors">
                      {item.name}
                    </h3>
                  </a>
                  
                  {/* Price */}
                  <div className="flex items-baseline mb-3">
                    <span className="text-xl font-bold text-gray-900">₹{item.discountPrice.toFixed(2)}</span>
                    {item.discount > 0 && (
                      <span className="ml-2 text-sm text-gray-500 line-through">₹{item.price.toFixed(2)}</span>
                    )}
                  </div>
                  
                  {/* Ratings */}
                  <div className="flex items-center mb-4">
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <FaStar 
                          key={i} 
                          className={`${i < Math.floor(item.rating) ? 'text-yellow-400' : 'text-gray-200'}`}
                          size={16}
                        />
                      ))}
                    </div>
                    <span className="ml-2 text-sm text-gray-600">({item.reviewCount})</span>
                  </div>
                  
                  {/* Shipping Info */}
                  <div className="flex flex-wrap items-center text-xs text-gray-500 mb-4">
                    <div className="flex items-center mr-2 mb-1">
                      <FaTruck className="mr-1 flex-shrink-0" />
                      <span className="whitespace-nowrap">Free Delivery</span>
                    </div>
                    <div className="flex items-center">
                      <FaCheckCircle className="mr-1 text-green-500 flex-shrink-0" />
                      <span className="whitespace-nowrap">Available in Stock</span>
                    </div>
                  </div>
                  
                  {/* Button */}
                  <div className="mt-auto">
                    <button 
                      className="w-full bg-main hover:bg-main-dark text-white font-medium py-3 px-4 rounded-lg text-center flex items-center justify-center gap-2"
                    >
                      <FaShoppingCart size={16} />
                      <span>Add to Basket</span>
                    </button>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
      </div>
  )}
  
export default ProductDetails;
