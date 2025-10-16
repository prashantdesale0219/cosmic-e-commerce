import React from 'react';
import { Link } from 'react-router-dom';
import { FaChevronRight, FaHome } from 'react-icons/fa';

const Breadcrumb = ({ items }) => {
  return (
    <nav className="flex items-center text-sm font-medium text-gray-600 mb-4">
      <Link to="/" className="flex items-center hover:text-[#92c51b] transition-colors">
        <FaHome className="mr-1" />
        <span>Home</span>
      </Link>
      
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <FaChevronRight className="mx-2 text-gray-400" size={12} />
          {index === items.length - 1 ? (
            <span className="text-[#92c51b] font-semibold">{item.label}</span>
          ) : (
            <Link 
              to={item.path} 
              className="hover:text-[#92c51b] transition-colors"
            >
              {item.label}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumb;