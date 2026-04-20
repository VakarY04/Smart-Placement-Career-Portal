import { Suspense, createElement, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, OrbitControls, Points, PointMaterial, Stars } from '@react-three/drei';
import { AdditiveBlending } from 'three';
import { motion as Motion, useInView } from 'framer-motion';
import { ArrowRight, BrainCircuit, FileSearch, GitBranch, Network, Sparkles, Zap } from 'lucide-react';
import { fadeInUp, staggerContainer } from '../motionVariants';

const glassSurface = 'border border-white/10 bg-white/5 backdrop-blur-[20px]';

const navItems = [
  { label: 'Hero', href: '#hero' },
  { label: 'My Journey', href: '#journey' },
  { label: 'Stats', href: '#stats' },
];

const featureStops = [
  {
    eyebrow: '01 / Gemini Parser',
    title: 'AI Resume Intelligence',
    body: 'Raw resume text becomes ATS scoring, skill extraction, and recruiter-ready recommendations in one continuous signal.',
    icon: FileSearch,
  },
  {
    eyebrow: '02 / Vector Match',
    title: 'Semantic Matching',
    body: 'Student skills snap into alignment with job roles using meaning-based matching instead of brittle keyword filters.',
    icon: Network,
  },
  {
    eyebrow: '03 / Groq Roadmap',
    title: 'Dynamic Roadmaps',
    body: 'A glowing path turns every skill gap into milestones, resources, and the next best placement action.',
    icon: GitBranch,
  },
];

const stats = [
  { value: 500, suffix: '+', label: 'Placements' },
  { value: 50, suffix: '+', label: 'Top Recruiters' },
  { value: 98, suffix: '%', label: 'AI Accuracy' },
];

function DataStreamBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden bg-slate-950">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_14%,rgba(6,182,212,0.18),transparent_28%),radial-gradient(circle_at_82%_28%,rgba(14,165,233,0.16),transparent_26%),linear-gradient(180deg,#020617_0%,#020617_50%,#030712_100%)]" />
      <svg className="absolute inset-0 h-full w-full opacity-45" preserveAspectRatio="none">
        <defs>
          <linearGradient id="streamLine" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#00f2ff" stopOpacity="0" />
            <stop offset="48%" stopColor="#00f2ff" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#00f2ff" stopOpacity="0" />
          </linearGradient>
        </defs>
        {Array.from({ length: 18 }).map((_, index) => {
          const x = 4 + index * 5.8;
          return (
            <Motion.path
              key={x}
              d={`M ${x} -10 C ${x + 5} 18, ${x - 6} 42, ${x + 2} 70 S ${x + 1} 112, ${x + 8} 130`}
              stroke="url(#streamLine)"
              strokeWidth="0.18"
              fill="none"
              initial={{ pathLength: 0, opacity: 0.12 }}
              animate={{ pathLength: [0.18, 0.96, 0.18], opacity: [0.15, 0.6, 0.15], y: ['-18%', '18%'] }}
              transition={{ duration: 7 + (index % 5), repeat: Infinity, ease: 'easeInOut', delay: index * 0.18 }}
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:radial-gradient(circle_at_center,black_42%,transparent_85%)]" />
    </div>
  );
}

function Navbar() {
  return (
    <Motion.header
      initial={{ opacity: 0, y: -18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      className="fixed left-0 right-0 top-0 z-50 px-4 py-4"
    >
      <nav className={`mx-auto flex max-w-7xl items-center justify-between rounded-full px-5 py-3 shadow-[0_20px_70px_rgba(0,0,0,0.3)] ${glassSurface}`}>
        <Link to="/" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-cyan-300/30 bg-cyan-500/10 text-cyan-200">
            <BrainCircuit className="h-5 w-5" />
          </span>
          <span className="hidden text-sm font-black uppercase tracking-[0.24em] text-white sm:block">
            Smart Placement
          </span>
        </Link>

        <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-slate-950/20 p-1 backdrop-blur-[20px] md:flex">
          {navItems.map((item, index) => (
            <Motion.a
              key={item.href}
              href={item.href}
              whileHover={{ y: [0, -5, 2, 0], x: index % 2 === 0 ? 4 : -4, scale: 1.04 }}
              transition={{ type: 'spring', stiffness: 180, damping: 12 }}
              className="rounded-full px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-white/10 hover:text-cyan-100"
            >
              {item.label}
            </Motion.a>
          ))}
        </div>

        <Motion.div
          animate={{ boxShadow: ['0 0 0px #00f2ff', '0 0 20px #00f2ff', '0 0 0px #00f2ff'] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          className="rounded-full"
        >
          <Link
            to="/auth"
            className="inline-flex rounded-full border border-cyan-300/30 bg-cyan-500/10 px-5 py-2 text-sm font-black text-cyan-50 backdrop-blur-[20px] hover:bg-cyan-400/20"
          >
            Login
          </Link>
        </Motion.div>
      </nav>
    </Motion.header>
  );
}

function makeSphere(count) {
  const positions = new Float32Array(count * 3);
  for (let index = 0; index < count; index += 1) {
    const phi = Math.acos(1 - 2 * (index / count));
    const theta = Math.PI * (1 + Math.sqrt(5)) * index;
    positions[index * 3] = Math.cos(theta) * Math.sin(phi) * 1.85;
    positions[index * 3 + 1] = Math.sin(theta) * Math.sin(phi) * 1.85;
    positions[index * 3 + 2] = Math.cos(phi) * 1.85;
  }
  return positions;
}

function makeCareerPath(count) {
  const positions = new Float32Array(count * 3);
  for (let index = 0; index < count; index += 1) {
    const t = index / count;
    const branch = index % 3;
    const angle = t * Math.PI * 8 + branch * 0.5;
    positions[index * 3] = Math.cos(angle) * (0.45 + t * 1.5) + (branch - 1) * 0.35;
    positions[index * 3 + 1] = (t - 0.5) * 3.8;
    positions[index * 3 + 2] = Math.sin(angle) * (0.45 + t * 1.5);
  }
  return positions;
}

function makeGraph(count) {
  const positions = new Float32Array(count * 3);
  for (let index = 0; index < count; index += 1) {
    const column = index % 12;
    const row = Math.floor(index / 12) % 32;
    const depth = Math.floor(index / 384);
    positions[index * 3] = (column - 5.5) * 0.32;
    positions[index * 3 + 1] = (row / 32) * (0.65 + (column % 5) * 0.38) - 1.45;
    positions[index * 3 + 2] = (depth - 1.2) * 0.55 + Math.sin(index) * 0.08;
  }
  return positions;
}

function MorphingHologram() {
  const pointsRef = useRef(null);
  const count = 960;
  const shapes = useMemo(() => [makeSphere(count), makeCareerPath(count), makeGraph(count)], []);
  const positions = useMemo(() => new Float32Array(shapes[0]), [shapes]);

  useFrame(({ clock }) => {
    if (!pointsRef.current) return;
    const elapsed = clock.getElapsedTime();
    const phase = Math.floor(elapsed / 4) % shapes.length;
    const next = (phase + 1) % shapes.length;
    const morph = (Math.sin((elapsed % 4) / 4 * Math.PI - Math.PI / 2) + 1) / 2;
    const array = pointsRef.current.geometry.attributes.position.array;

    for (let index = 0; index < array.length; index += 1) {
      array[index] = shapes[phase][index] * (1 - morph) + shapes[next][index] * morph;
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
    pointsRef.current.rotation.y = elapsed * 0.16;
    pointsRef.current.rotation.x = Math.sin(elapsed * 0.35) * 0.12;
  });

  return (
    <Float speed={1.6} rotationIntensity={0.4} floatIntensity={0.9}>
      <Points ref={pointsRef} positions={positions} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#22d3ee"
          size={0.035}
          sizeAttenuation
          depthWrite={false}
          blending={AdditiveBlending}
        />
      </Points>
    </Float>
  );
}

function HologramCanvas() {
  return (
    <div className={`relative h-[26rem] overflow-hidden rounded-[2rem] shadow-[0_40px_120px_rgba(6,182,212,0.16)] ${glassSurface}`}>
      <div className="absolute left-5 top-5 z-10 rounded-full border border-cyan-300/20 bg-slate-950/40 px-3 py-1 text-xs font-black uppercase tracking-[0.24em] text-cyan-100 backdrop-blur-[20px]">
        Morphing Career Graph
      </div>
      <Suspense fallback={<div className="flex h-full items-center justify-center text-cyan-200">Loading hologram...</div>}>
        <Canvas camera={{ position: [0, 0, 5.6], fov: 48 }} dpr={[1, 1.5]}>
          <color attach="background" args={['#020617']} />
          <Stars radius={40} depth={14} count={600} factor={2.2} saturation={0} fade speed={0.45} />
          <ambientLight intensity={0.6} />
          <pointLight position={[4, 4, 5]} intensity={3.5} color="#22d3ee" />
          <MorphingHologram />
          <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.45} />
        </Canvas>
      </Suspense>
    </div>
  );
}

function TextToBars() {
  const snippets = ['React', 'DSA', 'Python', 'Resume', 'Cloud', 'SQL'];
  return (
    <div className="relative min-h-56 overflow-hidden rounded-[1.5rem] border border-white/10 bg-slate-950/35 p-5 backdrop-blur-[20px]">
      {snippets.map((item, index) => (
        <Motion.span
          key={item}
          initial={{ x: -80, opacity: 0 }}
          whileInView={{ x: 130 + index * 13, opacity: [0, 1, 0.85] }}
          viewport={{ once: false, amount: 0.5 }}
          transition={{ duration: 2.1, repeat: Infinity, repeatDelay: 1.2, delay: index * 0.16 }}
          className="absolute left-4 rounded-full border border-cyan-300/20 bg-cyan-500/10 px-3 py-1 text-xs font-bold text-cyan-100"
          style={{ top: 22 + index * 24 }}
        >
          {item}
        </Motion.span>
      ))}
      <div className="absolute bottom-5 right-5 flex h-36 items-end gap-2">
        {[52, 86, 62, 110, 76, 125].map((height, index) => (
          <Motion.div
            key={height}
            initial={{ height: 6 }}
            whileInView={{ height }}
            viewport={{ once: false, amount: 0.6 }}
            transition={{ duration: 0.8, delay: index * 0.08, type: 'spring' }}
            className="w-6 rounded-t-xl bg-gradient-to-t from-cyan-600 to-cyan-200 shadow-[0_0_18px_rgba(34,211,238,0.35)]"
          />
        ))}
      </div>
    </div>
  );
}

function SemanticSnap() {
  const nodes = [
    ['Java', 'left-[8%] top-[18%]'],
    ['ML', 'left-[18%] top-[62%]'],
    ['Backend', 'left-[43%] top-[42%]'],
    ['SDE', 'right-[16%] top-[20%]'],
    ['Analyst', 'right-[8%] top-[66%]'],
  ];

  return (
    <div className="relative min-h-56 overflow-hidden rounded-[1.5rem] border border-white/10 bg-slate-950/35 p-5 backdrop-blur-[20px]">
      <svg className="absolute inset-0 h-full w-full">
        <Motion.path
          d="M 70 58 C 160 90, 210 118, 310 112 S 430 78, 520 58"
          stroke="#22d3ee"
          strokeWidth="1.4"
          fill="none"
          strokeDasharray="8 12"
          initial={{ pathLength: 0, opacity: 0.2 }}
          whileInView={{ pathLength: 1, opacity: 0.8 }}
          viewport={{ once: false, amount: 0.5 }}
          transition={{ duration: 1.1 }}
        />
        <Motion.path
          d="M 110 158 C 190 126, 260 116, 330 124 S 440 150, 535 166"
          stroke="#67e8f9"
          strokeWidth="1.4"
          fill="none"
          strokeDasharray="6 10"
          initial={{ pathLength: 0, opacity: 0.2 }}
          whileInView={{ pathLength: 1, opacity: 0.65 }}
          viewport={{ once: false, amount: 0.5 }}
          transition={{ duration: 1.2, delay: 0.2 }}
        />
      </svg>
      {nodes.map(([label, position], index) => (
        <Motion.div
          key={label}
          initial={{ scale: 0.7, opacity: 0, filter: 'blur(8px)' }}
          whileInView={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
          viewport={{ once: false, amount: 0.5 }}
          transition={{ type: 'spring', stiffness: 220, damping: 16, delay: index * 0.08 }}
          className={`absolute ${position} rounded-full border border-cyan-300/30 bg-cyan-500/10 px-4 py-2 text-sm font-black text-cyan-50 shadow-[0_0_20px_rgba(34,211,238,0.16)] backdrop-blur-[20px]`}
        >
          {label}
        </Motion.div>
      ))}
    </div>
  );
}

function RoadmapPath() {
  const milestones = [
    ['ATS', 'left-[11%] top-[62%]'],
    ['Skill Gap', 'left-[39%] top-[31%]'],
    ['Projects', 'left-[61%] top-[55%]'],
    ['Offer', 'right-[8%] top-[21%]'],
  ];

  return (
    <div className="relative min-h-56 overflow-hidden rounded-[1.5rem] border border-white/10 bg-slate-950/35 p-5 backdrop-blur-[20px]">
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 640 230" preserveAspectRatio="none">
        <Motion.path
          id="roadmapPath"
          d="M 58 152 C 168 156, 184 64, 286 72 S 378 176, 476 128 S 536 54, 596 62"
          stroke="rgba(34,211,238,0.55)"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: false, amount: 0.5 }}
          transition={{ duration: 1.5 }}
        />
        <Motion.circle
          r="7"
          fill="#67e8f9"
          filter="drop-shadow(0 0 12px #22d3ee)"
          initial={{ offsetDistance: '0%' }}
          whileInView={{ offsetDistance: '100%' }}
          viewport={{ once: false, amount: 0.5 }}
          transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
          style={{ offsetPath: 'path("M 58 152 C 168 156, 184 64, 286 72 S 378 176, 476 128 S 536 54, 596 62")' }}
        />
      </svg>
      {milestones.map(([label, position], index) => (
        <Motion.div
          key={label}
          whileInView={{ boxShadow: ['0 0 0 rgba(34,211,238,0)', '0 0 28px rgba(34,211,238,0.55)', '0 0 0 rgba(34,211,238,0)'] }}
          transition={{ duration: 1.7, repeat: Infinity, delay: index * 0.45 }}
          className={`absolute ${position} rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-black uppercase tracking-[0.16em] text-cyan-100 backdrop-blur-[20px]`}
        >
          {label}
        </Motion.div>
      ))}
    </div>
  );
}

function FeatureVisual({ index }) {
  if (index === 0) return <TextToBars />;
  if (index === 1) return <SemanticSnap />;
  return <RoadmapPath />;
}

function JourneySection() {
  return (
    <section id="journey" className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
      <Motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
        className={`relative overflow-hidden rounded-[2.5rem] p-6 shadow-[0_40px_120px_rgba(0,0,0,0.28)] sm:p-10 ${glassSurface}`}
      >
        <svg className="pointer-events-none absolute inset-0 hidden h-full w-full opacity-70 lg:block" preserveAspectRatio="none">
          <Motion.path
            d="M 80 118 C 260 280, 480 38, 650 210 S 940 360, 1110 138"
            stroke="rgba(34,211,238,0.42)"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 2.2, ease: 'easeInOut' }}
          />
        </svg>

        <Motion.div variants={fadeInUp} className="mb-16 max-w-3xl">
          <p className="text-sm font-black uppercase tracking-[0.32em] text-cyan-300">Individual Career Pathway</p>
          <h2 className="mt-4 text-4xl font-black text-white sm:text-6xl">One seamless journey from resume to offer.</h2>
          <p className="mt-5 text-lg leading-8 text-slate-300">
            No isolated steps. Each intelligence layer guides your progress, carrying your data from parsing to placement.
          </p>
        </Motion.div>

        <div className="space-y-16">
          {featureStops.map(({ eyebrow, title, body, icon: Icon }, index) => (
            <Motion.article
              key={title}
              variants={fadeInUp}
              className={`grid items-center gap-8 rounded-[2rem] p-5 lg:grid-cols-2 ${index % 2 === 1 ? 'lg:[&>*:first-child]:order-2' : ''}`}
            >
              <div>
                <div className="mb-5 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-cyan-200 backdrop-blur-[20px]">
                  {createElement(Icon, { className: 'h-4 w-4' })}
                  {eyebrow}
                </div>
                <h3 className="text-3xl font-black text-white sm:text-4xl">{title}</h3>
                <p className="mt-4 max-w-xl text-lg leading-8 text-slate-300">{body}</p>
              </div>
              <FeatureVisual index={index} />
            </Motion.article>
          ))}
        </div>
      </Motion.div>
    </section>
  );
}

function CountUp({ value, suffix, start }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start) return undefined;
    let frameId;
    const duration = 1400;
    const startedAt = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - startedAt) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      setCount(Math.round(value * eased));
      if (progress < 1) frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [start, value]);

  return `${count}${suffix}`;
}

function ParticleAssembly({ active }) {
  const dots = useMemo(
    () => Array.from({ length: 34 }, (_, index) => ({
      x: Math.sin(index * 1.8) * 96,
      y: Math.cos(index * 2.3) * 42,
      delay: index * 0.012,
    })),
    [],
  );

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      {dots.map((dot) => (
        <Motion.span
          key={`${dot.x}-${dot.y}`}
          className="absolute h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.85)]"
          initial={{ x: dot.x, y: dot.y, opacity: 0 }}
          animate={active ? { x: 0, y: 0, opacity: [0, 1, 0] } : { x: dot.x, y: dot.y, opacity: 0 }}
          transition={{ duration: 0.9, delay: dot.delay, ease: 'easeOut' }}
        />
      ))}
    </div>
  );
}

function StatsSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.35 });

  return (
    <section id="stats" ref={ref} className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
      <Motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.25 }}
        variants={staggerContainer}
        className={`rounded-[2.5rem] p-6 shadow-[0_40px_120px_rgba(6,182,212,0.11)] sm:p-10 ${glassSurface}`}
      >
        <Motion.div variants={fadeInUp} className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.32em] text-cyan-300">Coalescing Stats</p>
            <h2 className="mt-4 text-4xl font-black text-white sm:text-5xl">Proof assembled from motion.</h2>
          </div>
          <p className="max-w-xl text-slate-300">Numbers form from scattered particles as the placement engine comes into view.</p>
        </Motion.div>

        <div className="grid gap-5 md:grid-cols-3">
          {stats.map((stat) => (
            <Motion.div
              key={stat.label}
              variants={fadeInUp}
              className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/35 px-6 py-10 text-center backdrop-blur-[20px]"
            >
              <ParticleAssembly active={inView} />
              <div className="relative z-10 text-5xl font-black text-transparent sm:text-6xl [-webkit-text-stroke:1px_rgba(103,232,249,0.85)]">
                <CountUp value={stat.value} suffix={stat.suffix} start={inView} />
              </div>
              <div className="relative z-10 mt-3 text-sm font-black uppercase tracking-[0.26em] text-slate-300">{stat.label}</div>
            </Motion.div>
          ))}
        </div>
      </Motion.div>
    </section>
  );
}

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <DataStreamBackground />
      <Navbar />

      <main className="relative z-10">
        <section id="hero" className="mx-auto grid min-h-screen max-w-7xl items-center gap-14 px-6 pb-20 pt-32 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
          <Motion.div initial="hidden" animate="visible" variants={staggerContainer}>
            <Motion.div variants={fadeInUp} className={`mb-7 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.28em] text-cyan-100 ${glassSurface}`}>
              <Sparkles className="h-4 w-4" />
              Individual Career Pathway
            </Motion.div>

            <Motion.h1
              variants={fadeInUp}
              className="max-w-4xl bg-[linear-gradient(115deg,rgba(255,255,255,0.96),rgba(34,211,238,0.5),rgba(255,255,255,0.96)),repeating-linear-gradient(180deg,rgba(34,211,238,0.95)_0_2px,transparent_2px_13px)] bg-clip-text text-5xl font-black leading-[0.95] tracking-tight text-transparent sm:text-6xl lg:text-7xl"
            >
              AI-Driven Placements. Data-Backed Careers.
            </Motion.h1>

            <Motion.p variants={fadeInUp} className="mt-7 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
              Bridge the gap between your skills and your dream job with a personalized journey powered by Gemini and Groq.
            </Motion.p>

            <Motion.div variants={fadeInUp} className="mt-9 flex flex-col gap-4 sm:flex-row">
              <Link
                to="/auth"
                className="group inline-flex items-center justify-center gap-3 rounded-2xl bg-cyan-500 px-7 py-4 text-base font-black text-slate-950 shadow-[0_0_34px_rgba(6,182,212,0.35)] transition-transform hover:scale-[1.03] hover:bg-cyan-300"
              >
                Get Started
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1" />
              </Link>
              <a
                href="#journey"
                className={`inline-flex items-center justify-center rounded-2xl px-7 py-4 text-base font-bold text-cyan-50 hover:bg-white/10 ${glassSurface}`}
              >
                Explore Your Path
              </a>
            </Motion.div>
          </Motion.div>

          <Motion.div initial={{ opacity: 0, scale: 0.9, y: 28 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.8, ease: 'easeOut' }}>
            <HologramCanvas />
          </Motion.div>
        </section>

        <JourneySection />
        <StatsSection />

        <section id="future" className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <Motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.7 }}
            className={`relative overflow-hidden rounded-[2.5rem] p-8 text-center shadow-[0_40px_120px_rgba(6,182,212,0.12)] sm:p-12 ${glassSurface}`}
          >
            <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/80 to-transparent" />
            <Zap className="mx-auto mb-5 h-10 w-10 text-cyan-300" />
            <h2 className="text-3xl font-black text-white sm:text-5xl">Turn your path into a signed offer.</h2>
            <p className="mx-auto mt-5 max-w-2xl text-slate-300">
              Start with one AI resume scan, then let your career path guide matching, gaps, roadmaps, and recruiter readiness.
            </p>
            <Link
              to="/auth"
              className="mt-8 inline-flex items-center justify-center gap-3 rounded-2xl bg-cyan-500 px-7 py-4 font-black text-slate-950 shadow-[0_0_34px_rgba(6,182,212,0.32)] transition-transform hover:scale-[1.03] hover:bg-cyan-300"
            >
              Get Started
              <ArrowRight className="h-5 w-5" />
            </Link>
          </Motion.div>
        </section>
      </main>

      <footer className={`relative z-10 mx-4 mb-4 rounded-[2rem] px-6 py-8 ${glassSurface}`}>
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-sm text-slate-400 sm:flex-row">
          <p className="font-bold text-slate-200">Built for Future Engineers</p>
          <div className="flex items-center gap-5">
            <a href="#journey" className="hover:text-cyan-100">My Journey</a>
            <Link to="/auth" className="hover:text-cyan-100">Auth</Link>
            <Link to="/login?role=admin" className="hover:text-cyan-100">Admin</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
