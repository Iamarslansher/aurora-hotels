import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getRoomImages } from '../../utils/roomImages';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80';

export const RoomImageCarousel = ({ images, alt, className = '' }) => {
  const imageList = getRoomImages(images);
  const carouselImages = imageList.length > 0 ? imageList : [FALLBACK_IMAGE];
  const [activeIndex, setActiveIndex] = useState(0);

  const showImage = (index) => {
    setActiveIndex((index + carouselImages.length) % carouselImages.length);
  };

  return (
    <div className={`relative h-full w-full overflow-hidden ${className}`}>
      <img
        src={carouselImages[activeIndex]}
        alt={alt}
        className="h-full w-full object-cover transition-transform duration-700 ease-out"
      />
      {carouselImages.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Show previous room photo"
            onClick={() => showImage(activeIndex - 1)}
            className="absolute left-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-gold-400/50 bg-navy-950/75 text-ivory shadow-md backdrop-blur-sm transition-colors hover:bg-navy-900"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Show next room photo"
            onClick={() => showImage(activeIndex + 1)}
            className="absolute right-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-gold-400/50 bg-navy-950/75 text-ivory shadow-md backdrop-blur-sm transition-colors hover:bg-navy-900"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-navy-950/70 px-2.5 py-1.5 backdrop-blur-sm">
            {carouselImages.map((image, index) => (
              <button
                key={`${image}-${index}`}
                type="button"
                aria-label={`Show room photo ${index + 1}`}
                aria-current={index === activeIndex}
                onClick={() => showImage(index)}
                className={`h-2 rounded-full transition-all ${
                  index === activeIndex ? 'w-5 bg-gold-400' : 'w-2 bg-ivory/70 hover:bg-ivory'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
