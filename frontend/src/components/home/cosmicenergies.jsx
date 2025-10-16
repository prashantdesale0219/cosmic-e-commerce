import React from 'react';

const CosmicEnergies = () => {
  // Data structure for features
  const features = [
    {
      id: 1,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-main" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: '35-Year Legacy',
      description: '',
    },
    {
      id: 2,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-main" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ),
      title: 'Premium Quality Products',
      description: '',
    },
    {
      id: 3,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-main" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
      title: 'Exceptional Customer Service',
      description: '',
    },
    {
      id: 4,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-main" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
        </svg>
      ),
      title: 'Factory-Direct Supply',
      description: '',
    },
    {
      id: 5,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-main" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h.5A2.5 2.5 0 0020 5.5v-1.5" />
        </svg>
      ),
      title: '~16.7 GW+ Solar Modules Manufactured Globally',
      description: '',
    },
    {
      id: 6,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-main" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      title: '5.4 GW Solar Cell Capacity',
      description: '',
    },
    {
      id: 7,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-main" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      title: 'Manufacturing In India & USA',
      description: '',
    },
  ];

  // Group features for better responsive layout
  const firstRow = features.slice(0, 4);
  const secondRow = features.slice(4);

  return (
    <div className="w-full bg-gray-50 py-8 sm:py-10 md:py-12 px-4 sm:px-6 md:px-8 lg:px-10">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-6 sm:mb-8 text-gray-800">
          Cosmic PowerTech – Built On Scale, Driven By Quality
        </h2>
        
        <div className="max-w-4xl mx-auto text-center mb-8 sm:mb-10 md:mb-12 px-2 sm:px-4">
          <p className="text-sm sm:text-base md:text-lg text-gray-700 leading-relaxed">
            With ~ 16.7 GW global solar panel manufacturing capacity and 5.4 GW solar cell manufacturing capacity, Cosmic PowerTech is proud to lead India's solar revolution. Our state-of-the-art facilities in India and the USA ensure every product meets the highest standards of efficiency, durability, and reliability.
          </p>
          <p className="text-sm sm:text-base md:text-lg text-gray-700 mt-4 sm:mt-6 leading-relaxed">
            Every panel and cell undergoes rigorous quality testing, and our customer-first approach ensures smooth service from consultation to installation. Trusted worldwide, Cosmic PowerTech delivers solar solutions that perform — today and for years to come. Choose Cosmic PowerTech for high-quality solar solutions trusted by businesses and homeowners worldwide.
          </p>
        </div>
        
        {/* First row features */}
        <div className="mb-5 sm:mb-6 md:mb-8">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {firstRow.map((feature) => (
              <div 
                key={feature.id} 
                className="bg-white p-3 sm:p-4 md:p-5 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 flex flex-col items-center justify-center text-center h-full border border-gray-100"
              >
                <div className="mb-2 sm:mb-3 bg-gray-50 p-2 sm:p-3 rounded-full">
                  {React.cloneElement(feature.icon, { className: "h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-main mx-auto" })}
                </div>
                <h3 className="text-xs sm:text-sm md:text-base font-semibold text-gray-900">{feature.title}</h3>
                {feature.description && (
                  <p className="mt-1 sm:mt-2 text-xs text-gray-600">{feature.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Second row features */}
        <div>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            {secondRow.map((feature) => (
              <div 
                key={feature.id} 
                className="bg-white p-3 sm:p-4 md:p-5 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 flex flex-col items-center justify-center text-center h-full border border-gray-100"
              >
                <div className="mb-2 sm:mb-3 bg-gray-50 p-2 sm:p-3 rounded-full">
                  {React.cloneElement(feature.icon, { className: "h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-main mx-auto" })}
                </div>
                <h3 className="text-xs sm:text-sm md:text-base font-semibold text-gray-900">{feature.title}</h3>
                {feature.description && (
                  <p className="mt-1 sm:mt-2 text-xs text-gray-600">{feature.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CosmicEnergies;