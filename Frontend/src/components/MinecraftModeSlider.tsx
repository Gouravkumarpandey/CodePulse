import React, { useState, useEffect, useRef } from 'react';

// Example slides (replace with your own images/text as needed)
const slides = [
  {
    image: 'https://www.minecraft.net/content/dam/minecraftnet/games/minecraft/key-art/OV_PMP_GameModeCarousel_Art_Slide1_Desktop1.png',
    title: 'CREATIVE MODE',
    description:
      'Set your imagination free with limitless resources, immunity to damage, and the ability to fly! In Creative mode, nothing stands in the way of the perfect build.',
  },
  {
    image: 'https://www.minecraft.net/content/dam/minecraftnet/games/minecraft/key-art/OV_PMP_GameModeCarousel_Art_Slide2_Desktop1.png',
    title: 'SURVIVAL MODE',
    description:
      'Follow the rules and regulation commit on time to get consistent and make this enjoy the development journey',
  },
  {
    image: 'scrolling.png',
    title: 'LEGENDS MODE',
    description:
      'Explore the world of Minecraft Legends! Build, defend, and lead your allies to victory in a vibrant, living world.',
  },
];

const pixelMask =
  'M0 0h1200v16H0zm0 16h75v16H0zm150 0h75v16h-75zm150 0h75v16h-75zm150 0h75v16h-75zm150 0h75v16h-75zm150 0h75v16h-75zm150 0h75v16h-75zm150 0h75v16h-75z';


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
    }, 4000); // 4 seconds
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#111',
        padding: '2rem 0',
        minHeight: '100vh',
      }}
    >
      {/* Pixelated image with SVG mask */}
      <div style={{ position: 'relative', width: '900px', height: '540px', marginRight: 64 }}>
        <svg width={900} height={540} style={{ position: 'absolute', top: 0, left: 0, zIndex: 2 }}>
          <defs>
            <clipPath id="pixelMask">
              <path d={pixelMask} />
              <rect x="0" y="32" width="1800" height="508" />
            </clipPath>
          </defs>
          <image
            href={slide.image}
            width={900}
            height={540}
            style={{ clipPath: 'url(#pixelMask)' }}
            preserveAspectRatio="none"
          />
        </svg>
        {/* fallback for browsers without SVG mask support */}
        <img
          src={slide.image}
          alt={slide.title}
          width={900}
          height={540}
          style={{
            objectFit: 'fill',
            borderRadius: 0,
            display: 'block',
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 1,
          }}
        />
        {/* Minecraft frame overlay */}
        <img
          src="https://www.minecraft.net/content/dam/minecraftnet/games/minecraft/key-art/OV_PMP_GameModeCarousel_Frame_Slide1_Tablet1.png"
          alt="Minecraft Frame"
          width={900}
          height={540}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: 900,
            height: 540,
            zIndex: 3,
            pointerEvents: 'none',
          }}
        />
      </div>
      {/* Text content */}
      <div style={{ color: 'white', maxWidth: 520, textAlign: 'center' }}>
        <h2
          style={{
            fontFamily: 'Minecraftia, sans-serif',
            fontSize: 64,
            textTransform: 'uppercase',
            marginBottom: 32,
            letterSpacing: '0.04em',
            textShadow: '2px 2px 0 #000, 4px 4px 0 #222',
          }}
        >
          {slide.title}
        </h2>
        <p style={{ fontSize: 28, lineHeight: 1.5, marginBottom: 40 }}>{slide.description}</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 48 }}>
          <button
            aria-label="Previous"
            onClick={prev}
            style={{
              background: 'none',
              border: 'none',
              color: 'white',
              fontSize: 48,
              cursor: 'pointer',
              fontFamily: 'Minecraftia, sans-serif',
              userSelect: 'none',
            }}
          >
            &#8592;
          </button>
          <button
            aria-label="Next"
            onClick={next}
            style={{
              background: 'none',
              border: 'none',
              color: 'white',
              fontSize: 48,
              cursor: 'pointer',
              fontFamily: 'Minecraftia, sans-serif',
              userSelect: 'none',
            }}
          >
            &#8594;
          </button>
        </div>
      </div>
    </div>
  );
}
