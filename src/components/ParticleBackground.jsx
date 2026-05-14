import React from 'react';
import './ParticleBackground.css';

/** CSS-only backdrop (no WebGL) — avoids white screen from R3F / Three crashes */
const ParticleBackground = () => <div className="particle-backdrop" aria-hidden />;

export default ParticleBackground;
