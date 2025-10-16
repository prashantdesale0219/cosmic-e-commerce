import React from 'react';
import { Link } from 'react-router-dom';

// Import images
import buyingGuideImg from '../assets/images/image1.jpg';
import buyNowPayLaterImg from '../assets/images/image2.jfif';
import solarPanelsImg from '../assets/images/image3.jfif';

const Blogs = () => {
  const blogs = [
    {
      id: 1,
      title: 'Your Complete Guide to Buying Solar Kits from Waverc Online',
      image: buyingGuideImg,
      date: '25th Jun 2023',
      author: 'Waverc',
      link: '/blog/buying-guide'
    },
    {
      id: 2,
      title: "How to Buy Products Using the 'Buy Now, Pay Later' Option",
      image: buyNowPayLaterImg,
      date: '9th Jun 2023',
      author: 'Waverc',
      link: '/blog/buy-now-pay-later'
    },
    {
      id: 3,
      title: 'Anti-Reflective Coatings for Solar Panels: Boosting Performance and Efficiency',
      image: solarPanelsImg,
      date: '28th Jan 2023',
      author: 'Waverc',
      link: '/blog/anti-reflective-coatings'
    }
  ];

  return (
    <div className="py-12 px-4 bg-white">
      <h2 className="text-3xl font-bold text-center mb-10">Blogs</h2>
      
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((blog) => (
            <div key={blog.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={blog.image} 
                  alt={blog.title} 
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
                <Link to={blog.link} className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
              
              <div className="p-4">
                <Link to={blog.link} className="text-lg font-semibold text-gray-800 hover:text-main line-clamp-2 mb-2">
                  {blog.title}
                </Link>
                <div className="flex items-center text-sm text-gray-500 mt-2">
                  <span>By {blog.author}</span>
                  <span className="mx-2">•</span>
                  <span>{blog.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex justify-center mt-8">
          <Link 
            to="/blogs" 
            className="px-6 py-2 border border-main text-main rounded-md hover:bg-main hover:text-white transition-colors duration-300"
          >
            Read More
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Blogs;