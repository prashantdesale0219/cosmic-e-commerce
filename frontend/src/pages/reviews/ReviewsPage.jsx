import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { reviewApi } from '../../services/api';
import { FaStar, FaRegStar, FaEdit, FaTrash } from 'react-icons/fa';

const ReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUserReviews();
  }, []);

  const fetchUserReviews = async () => {
    try {
      setLoading(true);
      // Assuming there's an API endpoint to get user's reviews
      const response = await reviewApi.getUserReviews();
      if (response.data.success) {
        setReviews(response.data.data || []);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setError('Failed to load reviews. Please try again.');
      setLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    
    try {
      const response = await reviewApi.deleteReview(reviewId);
      if (response.data.success) {
        setReviews(reviews.filter(review => review._id !== reviewId));
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('Failed to delete review. Please try again.');
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(<FaStar key={i} className="text-yellow-400" />);
      } else {
        stars.push(<FaRegStar key={i} className="text-yellow-400" />);
      }
    }
    return stars;
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Reviews</h1>
      
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-main"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-md">
          {error}
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaStar className="text-gray-400 text-2xl" />
          </div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">No reviews yet</h3>
          <p className="text-gray-500 mb-6">You haven't written any reviews yet.</p>
          <Link to="/products" className="inline-block bg-main text-white px-6 py-2 rounded-md hover:bg-main-dark transition-colors">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {reviews.map((review) => (
            <div key={review._id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100">
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <Link to={`/product/${review.productId}`} className="text-lg font-medium text-gray-800 hover:text-main transition-colors">
                      {review.product?.name}
                    </Link>
                    <div className="flex items-center mt-2">
                      {renderStars(review.rating)}
                      <span className="ml-2 text-gray-600">{review.rating}/5</span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Link 
                      to={`/reviews/edit/${review._id}`}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                    >
                      <FaEdit />
                    </Link>
                    <button 
                      onClick={() => handleDeleteReview(review._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
                
                <div className="mt-4">
                  <p className="text-gray-700">{review.comment}</p>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-sm text-gray-500">Reviewed on {formatDate(review.createdAt)}</span>
                  {review.createdAt !== review.updatedAt && (
                    <span className="text-xs text-gray-400">Edited on {formatDate(review.updatedAt)}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewsPage;