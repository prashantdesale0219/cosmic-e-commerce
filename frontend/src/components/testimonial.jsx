import React, { useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay, EffectCoverflow } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-coverflow';

const Testimonial = () => {
  const testimonials = [
    {
      id: 1,
      name: 'Rick Verma',
      text: 'Being a researcher in PV solar cell technology, I found Waverc Solar panels are working in accordance with the specifications. The performance of the solar modules is outstanding. I conducted a series of tests on the panels over a period of 6 months and found that they consistently performed better than other brands. I highly recommend everyone to buy Waverc solar panels for betterment of climate and country.',
      rating: 5,
    },
    {
      id: 2,
      name: 'Mukul Kumar',
      text: 'Recently I bought Waverc Solar panels and I received them in good condition without any damages or any delay. Waverc representative Mani Priya was doing great job and support on my purchase from booking to the installation. She was very responsive and provided me with regular updates on time. I really appreciate the whole team of Waverc. Thanks all.',
      rating: 5,
    },
    {
      id: 3,
      name: 'Vishnu P',
      text: 'Very good and reliable product. Later to my site getting, I had Waverc Solar provide for the installation. The installation was completed smoothly through their service. Waverc helped to coordinate with the local electricity board for the net metering and they provided me other information for a fast, convenient all good.',
      rating: 5,
    },
  ];

  useEffect(() => {
    // Add custom CSS for blur effect
    const style = document.createElement('style');
    style.textContent = `
      .swiper-slide {
        transition: all 0.3s ease;
        filter: blur(2px);
        opacity: 0.7;
        transform: scale(0.9);
      }
      .swiper-slide-active {
        filter: blur(0);
        opacity: 1;
        transform: scale(1);
      }
      .testimonial-pagination .swiper-pagination-bullet {
        width: 8px;
        height: 8px;
        background: #ccc;
        opacity: 0.5;
        margin: 0 5px;
      }
      .testimonial-pagination .swiper-pagination-bullet-active {
        opacity: 1;
        background: #333;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const renderStars = (rating) => {
    return Array(rating)
      .fill()
      .map((_, i) => (
        <svg
          key={i}
          className="w-5 h-5 text-yellow-400 inline-block"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
        </svg>
      ));
  };

  return (
    <div className="py-12 px-4 bg-white">
      <h2 className="text-3xl font-bold text-center mb-10">User Stories</h2>
      
      <div className="max-w-6xl mx-auto relative">
        <Swiper
          modules={[Pagination, Autoplay, EffectCoverflow]}
          effect="coverflow"
          coverflowEffect={{
            rotate: 0,
            stretch: 0,
            depth: 100,
            modifier: 1.5,
            slideShadows: false,
          }}
          slidesPerView={3}
          centeredSlides={true}
          initialSlide={1}
          loop={false}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
          }}
          pagination={true}
          breakpoints={{
            320: {
              slidesPerView: 1,
            },
            640: {
              slidesPerView: 2,
            },
            768: {
              slidesPerView: 3,
            },
          }}
          className="testimonial-swiper mb-10"
        >
          {testimonials.map((testimonial) => (
            <SwiperSlide key={testimonial.id}>
              <div 
                className={`p-6 rounded-lg h-full flex flex-col ${
                  testimonial.id === 2 
                    ? 'bg-main text-white' 
                    : 'bg-gray-100 text-gray-800'
                }`}
                style={{ minHeight: '280px' }}
              >
                <div className="flex-grow">
                  <p className="text-sm mb-4">"{testimonial.text}"</p>
                </div>
                <div className="mt-4">
                  <div className="mb-2">{renderStars(testimonial.rating)}</div>
                  <p className="text-right font-medium">-By {testimonial.name}</p>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
        
        <div className="flex items-center justify-center mt-4 space-x-4">
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((_, index) => (
              <span 
                key={index} 
                className={`inline-block w-2 h-2 rounded-full ${index === 1 ? 'bg-gray-800' : 'bg-gray-300'}`}
                onClick={() => {
                  const swiper = document.querySelector('.testimonial-swiper').swiper;
                  swiper.slideTo(index);
                }}
              ></span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Testimonial;