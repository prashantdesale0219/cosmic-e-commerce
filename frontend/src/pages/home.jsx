import React from 'react';
import HeroSlider from '../components/home/heroslider';
import MostLoved from '../components/home/mostLoved';
import PowerSolutions from '../components/home/powerSolutions';
import WhySwitchingToSolar from '../components/home/whyswitchingtosolar';
import CosmicEnergies from '../components/home/cosmicenergies';
import KnowYourNeed from '../components/home/knowyourneed';
import SolarConsiderations from '../components/home/SolarConsiderations';
import Testimonial from '../components/home/testimonial';

const Home = () => {
  return (
    <div>
      <HeroSlider/>
      <MostLoved/>
      <PowerSolutions/>
      <WhySwitchingToSolar/>
      <CosmicEnergies/>
      <KnowYourNeed/>
      <SolarConsiderations/>
      <Testimonial/>
    </div>
  );
};

export default Home;