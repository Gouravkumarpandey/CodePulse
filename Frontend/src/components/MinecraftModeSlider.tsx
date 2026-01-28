import React, { useState, useEffect, useRef } from 'react';

// Example slides (replace with your own images/text as needed)
const slides = [
  {
    image: '/assets/scroll1.png',
    title: 'CREATIVE MODE',
    description:
      'Set your imagination free with limitless resources, immunity to damage, and the ability to fly! In Creative mode, nothing stands in the way of the perfect build.',
  },
  {
    image: '/assets/scroll2.png',
    title: 'SURVIVAL MODE',
    description:
      'Follow the rules and regulation commit on time to get consistent and make this enjoy the development journey',
  },
];


export default function MinecraftModeSlider() {
  const [index, setIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const slide = slides[index];

  const prev = () => setIndex((i) => (i === 0 ? slides.length - 1 : i - 1));
  const next = () => setIndex((i) => (i === slides.length - 1 ? 0 : i + 1));

  // Auto-scroll effect
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setIndex((i) => (i === slides.length - 1 ? 0 : i + 1));
    }, 4000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div className="w-full bg-[#111] py-12 md:py-16 lg:py-20 flex items-center justify-center overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16">

          {/* Frame and Image Container */}
          <div className="relative w-full sm:max-w-[95vw] md:max-w-[600px] lg:max-w-[700px] xl:max-w-[900px] aspect-video flex-shrink-0">
            {/* Slide Image (Behind Frame) */}
            <img
              src={slide.image}
              alt={slide.title}
              className="absolute top-[2%] left-[2%] w-[96%] h-[96%] object-cover z-[1] rounded-[4px]"
            />

            {/* Minecraft Frame Overlay */}
            <img
              src="https://www.minecraft.net/content/dam/minecraftnet/games/minecraft/key-art/OV_PMP_GameModeCarousel_Frame_Slide1_Tablet1.png"
              alt="Minecraft Frame"
              className="absolute top-0 left-0 w-full h-full z-10 pointer-events-none"
            />
          </div>

          {/* Text content */}
          <div className="text-white max-w-full sm:max-w-md lg:max-w-lg text-center lg:text-left px-4">
            <h2
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold uppercase mb-4 sm:mb-6 tracking-wide"
              style={{
                fontFamily: 'Minecraftia, sans-serif',
                textShadow: '2px 2px 0 #000, 4px 4px 0 #222',
              }}
            >
              {slide.title}
            </h2>

            <p className="text-base sm:text-lg md:text-xl lg:text-2xl leading-relaxed mb-6 sm:mb-8 lg:mb-10">
              {slide.description}
            </p>

            {/* Navigation Buttons */}
            <div className="flex justify-center lg:justify-start items-center gap-6 sm:gap-8 md:gap-12">
              <button
                aria-label="Previous"
                onClick={prev}
                className="bg-transparent border-none text-white text-3xl sm:text-4xl md:text-5xl cursor-pointer select-none hover:opacity-70 transition-opacity active:scale-95"
                style={{ fontFamily: 'Minecraftia, sans-serif' }}
              >
                &#8592;
              </button>
              <button
                aria-label="Next"
                onClick={next}
                className="bg-transparent border-none text-white text-3xl sm:text-4xl md:text-5xl cursor-pointer select-none hover:opacity-70 transition-opacity active:scale-95"
                style={{ fontFamily: 'Minecraftia, sans-serif' }}
              >
                &#8594;
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
