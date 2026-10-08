import React, { useEffect, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseAlpha: number;
  pulsePhase: number;
}

export const LiveBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Mouse tracking for subtle interactive attraction
    const mouse = { x: -1000, y: -1000, targetRadius: 140 };
    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    // Generate clinical network particles
    const particleCount = Math.min(Math.floor((width * height) / 18000), 45);
    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        radius: Math.random() * 2 + 1.5,
        baseAlpha: Math.random() * 0.4 + 0.25,
        pulsePhase: Math.random() * Math.PI * 2,
      });
    }

    let time = 0;

    const render = () => {
      time += 0.02;
      ctx.clearRect(0, 0, width, height);

      const isDark = theme === 'dark' || document.documentElement.classList.contains('dark');
      const nodeColor = isDark ? '56, 189, 248' : '2, 132, 199'; // Sky / Brand blue
      const lineColor = isDark ? '45, 212, 191' : '13, 148, 136'; // Teal brand

      // Update and draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Move
        p.x += p.vx;
        p.y += p.vy;

        // Bounce on boundaries
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        // Subtle mouse repulsion/drift
        const dxm = mouse.x - p.x;
        const dym = mouse.y - p.y;
        const distMouse = Math.sqrt(dxm * dxm + dym * dym);
        if (distMouse < mouse.targetRadius) {
          const force = (1 - distMouse / mouse.targetRadius) * 0.02;
          p.x -= dxm * force;
          p.y -= dym * force;
        }

        // Pulse size
        const currentRadius = p.radius + Math.sin(time + p.pulsePhase) * 0.5;

        // Draw node
        ctx.beginPath();
        ctx.arc(p.x, p.y, currentRadius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${nodeColor}, ${p.baseAlpha})`;
        ctx.fill();

        // Connect nearby nodes with faint medical synaptic lines
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = 130;

          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * (isDark ? 0.22 : 0.15);
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(${lineColor}, ${alpha})`;
            ctx.lineWidth = 0.85;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [theme]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Subtle Medical Grid Mesh */}
      <div
        className="absolute inset-0 opacity-[0.4] dark:opacity-[0.25]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(14, 165, 233, 0.06) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(14, 165, 233, 0.06) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />

      {/* Floating Ambient Glowing Orbs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-brand-400/20 dark:bg-brand-600/15 blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="absolute top-1/3 -right-24 w-80 h-80 rounded-full bg-tealbrand-400/20 dark:bg-tealbrand-500/15 blur-3xl animate-pulse" style={{ animationDuration: '10s' }} />
      <div className="absolute -bottom-24 left-1/4 w-96 h-96 rounded-full bg-indigo-400/15 dark:bg-indigo-600/10 blur-3xl animate-pulse" style={{ animationDuration: '12s' }} />

      {/* Interactive Canvas Nodes */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Subtle Horizon Lifeline / Heartbeat Wave SVG */}
      <div className="absolute bottom-12 left-0 right-0 h-16 opacity-30 dark:opacity-25 pointer-events-none overflow-hidden">
        <svg
          viewBox="0 0 1200 60"
          preserveAspectRatio="none"
          className="w-full h-full text-brand-500 dark:text-brand-400"
        >
          <path
            d="M 0 30 L 300 30 L 320 15 L 330 45 L 340 5 L 350 50 L 360 30 L 700 30 L 720 10 L 730 48 L 740 8 L 750 52 L 760 30 L 1200 30"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeDasharray="1200"
            strokeDashoffset="0"
          >
            <animate
              attributeName="stroke-dashoffset"
              values="1200; 0"
              dur="6s"
              repeatCount="indefinite"
            />
          </path>
        </svg>
      </div>
    </div>
  );
};

export default LiveBackground;
