# boardly landing page (React + Vite)

    npm install
    npm run dev      # http://localhost:5173
    npm run build    # production build in dist/

Stack: React 18, Vite, Three.js (hero backdrop + floating cards), GSAP (intro), Lenis (smooth scroll).

    src/lib/ticker.js      one shared requestAnimationFrame loop
    src/lib/scroll.js      Lenis + shared scroll/mouse state (S)
    src/components/HeroScene.jsx   WebGL glow + 3D cards (chaos to order on scroll)
    src/components/Hero.jsx        loader, headline, intro timeline
    src/components/Features.jsx    feature list with cursor-following previews
    src/components/Play.jsx        draggable board (HTML/CSS, no WebGL)
    src/styles.css                 all styles, copied from the prototype
