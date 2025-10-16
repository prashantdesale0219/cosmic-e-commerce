import React, { useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const Testimonial = () => {
  const testimonials = [
    {
      id: 1,
      name: 'Rick Verma',
      text: 'Being a researcher in PV solar cell technology, I found Cosmic PowerTech\'s products of highest quality. Looking for solar panels for my home, I was impressed by the performance of the solar modules in maintaining a steady flow of power. I had a great experience with Cosmic PowerTech\'s team. They were very professional and helpful. I highly recommend everyone to buy Cosmic PowerTech solar panels for betterment of climate and society.',
      rating: 5,
    },
    {
      id: 2,
      name: 'Mukul Kumar',
      text: 'Recently I bought Cosmic PowerTech Solar panels and I received them in good condition without any damages or any delay. Cosmic PowerTech representative Mani Priya was doing great job and support on my purchase from booking to the delivery. She was very responsive and provided me with all the necessary updates on time. I really appreciate the whole team of Cosmic PowerTech. Thanks all.',
      rating: 5,
    },
    {
      id: 3,
      name: 'Vishnu P',
      text: 'Very good and reliable product. Later to my site getting, I had received a mail providing the link through their service. Cosmic PowerTech has been very supportive through their service. Would highly recommend their products and would like to order more in the future for other locations for a long, economical and good.',
      rating: 5,
    }
  ];

  return (
    <div className="bg-white py-12 px-6 md:px-8 lg:px-10">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8">User Stories</h2>
        
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={20}
          slidesPerView={1}
          centeredSlides={true}
          loop={false}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
          }}
          pagination={{
            clickable: true,
            el: '.swiper-pagination',
            bulletClass: 'swiper-pagination-bullet',
            bulletActiveClass: 'swiper-pagination-bullet-active',
          }}
          navigation={false}
          breakpoints={{
            480: {
              slidesPerView: 1,
              spaceBetween: 10,
            },
            640: {
              slidesPerView: 1,
              spaceBetween: 15,
            },
            768: {
              slidesPerView: 2,
              spaceBetween: 20,
            },
            1024: {
              slidesPerView: 3,
              spaceBetween: 30,
            },
          }}
          className="testimonial-swiper"
        >
          {testimonials.map((testimonial) => (
            <SwiperSlide key={testimonial.id}>
              <div className="bg-white rounded-lg shadow-lg overflow-hidden h-full flex flex-col">
                <div className={`p-3 sm:p-4 md:p-6 ${testimonial.id === 2 ? 'bg-main text-white' : 'bg-gray-100'}`}>
                  <p className="text-xs sm:text-sm mb-2 sm:mb-3 md:mb-4">
                    "{testimonial.text}"
                  </p>
                  <div className="flex items-center mt-2 sm:mt-3 md:mt-4">
                    <div className="flex">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                </div>
                <div className={`px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 mt-auto ${testimonial.id === 2 ? 'bg-main text-white' : 'bg-gray-100'}`}>
                  <p className="text-right text-xs sm:text-sm font-medium">-By {testimonial.name}</p>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
        
        {/* Custom Pagination */}
        <div className="flex justify-center mt-8 items-center">
          <div className="swiper-pagination mx-4 flex space-x-2"></div>
        </div>
      </div>
      
      <style>{`
        .swiper-pagination-bullet {
          width: 10px;
          height: 10px;
          background-color: #ccc;
          opacity: 1;
          border-radius: 50%;
          display: inline-block;
          margin: 0 4px;
          cursor: pointer;
        }
        
        .swiper-pagination-bullet-active {
          background-color: var(--main-color); /* main-color */
        }
        
        .swiper-button-next:after,
        .swiper-button-prev:after {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default Testimonial;