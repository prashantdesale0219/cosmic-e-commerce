import React from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, EffectFade } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

// Import hero slider images
import heroslider1 from '../../assets/images/heroslider1.webp';
import heroslider2 from '../../assets/images/heroslider2.jpg';
import heroslider3 from '../../assets/images/heroslider3.jpg';
import heroslider4 from '../../assets/images/heroslider4.webp';

// Slider data with links
const sliderData = [
  {
    id: 1,
    image: heroslider1,
    alt: "Solar panels on house roof",
    link: "/category/solar-module"
  },
  {
    id: 2,
    image: heroslider2,
    alt: "Solar installation",
    link: "/category/solar-inverter"
  },
  {
    id: 3,
    image: heroslider3,
    alt: "Solar energy system",
    link: "/category/li-ion-battery"
  },
  {
    id: 4,
    image: heroslider4,
    alt: "Solar installation on house",
    link: "/products"
  }
];

const HeroSlider = () => {
  return (
    <div className="w-full relative flex justify-center">
      <div className="w-full md:w-[90%] mx-auto">
      <Swiper
        modules={[Autoplay, Pagination, EffectFade]}
        effect="fade"
        spaceBetween={0}
        slidesPerView={1}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
          renderBullet: function (index, className) {
            return '<span class="' + className + ' custom-bullet"></span>';
          },
        }}
        navigation={false}
        className="h-[300px] sm:h-[400px] md:h-[450px] lg:h-[500px] xl:h-[550px] overflow-hidden"
      >
        {sliderData.map((slide, index) => (
          <SwiperSlide key={index} className="relative">
            <Link to={slide.link} className="block w-full h-full cursor-pointer">
              <img
                src={slide.image}
                alt={slide.alt}
                className="w-full h-full object-cover"
              />
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
      </div>
      
      {/* Custom pagination styles */}
      <style>{`
        .swiper-pagination-bullet {
          width: 12px;
          height: 12px;
          background: white;
          opacity: 0.5;
        }
        .swiper-pagination-bullet-active {
          opacity: 1;
          background: var(--main-color);
        }
      `}</style>
    </div>
  );
};

export default HeroSlider;