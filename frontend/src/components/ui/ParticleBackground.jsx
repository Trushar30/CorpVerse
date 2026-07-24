import { useEffect, useRef } from 'react';

export default function ParticleBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const particleCount = 40;

    // Cozy palette for particles
    const colors = ['#E8B86D', '#A8C5A0', '#C8A8E1', '#8FB8D6', '#F4E4C1'];

    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() > 0.5 ? 4 : 6, // larger "pixel" size
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: (Math.random() - 0.5) * 0.15, // slower
      vy: (Math.random() - 0.5) * 0.15,
      alpha: Math.random() * 0.4 + 0.1, // softer alpha
      type: Math.floor(Math.random() * 3), // 0: square, 1: plus, 2: small square
    }));

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < -10) p.x = canvas.width + 10;
        if (p.x > canvas.width + 10) p.x = -10;
        if (p.y < -10) p.y = canvas.height + 10;
        if (p.y > canvas.height + 10) p.y = -10;

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;

        if (p.type === 0) {
            // Standard pixel square
            ctx.fillRect(Math.floor(p.x), Math.floor(p.y), p.size, p.size);
        } else if (p.type === 1) {
            // Small plus shape (star-ish)
            const s = Math.max(2, p.size - 2);
            ctx.fillRect(Math.floor(p.x) + s, Math.floor(p.y), s, s*3);
            ctx.fillRect(Math.floor(p.x), Math.floor(p.y) + s, s*3, s);
        } else {
            // Tiny spec
            ctx.fillRect(Math.floor(p.x), Math.floor(p.y), p.size/2, p.size/2);
        }

        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 bg-cozy-texture">
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          style={{ opacity: 0.8 }}
        />
    </div>
  );
}
