import React from 'react';
import { Link } from 'react-router-dom';
// Import images
import power1 from '../../assets/images/power1.webp';
import power2 from '../../assets/images/power2.webp';
import power3 from '../../assets/images/power3.webp';
import power4 from '../../assets/images/power4.webp';
import power5 from '../../assets/images/power5.webp';
import power6 from '../../assets/images/power6.jpg';

const PowerSolutions = () => {
  // Data structure for power solutions based on the image
  const topRowSolutions = [
    {
      id: 1,
      title: 'Solar Module',
      image: power1,
      link: '/products/solar-module',
    },
    {
      id: 2,
      title: 'Solar Inverter',
      image: power2,
      link: '/products/solar-inverter',
    },
    {
      id: 3,
      title: 'Li-ion Battery',
      image: power3,
      link: '/products/li-ion-battery',
    },
    {
      id: 4,
      title: 'Rooftops',
      image: power4,
      link: '/products/rooftops',
    },
    {
      id: 5,
      title: 'Radiance Solar Kit',
      image: power5,
      link: '/products/radiance-solar-kit',
    },
    {
      id: 6,
      title: 'Save More',
      image: power6,
      link: '/products/save-more',
    },
  ];


  return (
    <div className="container mx-auto px-6 md:px-8 lg:px-10 py-12">
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8">Power Solutions For Every Lifestyle</h2>
      
      {/* First row - 6 items */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-5 mb-5 sm:mb-8">
        {topRowSolutions.map((solution) => (
          <Link 
            key={solution.id} 
            to={solution.link}
            className="rounded-xl overflow-hidden shadow-md hover:shadow-xl hover:bg-yellow-100 transition-all transform hover:scale-[1.03]"
          >
            <div className="aspect-square">
              <img 
                src={solution.image} 
                alt={solution.title} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/150?text=Image+Not+Found';
                }}
              />
            </div>
            <div className="p-2 sm:p-3 text-center">
              <p className="text-sm sm:text-base font-semibold text-black">{solution.title}</p>
            </div>
          </Link>
        ))}
      </div>
      
     
    </div>
  );
};

export default PowerSolutions;