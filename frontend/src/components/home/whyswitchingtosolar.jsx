import React from 'react';

const WhySwitchingToSolar = () => {
  // Data structure for benefits
  const benefits = [
    {
      id: 1,
      title: 'Reduced Carbon Footprint',
      description: 'By harnessing solar energy, you significantly lower your greenhouse gas emissions, contributing to a cleaner and more sustainable environment.',
      icon: 'atom',
      color: 'bg-main-dark',
    },
    {
      id: 2,
      title: 'Reduced Electricity Bill',
      description: 'Generating your own power through solar reduces reliance on the grid, leading to substantial savings on monthly electricity expenses.',
      icon: 'lightning',
      color: 'bg-main-dark',
    },
    {
      id: 3,
      title: 'Low Maintenance',
      description: 'Cosmic PowerTech\'s solar systems are built for durability and require minimal maintenance, ensuring long term, hassle-free performance.',
      icon: 'gear',
      color: 'bg-main-dark',
    },
    {
      id: 4,
      title: 'Easy Installation',
      description: 'Installing solar with Cosmic PowerTech is a simple and well-managed process. Our skilled team takes care of everything, delivering quick and reliable setup with added support throughout.',
      icon: 'wrench',
      color: 'bg-main-dark',
    },
    {
      id: 5,
      title: 'Easy Financing with Cosmic PowerTech',
      description: 'Cosmic PowerTech\'s strong reputation ensures you get the advantage of easy financing solutions for your solar energy system.',
      icon: 'money',
      color: 'bg-main-dark',
    },
    {
      id: 6,
      title: 'Clean Energy',
      description: 'As a reliable and clean energy source, solar power plays a vital role in advancing global sustainability and energy independence.',
      icon: 'sun',
      color: 'bg-main-dark',
    },
  ];

  return (
    <div className="bg-white py-8 sm:py-10 md:py-12 px-4 sm:px-6 md:px-8 lg:px-10">
      <div className="max-w-7xl mx-auto">
        {/* Heading */}
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-3 sm:mb-4">
          Why Switching to Solar with Cosmic PowerTech is a Smart Move
        </h2>
        
        {/* Subheading */}
        <p className="text-center text-sm sm:text-base md:text-lg mb-8 sm:mb-10 md:mb-12 max-w-4xl mx-auto px-2 sm:px-4">
          Switching to solar means getting smart with your energy — and your wallet. While bills go up, your solar gear soaks up free sunshine, <span className="text-main font-medium">saving you money</span> nonstop. Plus, <span className="text-main font-medium">saving the planet</span>? That's a win-win.
        </p>
        
        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 md:gap-8">
          {benefits.map((benefit) => (
            <div key={benefit.id} className="flex flex-col sm:flex-row items-center sm:items-start bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-4 sm:p-5 sm:space-x-4 border border-gray-100">
              {/* Icon */}
              <div className={`${benefit.color} p-3 sm:p-4 rounded-lg flex-shrink-0 mb-4 sm:mb-0`}>
                {benefit.icon === 'atom' && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M12 3C8.14 3 5 7.13 5 12C5 16.87 8.14 21 12 21C15.86 21 19 16.87 19 12C19 7.13 15.86 3 12 3Z" />
                    <path d="M12 3C14.21 3 16 7.13 16 12C16 16.87 14.21 21 12 21C9.79 21 8 16.87 8 12C8 7.13 9.79 3 12 3Z" transform="rotate(60 12 12)" />
                    <path d="M12 3C14.21 3 16 7.13 16 12C16 16.87 14.21 21 12 21C9.79 21 8 16.87 8 12C8 7.13 9.79 3 12 3Z" transform="rotate(120 12 12)" />
                  </svg>
                )}
                {benefit.icon === 'lightning' && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" />
                  </svg>
                )}
                {benefit.icon === 'gear' && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                  </svg>
                )}
                {benefit.icon === 'wrench' && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                  </svg>
                )}
                {benefit.icon === 'money' && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="6" width="20" height="12" rx="2" />
                    <circle cx="12" cy="12" r="3" />
                    <path d="M17 12h.01M7 12h.01" />
                  </svg>
                )}
                {benefit.icon === 'sun' && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
              </div>
              
              {/* Content */}
              <div className="text-center sm:text-left">
                <h3 className="text-lg sm:text-xl font-semibold mb-2">{benefit.title}</h3>
                <p className="text-gray-700 text-sm sm:text-base">{benefit.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WhySwitchingToSolar;