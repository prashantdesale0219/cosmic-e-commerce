import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Header = () => {

  return (
    <header className="w-full">
      {/* Notification Banner */}
      <div style={{backgroundColor: 'var(--main-color)'}} className="text-black font-bold text-xs sm:text-sm md:text-base py-2 px-4 text-center relative overflow-hidden">
        <div className="animate-marquee whitespace-nowrap">
          Due To Severe Weather Conditions In Certain Regions, There May Be Disruptions In Delivery Services. We Appreciate Your Understanding And Patience During This Time.
        </div>
      </div>
    </header>
    

  );
};

export default Header;