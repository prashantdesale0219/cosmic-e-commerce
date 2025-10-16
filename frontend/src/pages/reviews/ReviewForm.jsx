import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { reviewApi } from '../../services/api';
import { FaStar } from 'react-icons/fa';

const ReviewForm = () => {
  const { id } = useParams(); // review id for edit mode
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [review, setReview] = useState({
    rating: 0,
    comment: '',
    productId: ''
  });

  useEffect(() => {
    if (id) {
      fetchReview();
    }
  }, [id]);

  const fetchReview = async () => {
    try {
      setLoading(true);
      const response = await reviewApi.getReviewById(id);
      if (response.data.success) {
        setReview(response.data.data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching review:', error);
      setError('Failed to load review. Please try again.');
      setLoading(false);
    }
  };

  const handleRatingChange = (newRating) => {
    setReview({ ...review, rating: newRating });
  };

  const handleCommentChange = (e) => {
    setReview({ ...review, comment: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (review.rating === 0) {
      setError('Please select a rating');
      return;
    }
    
    if (!review.comment.trim()) {
      setError('Please enter a comment');
      return;
    }
    
    try {
      setSubmitting(true);
      let response;
      
      if (id) {
        // Update existing review
        response = await reviewApi.updateReview(id, review);
      } else {
        // Create new review
        response = await reviewApi.createReview(review);
      }
      
      if (response.data.success) {
        navigate('/reviews');
      }
      
      setSubmitting(false);
    } catch (error) {
      console.error('Error submitting review:', error);
      setError('Failed to submit review. Please try again.');
      setSubmitting(false);
    }
  };

  const renderStarRating = () => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleRatingChange(star)}
            className={`text-2xl focus:outline-none ${
              star <= review.rating ? 'text-yellow-400' : 'text-gray-300'
            }`}
          >
            <FaStar />
          </button>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-main"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        {id ? 'Edit Review' : 'Write a Review'}
      </h1>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">Rating</label>
          {renderStarRating()}
        </div>
        
        <div className="mb-6">
          <label htmlFor="comment" className="block text-gray-700 font-medium mb-2">
            Your Review
          </label>
          <textarea
            id="comment"
            value={review.comment}
            onChange={handleCommentChange}
            rows="5"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-main focus:border-transparent"
            placeholder="Share your experience with this product..."
          ></textarea>
        </div>
        
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/reviews')}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2 bg-main text-white rounded-md hover:bg-main-dark transition-colors disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : id ? 'Update Review' : 'Submit Review'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReviewForm;