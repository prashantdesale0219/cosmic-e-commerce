import React from 'react';
import banner1 from '../../assets/images/banner.jpg';
import company1 from '../../assets/images/company1.webp';
import company2 from '../../assets/images/company2.webp';
import company3 from '../../assets/images/company3.webp';
import company4 from '../../assets/images/company4.jpg';

const CertifiedAndBanner = () => {
  // Array of company logos for the marquee
  const companyLogos = [
    { id: 1, src: company1, alt: 'Company 1' },
    { id: 2, src: company2, alt: 'Company 2' },
    { id: 3, src: company3, alt: 'Company 3' },
    { id: 4, src: company4, alt: 'Company 4' },
    { id: 5, src: company1, alt: 'Company 1' }, // Duplicated for continuous effect
    { id: 6, src: company2, alt: 'Company 2' }, // Duplicated for continuous effect
  ];

  return (
    <div className="w-full flex flex-col px-2 sm:px-3 md:px-8 lg:px-16">
      {/* Certification Section with Marquee */}
      <div className="w-full py-4 sm:py-6 md:py-8 bg-white">
        <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-center mb-4 sm:mb-6 md:mb-8">
          Certified And Recognized By Industry
        </h2>
        
        {/* Marquee for company logos */}
        <div className="relative overflow-hidden w-full">
          <div className="flex animate-marquee whitespace-nowrap">
            {companyLogos.map((logo) => (
              <div key={logo.id} className="mx-2 sm:mx-3 md:mx-4 flex-shrink-0">
                <img 
                  src={logo.src} 
                  alt={logo.alt} 
                  className="h-10 sm:h-12 md:h-16 lg:h-20 object-contain"
                />
              </div>
            ))}
            {/* Duplicate logos for continuous effect */}
            {companyLogos.map((logo) => (
              <div key={`dup-${logo.id}`} className="mx-2 sm:mx-3 md:mx-4 flex-shrink-0">
                <img 
                  src={logo.src} 
                  alt={logo.alt} 
                  className="h-10 sm:h-12 md:h-16 lg:h-20 object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Banner Section */}
      <div className="w-full relative ">
        <img 
          src={banner1} 
          alt="Waaree Solar Solutions" 
          className="w-full h-auto object-cover"
        />
        
      </div>
    </div>
  );
};

export default CertifiedAndBanner;