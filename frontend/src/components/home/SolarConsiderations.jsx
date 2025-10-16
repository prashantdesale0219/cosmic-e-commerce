import React from 'react';

const SolarConsiderations = () => {
  // Data structure for solar considerations
  const considerations = [
    {
      id: 1,
      title: 'Rooftop Space Availability',
      description: 'Ensure you have sufficient, shadow-free space for solar panel installation. A 1kW system typically requires 80-100 sq. ft. of usable rooftop space.',
      icon: 'home',
      color: 'bg-main-dark',
    },
    {
      id: 2,
      title: 'Sunlight Exposure',
      description: 'Your rooftop should get at least 4-6 hours of direct sunlight daily for optimal efficiency. Avoid obstructions like trees, water tanks, or high-rise buildings.',
      icon: 'sun',
      color: 'bg-main-dark',
    },
    {
      id: 3,
      title: 'Load Assessment',
      description: 'Review your electricity bills to understand your average monthly consumption. Helps in determining the correct solar system capacity (in kW).',
      icon: 'bolt',
      color: 'bg-main-dark',
    },
    {
      id: 4,
      title: 'Structural Strength',
      description: 'Roof should be strong enough to bear the weight of solar panels and mounting structures. Most quality-approved RCC rooftops are ideal.',
      icon: 'building',
      color: 'bg-main-dark',
    },
    {
      id: 5,
      title: 'Grid Connection & Net Metering',
      description: 'Check with your local DISCOM (distribution company) for grid connectivity rules. Apply for net metering to track energy usage and excess power sent to the grid.',
      icon: 'plug',
      color: 'bg-main-dark',
    },
    {
      id: 6,
      title: 'Budget & Financing',
      description: 'Solar systems are a long-term investment. Assess costs and available subsidies. Explore government schemes, loans, or EMI options to make it affordable.',
      icon: 'money',
      color: 'bg-main-dark',
    },
    {
      id: 7,
      title: 'Inverter & Battery Selection (if applicable)',
      description: 'Choose the right inverter based on system size and type (on-grid, off-grid, hybrid). Batteries are required for off-grid systems or backup needs.',
      icon: 'battery',
      color: 'bg-main-dark',
    }
  ];

  return (
    <div className="bg-white py-8 sm:py-10 md:py-12 px-4 sm:px-6 md:px-8 lg:px-10">
      <div className="max-w-7xl mx-auto">
        {/* Heading */}
        <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-center mb-3 sm:mb-4">
          Key Solar Considerations by Cosmic PowerTech
        </h2>
        
        {/* Subheading */}
        <p className="text-center text-xs sm:text-sm md:text-base mb-6 sm:mb-8 md:mb-12 max-w-4xl mx-auto px-2 sm:px-4">
          Before installing solar panels, consider these important factors to ensure you get the <span className="text-main font-medium">maximum benefits</span> from your solar investment.
        </p>
        
        {/* Considerations Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 md:gap-6 lg:gap-8">
          {considerations.map((consideration) => (
            <div 
              key={consideration.id} 
              className="flex items-start space-x-3 p-3 sm:p-4 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 bg-white"
            >
              {/* Icon */}
              <div className={`${consideration.color} p-2 sm:p-3 rounded-lg flex-shrink-0 flex items-center justify-center`}>
                {consideration.icon === 'home' && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                  </svg>
                )}
                {consideration.icon === 'sun' && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="5" />
                    <line x1="12" y1="1" x2="12" y2="3" />
                    <line x1="12" y1="21" x2="12" y2="23" />
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                    <line x1="1" y1="12" x2="3" y2="12" />
                    <line x1="21" y1="12" x2="23" y2="12" />
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                  </svg>
                )}
                {consideration.icon === 'bolt' && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" />
                  </svg>
                )}
                {consideration.icon === 'building' && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
                    <line x1="12" y1="18" x2="12" y2="22"></line>
                    <line x1="8" y1="6" x2="8" y2="6"></line>
                    <line x1="16" y1="6" x2="16" y2="6"></line>
                    <line x1="8" y1="10" x2="8" y2="10"></line>
                    <line x1="16" y1="10" x2="16" y2="10"></line>
                    <line x1="8" y1="14" x2="8" y2="14"></line>
                    <line x1="16" y1="14" x2="16" y2="14"></line>
                  </svg>
                )}
                {consideration.icon === 'plug' && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path>
                    <line x1="12" y1="2" x2="12" y2="12"></line>
                  </svg>
                )}
                {consideration.icon === 'money' && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="6" width="20" height="12" rx="2" />
                    <circle cx="12" cy="12" r="3" />
                    <path d="M17 12h.01M7 12h.01" />
                  </svg>
                )}
                {consideration.icon === 'battery' && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="1" y="6" width="18" height="12" rx="2" ry="2"></rect>
                    <line x1="23" y1="13" x2="23" y2="11"></line>
                    <line x1="5" y1="10" x2="5" y2="10"></line>
                    <line x1="9" y1="10" x2="9" y2="10"></line>
                    <line x1="13" y1="10" x2="13" y2="10"></line>
                  </svg>
                )}
              </div>
              
              {/* Content */}
              <div className="flex-1">
                <h3 className="text-sm sm:text-base md:text-lg font-semibold mb-1 sm:mb-2">{consideration.title}</h3>
                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">{consideration.description}</p>
              </div>
            </div>
          ))}
        </div>
        
        {/* CTA Button */}
        <div className="text-center mt-8 sm:mt-10">
          <button className="bg-main hover:bg-main-dark text-white font-bold py-2 sm:py-3 px-6 sm:px-8 rounded-lg inline-flex items-center transition-colors duration-300 text-sm sm:text-base">
            <span>Get a Quote from Cosmic PowerTech</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SolarConsiderations;