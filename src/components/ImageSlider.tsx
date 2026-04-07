// src/components/ImageSlider.tsx
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

type Props = {
  images: { src: string; alt?: string }[];
};

export default function ImageSlider({ images }: Props) {
  return (
    <Swiper
      modules={[Navigation, Pagination, Autoplay]}
      navigation
      pagination={{ clickable: true }}
      autoplay={{ delay: 3000 }}
      spaceBetween={16}
      slidesPerView={1}
    >
      {images.map((img, index) => (
        <SwiperSlide key={index}>
          <img
            src={img.src}
            alt={img.alt || `slide-${index}`}
            style={{
              width: "100%",
              borderRadius: "12px",
              display: "block",
            }}
          />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
