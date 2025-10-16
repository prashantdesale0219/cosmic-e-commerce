import React, { useState } from 'react';
import needBanner from '../../assets/images/needbanner.webp';
import SolarConsiderations from './SolarConsiderations';

const KnowYourNeed = () => {
  const [activeTab, setActiveTab] = useState('residential');

  // Data from the new image
  const applianceData = [
    { appliance: 'Ceiling Fan', quantity: 4, powerRating: 0.075, totalPower: 0.3 },
    { appliance: 'LED Bulb', quantity: 6, powerRating: 0.009, totalPower: 0.05 },
    { appliance: 'Television (LED)', quantity: 2, powerRating: 0.08, totalPower: 0.16 },
    { appliance: 'Refrigerator (Single Door)', quantity: 1, powerRating: 0.15, totalPower: 0.15 },
    { appliance: 'Washing Machine', quantity: 1, powerRating: 0.5, totalPower: 0.5 },
    { appliance: 'Microwave Oven', quantity: 1, powerRating: 1.2, totalPower: 1.2 },
    { appliance: 'Water Pump', quantity: 1, powerRating: 0.75, totalPower: 0.75 },
    { appliance: 'Iron', quantity: 1, powerRating: 1, totalPower: 1 },
    { appliance: 'Air Conditioner (1 Ton)', quantity: 1, powerRating: 1.2, totalPower: 1.2 },
    { appliance: 'Geyser (Water Heater)', quantity: 1, powerRating: 2, totalPower: 2 }
  ];

  const solarSystemData = [
    { totalAppliances: 10, estimatedLoad: 3.85, recommendedSystem: 4.81 },
    { totalAppliances: 20, estimatedLoad: 7.69, recommendedSystem: 9.61 },
    { totalAppliances: 30, estimatedLoad: 11.54, recommendedSystem: 14.42 },
    { totalAppliances: 40, estimatedLoad: 15.39, recommendedSystem: 19.24 },
    { totalAppliances: 50, estimatedLoad: 19.24, recommendedSystem: 24.05 }
  ];

  return (
    <div className="know-your-need-container mx-2 sm:mx-3 md:mx-8 lg:mx-16" style={{ 
      backgroundImage: `url(${needBanner})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      padding: '20px 10px sm:padding-30px sm:20px md:40px md:20px',
      color: 'white'
    }}>
      <div className="max-w-6xl mx-auto bg-black bg-opacity-70 p-3 sm:p-4 md:p-6 rounded-lg">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-center mb-3 sm:mb-4 md:mb-6 text-yellow-400">Know Your Solar Energy Needs</h2>
        
        {/* Tabs */}
        <div className="flex mb-3 sm:mb-4 md:mb-6">
          <button 
            className={`flex-1 py-1 sm:py-2 px-2 sm:px-4 text-xs sm:text-sm md:text-base ${activeTab === 'residential' ? 'bg-yellow-500 text-white' : 'bg-gray-700 text-white'}`}
            onClick={() => setActiveTab('residential')}
          >
            <span className="flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 mr-1 sm:mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
              Residential
            </span>
          </button>
          <button 
            className={`flex-1 py-1 sm:py-2 px-2 sm:px-4 text-xs sm:text-sm md:text-base ${activeTab === 'nonResidential' ? 'bg-yellow-500 text-white' : 'bg-gray-700 text-white'}`}
            onClick={() => setActiveTab('nonResidential')}
          >
            <span className="flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 mr-1 sm:mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 01-1 1h-2a1 1 0 01-1-1v-2a1 1 0 00-1-1H7a1 1 0 00-1 1v2a1 1 0 01-1 1H3a1 1 0 01-1-1V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
              </svg>
              Non-Residential
            </span>
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse mb-4 sm:mb-6 md:mb-8 text-xs sm:text-sm md:text-base">
            <thead>
              <tr className="bg-yellow-500 text-white">
                <th className="border border-gray-600 p-1 sm:p-2 text-left">Appliance</th>
                <th className="border border-gray-600 p-1 sm:p-2 text-center">Units Required</th>
                <th className="border border-gray-600 p-1 sm:p-2 text-center">Power Rating (kW)</th>
                <th className="border border-gray-600 p-1 sm:p-2 text-center">Total Power (kW)</th>
              </tr>
            </thead>
            <tbody>
              {applianceData.map((item, index) => (
                <tr key={index} className="bg-black bg-opacity-60 text-white">
                  <td className="border border-gray-600 p-1 sm:p-2 text-cyan-300">{item.appliance}</td>
                  <td className="border border-gray-600 p-1 sm:p-2 text-center">{item.quantity}</td>
                  <td className="border border-gray-600 p-1 sm:p-2 text-center">{item.powerRating}</td>
                  <td className="border border-gray-600 p-1 sm:p-2 text-center text-yellow-400">{item.totalPower}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs sm:text-sm md:text-base">
            <thead>
              <tr className="bg-yellow-500 text-white">
                <th className="border border-gray-600 p-1 sm:p-2 text-center">Total Appliances</th>
                <th className="border border-gray-600 p-1 sm:p-2 text-center">Estimated Load (kW)</th>
                <th className="border border-gray-600 p-1 sm:p-2 text-center">Recommended System (kW)</th>
              </tr>
            </thead>
            <tbody>
              {solarSystemData.map((item, index) => (
                <tr key={index} className="bg-black bg-opacity-60 text-white">
                  <td className="border border-gray-600 p-2 text-center">{item.totalAppliances}</td>
                  <td className="border border-gray-600 p-2 text-center">{item.estimatedLoad}</td>
                  <td className="border border-gray-600 p-2 text-center text-yellow-400">{item.recommendedSystem}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="text-center mt-6">
          <button className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-6 rounded-full">
            Contact Us
          </button>
        </div>
        
        
      </div>
    </div>
  );
};

export default KnowYourNeed;