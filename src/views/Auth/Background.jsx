import React, { useEffect, useMemo, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

const Background = () => {
  const [init, setInit] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  const particlesLoaded = (container) => {
    // console.log(container);
  };

  const options = useMemo(
    () => ({
      background: {
        color: {
          value: "#fff",
          opacity: 0.5,
        },
      },
      fpsLimit: 150,
      interactivity: {
        events: {
          onClick: {
            enable: true,
            mode: "push",
          },
          onHover: {
            enable: true,
            mode: "slow",
          },
          resize: {
            delay: 0.5,
            enable: true,
          },
        },
        modes: {
          push: {
            quantity: 4,
          },
          slow: {
            distance: 50,
          },
        },
      },
      particles: {
        color: {
          value: "#00f",
        },
        links: {
          color: "#00f",
          distance: 150,
          enable: true,
          opacity: 0.8,
          width: 1,
        },
        move: {
          direction: "none",
          drift: 0,
          enable: true,
          outModes: {
            default: "bounce",
          },
          random: false,
          speed: 15,
          straight: false,
        },
        number: {
          density: {
            enable: true,
          },
          value: 200,
        },
        opacity: {
          value: 0.7,
        },
        shape: {
          type: ["circle", "image"],
          image: [
            {
              src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg",
              width: 20,
              height: 20,
            },
          ],
        },
        size: {
          value: { min: 1, max: 5 },
        },
      },
      detectRetina: true,
      zLayers: 1,
      style: {},
    }),
    []
  );

  // Yangi: background image uchun style
  const bgStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    zIndex: -1,
    backgroundImage:
      "url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1500&q=80')", // o'zingiz xohlagan rasm url sini yozing
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
  };

  if (init) {
    return (
      <div style={bgStyle}>
        <Particles
          id="tsparticles"
          particlesLoaded={particlesLoaded}
          options={options}
        />
      </div>
    );
  }
};

export default Background;