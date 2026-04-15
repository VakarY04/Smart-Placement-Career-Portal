import { createElement, useState } from 'react';
import { motion as Motion } from 'framer-motion';

export function MagneticButton({
  children,
  className = '',
  as: Tag = 'button',
  strength = 18,
  ...props
}) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const handleMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;
    setOffset({
      x: (x / rect.width) * strength,
      y: (y / rect.height) * strength,
    });
  };

  const handleLeave = () => setOffset({ x: 0, y: 0 });

  return (
    <Motion.div
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      animate={{ x: offset.x, y: offset.y }}
      transition={{ type: 'spring', stiffness: 260, damping: 18, mass: 0.5 }}
      className="inline-flex"
    >
      {createElement(Tag, { className, ...props }, children)}
    </Motion.div>
  );
}

export function TiltCard({ children, className = '', glow = false, ...props }) {
  const [rotation, setRotation] = useState({ x: 0, y: 0 });

  const handleMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 14;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * -14;
    setRotation({ x: y, y: x });
  };

  return (
    <Motion.div
      onMouseMove={handleMove}
      onMouseLeave={() => setRotation({ x: 0, y: 0 })}
      animate={{ rotateX: rotation.x, rotateY: rotation.y }}
      transition={{ type: 'spring', stiffness: 180, damping: 18 }}
      style={{ transformStyle: 'preserve-3d' }}
      className={`${glow ? 'cyber-card-glow' : ''} ${className}`}
      {...props}
    >
      {children}
    </Motion.div>
  );
}

export function CyberSkeleton({ className = '' }) {
  return <div className={`cyber-skeleton ${className}`} />;
}
