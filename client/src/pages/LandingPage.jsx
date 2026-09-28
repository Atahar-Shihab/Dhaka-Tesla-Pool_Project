/**
 * LandingPage.jsx
 * Professional, long-form landing page with GSAP animations.
 * Features:
 * - High-speed animated Dhaka "Tesla" battery rickshaw (Bullet)
 * - Interactive Live Fare Preview Widget
 * - Dhaka Rush-Hour Corridor Route Visualization
 * - "The Banani Story" Character Showcase (Jashim, Nusrat, Rafiq, Shirin)
 * - Cost Comparison Matrix (Tesla Pool vs CNG vs Ride Share)
 * - Vehicle Engineering Anatomy (The 3-Wheeled Battery Rocket)
 * - Production Engineering Highlights (PostgreSQL Row Locking & Concurrency)
 * - Interactive FAQ & Dhaka Commuter Testimonials
 */
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Zap,
  Users,
  MapPin,
  Shield,
  ArrowRight,
  DollarSign,
  Clock,
  CheckCircle2,
  ChevronDown,
  Sparkles,
  AlertCircle,
  BatteryCharging,
  Gauge,
  Compass,
  Award,
  Layers,
  Car,
  Lock
} from 'lucide-react';
import gsap from 'gsap';

const LandingPage = () => {
  // GSAP animation refs
  const heroRef = useRef(null);
  const teslaRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const ctaRef = useRef(null);
  const glowRef = useRef(null);

  // Interactive Live Fare Estimator state
  const [pickup, setPickup] = useState('Banani');
  const [dropoff, setDropoff] = useState('Mohakhali');
  const [isPooled, setIsPooled] = useState(true);

  // FAQ accordion state
  const [openFaq, setOpenFaq] = useState(null);

  // Hero Media Mode: 'video' | 'photo' (default to video of the moving car)
  const [mediaMode, setMediaMode] = useState('video');

  // Predefined Dhaka zones with approx distance in km from Banani
  const zoneDistances = {
    'Banani-Mohakhali': 2.5,
    'Banani-Gulshan 1': 2.0,
    'Banani-Gulshan 2': 1.2,
    'Banani-Dhanmondi': 7.5,
    'Banani-Mirpur': 6.0,
    'Banani-Uttara': 8.5,
    'Banani-Farmgate': 4.5,
    'Banani-Bashundhara': 5.0,
    'Banani-Tejgaon': 3.5,
  };

  // Live Fare Formula: baseFare (৳30) + distance * rate (৳15/km) - 20% discount
  const getRouteDistance = () => {
    if (pickup === dropoff) return 0.5;
    const key = `${pickup}-${dropoff}`;
    const reverseKey = `${dropoff}-${pickup}`;
    return zoneDistances[key] || zoneDistances[reverseKey] || 3.0;
  };

  const distanceKm = getRouteDistance();
  const baseFare = 30; // 3000 poysha
  const ratePerKm = 15; // 1500 poysha/km
  const distanceCharge = Math.round(distanceKm * ratePerKm);
  const subtotal = baseFare + distanceCharge;
  const poolDiscount = isPooled ? Math.round(subtotal * 0.20) : 0;
  const totalFare = subtotal - poolDiscount;

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Background glow pulse
      gsap.to(glowRef.current, {
        opacity: 0.7,
        scale: 1.25,
        duration: 2.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });

      // 2. Speed lines animation
      document.querySelectorAll('.speed-line').forEach((line, i) => {
        gsap.fromTo(line,
          { x: '100vw', opacity: 0 },
          {
            x: '-100vw',
            opacity: 0.7,
            duration: 0.7 + Math.random() * 0.6,
            repeat: -1,
            delay: i * 0.12,
            ease: 'none'
          }
        );
      });

      // 3. Tesla entrance — zooms in like a rocket!
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.fromTo(teslaRef.current,
        { x: '100vw', scale: 0.6, opacity: 0 },
        { x: '0%', scale: 1, opacity: 1, duration: 1.6, ease: 'power4.out' }
      )
      .to(teslaRef.current, {
        y: -12,
        duration: 0.35,
        ease: 'power2.out'
      })
      .to(teslaRef.current, {
        y: 0,
        duration: 0.5,
        ease: 'bounce.out'
      });

      // 4. Title & Subtitle reveals
      tl.fromTo(titleRef.current,
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'back.out(1.5)' },
        '-=0.6'
      );

      tl.fromTo(subtitleRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6 },
        '-=0.4'
      );

      tl.fromTo(ctaRef.current?.children || [],
        { y: 25, opacity: 0, scale: 0.9 },
        { y: 0, opacity: 1, scale: 1, duration: 0.5, stagger: 0.15, ease: 'back.out(2)' },
        '-=0.3'
      );

      // 5. Continuous hovering float for the rickshaw
      gsap.to(teslaRef.current, {
        y: -14,
        duration: 2.2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: 2.8
      });

    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={heroRef} className="bg-slate-950 text-slate-100 overflow-hidden font-sans">

      {/* ========================================================= */}
      {/* 1. TOP LIVE TICKER / ANNOUNCEMENT BAR                    */}
      {/* ========================================================= */}
      <div className="bg-gradient-to-r from-red-600/90 via-emerald-600/90 to-cyan-600/90 text-white text-xs py-2 px-4 border-b border-red-500/30">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-300 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-yellow-400"></span>
            </span>
            <span className="font-bold tracking-wide uppercase">8:41 AM Rush Hour Active</span>
            <span className="hidden sm:inline text-slate-200">| Banani Road 11 ➔ Mohakhali flyover jammed</span>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="text-yellow-200">⚡ Bullet (Jashim): Online</span>
            <span className="bg-white/20 px-2 py-0.5 rounded font-bold">20% Pool Discount Applied</span>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. HERO SECTION WITH ROCKET TESLA RICKSHAW & FARE WIDGET  */}
      {/* ========================================================= */}
      <section className="relative min-h-[95vh] flex items-center justify-center pt-8 pb-20 overflow-hidden"
        style={{
          background: 'radial-gradient(ellipse at top, #0f172a 0%, #0a0f1d 50%, #020617 100%)'
        }}>

        {/* Dynamic Glow in background */}
        <div ref={glowRef} className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[550px] rounded-full pointer-events-none opacity-40 blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(239, 68, 68, 0.35) 0%, rgba(34, 197, 94, 0.2) 40%, rgba(6, 182, 212, 0.15) 70%, transparent 100%)'
          }}
        />

        {/* Speed lines */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="speed-line absolute h-[2px] rounded-full"
              style={{
                top: `${10 + i * 9}%`,
                width: `${100 + Math.random() * 150}px`,
                background: `linear-gradient(90deg, transparent, ${i % 2 === 0 ? 'rgba(239, 68, 68, 0.6)' : 'rgba(6, 182, 212, 0.6)'}, transparent)`
              }}
            />
          ))}
        </div>

        {/* Ambient Grid */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
            backgroundSize: '48px 48px'
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">

          {/* RICKSHAW GRAPHIC & MOVING VIDEO CARD */}
          <div ref={teslaRef} className="mb-10 relative inline-block max-w-2xl mx-auto px-4">
            {/* Pulsing neon aura */}
            <div className="absolute -inset-3 bg-gradient-to-r from-red-600 via-amber-500 to-cyan-500 rounded-3xl blur-2xl opacity-40 animate-pulse pointer-events-none" />

            <div className="relative rounded-2xl overflow-hidden border-2 border-red-500/70 shadow-[0_0_60px_rgba(239,68,68,0.35)] bg-slate-900/90 backdrop-blur-md">
              
              {/* Media Mode Switcher (Video vs Photo) */}
              <div className="absolute top-3 right-3 z-30 flex items-center bg-slate-950/85 backdrop-blur-md rounded-xl p-1 border border-slate-700/80 shadow-lg">
                <button
                  onClick={() => setMediaMode('video')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    mediaMode === 'video'
                      ? 'bg-red-600 text-white shadow'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <span>▶</span> Live Motion Video
                </button>
                <button
                  onClick={() => setMediaMode('photo')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    mediaMode === 'photo'
                      ? 'bg-emerald-600 text-white shadow'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <span>📸</span> Tesla Rickshaw
                </button>
              </div>

              {/* Video Player or High-Res Image */}
              {mediaMode === 'video' ? (
                <div className="relative">
                  <video
                    src="/moving-car.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-auto max-h-[380px] object-cover rounded-xl"
                  />
                  <div className="absolute top-3 left-3 bg-red-600/90 text-white text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow">
                    <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                    LIVE MOTION
                  </div>
                </div>
              ) : (
                <img
                  src="/tesla-bullet-rickshaw.jpg"
                  alt="Dhaka Battery Tesla Rickshaw Bullet"
                  className="w-full h-auto max-h-[380px] object-cover rounded-xl"
                />
              )}

              {/* Floating Vehicle Specs Overlay */}
              <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 bg-slate-950/90 backdrop-blur-md px-4 py-2.5 rounded-xl border border-red-500/40 z-20">
                <div className="flex items-center gap-2">
                  <span className="flex h-3 w-3 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                  <span className="text-white font-black text-sm tracking-wider uppercase">Jashim's "Tesla" Bullet</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-red-400 font-mono text-xs font-bold px-2 py-0.5 rounded bg-red-950/70 border border-red-700/60">
                    {mediaMode === 'video' ? '🎬 LIVE SPEED DEMO' : '🛺 3-WHEELER'}
                  </span>
                  <span className="text-cyan-400 font-mono text-xs font-bold px-2 py-0.5 rounded bg-cyan-950/70 border border-cyan-700/60">
                    ⚡ 3 SEATS • 100% ELECTRIC
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-center gap-2 text-xs font-mono text-gray-400">
              <span className="text-red-400 font-semibold">⚡ The Battery-Powered Legend of Banani</span>
              <span>•</span>
              <span className="text-gray-300">Fast, Nimble & Traffic-Proof</span>
            </div>
          </div>

          {/* MAIN HERO TITLE */}
          <h1 ref={titleRef} className="text-4xl sm:text-6xl lg:text-7xl font-black text-white mb-6 leading-tight tracking-tight">
            <span className="bg-gradient-to-r from-green-400 via-emerald-300 to-cyan-400 bg-clip-text text-transparent">
              Share a seat.
            </span>{' '}
            <span className="text-white">Split the fare.</span>
            <br />
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-red-400 bg-clip-text text-transparent">
              Survive Dhaka traffic.
            </span>
          </h1>

          {/* SUBTITLE */}
          <p ref={subtitleRef} className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto mb-10 leading-relaxed">
            Welcome to Dhaka's first electric 3-wheel pooling MVP. Nusrat and Rafiq are already sharing 
            seats in <span className="text-red-400 font-bold">Jashim's Bullet</span>. Squeeze through gridlocks, 
            split fares automatically with a <span className="text-emerald-400 font-bold">20% discount</span>, 
            and never argue with a meter again.
          </p>

          {/* CTA BUTTONS */}
          <div ref={ctaRef} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              to="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-extrabold rounded-xl text-lg hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5"
            >
              <Zap className="w-5 h-5" />
              Ride as Passenger
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-slate-900 border-2 border-red-500/60 text-red-400 font-extrabold rounded-xl text-lg hover:bg-red-500/10 hover:border-red-400 transition-all duration-300 hover:-translate-y-0.5"
            >
              Drive Your "Tesla"
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          {/* ===================================================== */}
          {/* INTERACTIVE LIVE FARE ESTIMATOR WIDGET               */}
          {/* ===================================================== */}
          <div className="max-w-3xl mx-auto bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl text-left">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-6 border-b border-slate-800">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" /> Live Fare Simulator
                </span>
                <h3 className="text-xl font-bold text-white mt-1">Estimate Nusrat & Rafiq's Morning Trip</h3>
              </div>
              <div className="flex items-center bg-slate-800/80 rounded-xl p-1 border border-slate-700">
                <button
                  onClick={() => setIsPooled(true)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    isPooled ? 'bg-emerald-500 text-white shadow' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  ⚡ Pooled (-20%)
                </button>
                <button
                  onClick={() => setIsPooled(false)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    !isPooled ? 'bg-slate-700 text-white shadow' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Solo Ride
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
              {/* Pickup Selector */}
              <div>
                <label className="block text-xs font-mono uppercase text-gray-400 mb-2 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" /> Pickup Location
                </label>
                <select
                  value={pickup}
                  onChange={(e) => setPickup(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 text-sm font-medium"
                >
                  <option value="Banani">Banani (Road 11)</option>
                  <option value="Gulshan 1">Gulshan 1 Circle</option>
                  <option value="Gulshan 2">Gulshan 2</option>
                  <option value="Mohakhali">Mohakhali</option>
                  <option value="Tejgaon">Tejgaon Link Road</option>
                  <option value="Dhanmondi">Dhanmondi</option>
                  <option value="Uttara">Uttara</option>
                </select>
              </div>

              {/* Dropoff Selector */}
              <div>
                <label className="block text-xs font-mono uppercase text-gray-400 mb-2 flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-cyan-400" /> Dropoff Destination
                </label>
                <select
                  value={dropoff}
                  onChange={(e) => setDropoff(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 text-sm font-medium"
                >
                  <option value="Mohakhali">Mohakhali (Nusrat's Dropoff)</option>
                  <option value="Gulshan 1">Gulshan 1 (Rafiq's Dropoff)</option>
                  <option value="Banani">Banani</option>
                  <option value="Gulshan 2">Gulshan 2</option>
                  <option value="Farmgate">Farmgate</option>
                  <option value="Bashundhara">Bashundhara R/A</option>
                </select>
              </div>
            </div>

            {/* Fare Breakdown Card */}
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
              <div className="grid grid-cols-3 gap-4 text-xs font-mono">
                <div>
                  <span className="text-gray-500 block">Est. Distance</span>
                  <span className="text-white font-bold text-sm">{distanceKm.toFixed(1)} km</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Base Fee</span>
                  <span className="text-white font-bold text-sm">৳{baseFare}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Discount</span>
                  <span className={`font-bold text-sm ${isPooled ? 'text-emerald-400' : 'text-gray-500'}`}>
                    {isPooled ? `-৳${poolDiscount}` : '৳0'}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs text-gray-400 block font-mono">Total Passenger Fare</span>
                <span className="text-3xl font-black text-emerald-400 tracking-tight">৳{totalFare}.00</span>
                <span className="text-[10px] text-gray-500 block font-mono">Stored in DB as {totalFare * 100} poysha</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================= */}
      {/* 3. DHAKA RUSH-HOUR CORRIDOR TRACKER                       */}
      {/* ========================================================= */}
      <section className="py-20 bg-slate-900 border-t border-slate-800/80 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-bold">
              Autonomous Route Sharing
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">
              The Banani ➔ Mohakhali ➔ Gulshan Corridor
            </h2>
            <p className="text-gray-400 mt-4 text-base">
              Nusrat is going to Mohakhali. Rafiq is heading to Gulshan 1. Bullet picks up both on Road 11 
              and takes the Chairman Bari shortcut.
            </p>
          </div>

          {/* Route Map Visual Pipeline */}
          <div className="relative bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-10 overflow-hidden shadow-2xl">
            {/* Highway line */}
            <div className="hidden md:block absolute top-1/2 left-16 right-16 h-1 bg-gradient-to-r from-emerald-500 via-yellow-500 to-cyan-500 -translate-y-1/2 opacity-30 pointer-events-none" />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10">
              {/* Waypoint 1 */}
              <div className="bg-slate-900/90 border border-emerald-500/30 p-5 rounded-2xl relative">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 font-black flex items-center justify-center font-mono">1</div>
                  <span className="text-xs font-mono uppercase text-emerald-400 font-bold">Start Zone</span>
                </div>
                <h4 className="text-lg font-bold text-white">Banani Road 11</h4>
                <p className="text-gray-400 text-xs mt-1">Jashim waits at the corner. Nusrat (Seat 1) & Rafiq (Seat 2) hop aboard.</p>
                <div className="mt-3 text-[11px] font-mono text-emerald-300 bg-emerald-950/40 px-2.5 py-1 rounded inline-block">
                  📍 8:41 AM • 2 Passengers
                </div>
              </div>

              {/* Waypoint 2 */}
              <div className="bg-slate-900/90 border border-amber-500/30 p-5 rounded-2xl relative">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 font-black flex items-center justify-center font-mono">2</div>
                  <span className="text-xs font-mono uppercase text-amber-400 font-bold">Midpoint</span>
                </div>
                <h4 className="text-lg font-bold text-white">Chairman Bari</h4>
                <p className="text-gray-400 text-xs mt-1">Shirin tries to request Seat 3 via app. Row-level transaction lock executes!</p>
                <div className="mt-3 text-[11px] font-mono text-amber-300 bg-amber-950/40 px-2.5 py-1 rounded inline-block">
                  ⚡ 8:44 AM • 3/3 Full
                </div>
              </div>

              {/* Waypoint 3 */}
              <div className="bg-slate-900/90 border border-cyan-500/30 p-5 rounded-2xl relative">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 font-black flex items-center justify-center font-mono">3</div>
                  <span className="text-xs font-mono uppercase text-cyan-400 font-bold">First Dropoff</span>
                </div>
                <h4 className="text-lg font-bold text-white">Mohakhali Flyover</h4>
                <p className="text-gray-400 text-xs mt-1">Nusrat arrives at office. Jashim completes Trip 1. Seat 1 freed automatically.</p>
                <div className="mt-3 text-[11px] font-mono text-cyan-300 bg-cyan-950/40 px-2.5 py-1 rounded inline-block">
                  🎯 8:51 AM • Fare: ৳54
                </div>
              </div>

              {/* Waypoint 4 */}
              <div className="bg-slate-900/90 border border-purple-500/30 p-5 rounded-2xl relative">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 font-black flex items-center justify-center font-mono">4</div>
                  <span className="text-xs font-mono uppercase text-purple-400 font-bold">Final Stop</span>
                </div>
                <h4 className="text-lg font-bold text-white">Gulshan 1 Circle</h4>
                <p className="text-gray-400 text-xs mt-1">Rafiq arrives outside his bank. Pool status shifts to COMPLETED.</p>
                <div className="mt-3 text-[11px] font-mono text-purple-300 bg-purple-950/40 px-2.5 py-1 rounded inline-block">
                  🏁 8:56 AM • Fare: ৳48
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 4. THE STORY CAST SHOWCASE (PRD SECTION 1)                */}
      {/* ========================================================= */}
      <section className="py-20 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-mono uppercase tracking-widest text-red-400 font-bold">
              The Real Dhaka Cast
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">
              Meet The Banani Rush-Hour Cast
            </h2>
            <p className="text-gray-400 mt-3 text-sm">
              No generic "user1" or "driver1". These are real commuter personas built into the seed data and lifecycle tests.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Jashim */}
            <div className="bg-slate-900/60 border border-red-500/40 p-6 rounded-2xl flex flex-col justify-between hover:border-red-500 transition-colors">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-red-500/20 text-red-400 text-2xl flex items-center justify-center mb-4 border border-red-500/30">
                  🛺
                </div>
                <span className="text-xs font-mono uppercase text-red-400 font-bold">Chief Pilot</span>
                <h3 className="text-xl font-bold text-white mt-1">Jashim</h3>
                <p className="text-gray-400 text-xs mt-2 leading-relaxed">
                  Pilot of Bullet. Knows every back-alley from Banani to Mohakhali. Just wants riders assigned cleanly so he can step on the gas.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-800 text-xs font-mono text-slate-300">
                Vehicle: <span className="text-red-400 font-bold">Bullet (3 Seats)</span>
              </div>
            </div>

            {/* Nusrat */}
            <div className="bg-slate-900/60 border border-emerald-500/40 p-6 rounded-2xl flex flex-col justify-between hover:border-emerald-500 transition-colors">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 text-2xl flex items-center justify-center mb-4 border border-emerald-500/30">
                  👩‍💼
                </div>
                <span className="text-xs font-mono uppercase text-emerald-400 font-bold">Passenger 1</span>
                <h3 className="text-xl font-bold text-white mt-1">Nusrat</h3>
                <p className="text-gray-400 text-xs mt-2 leading-relaxed">
                  Already 10 minutes late for her standup meeting in Mohakhali. Refuses to pay ৳300 to a CNG driver.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-800 text-xs font-mono text-slate-300">
                Trip: <span className="text-emerald-400 font-bold">Banani ➔ Mohakhali</span>
              </div>
            </div>

            {/* Rafiq */}
            <div className="bg-slate-900/60 border border-cyan-500/40 p-6 rounded-2xl flex flex-col justify-between hover:border-cyan-500 transition-colors">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 text-cyan-400 text-2xl flex items-center justify-center mb-4 border border-cyan-500/30">
                  👨‍💻
                </div>
                <span className="text-xs font-mono uppercase text-cyan-400 font-bold">Passenger 2</span>
                <h3 className="text-xl font-bold text-white mt-1">Rafiq</h3>
                <p className="text-gray-400 text-xs mt-2 leading-relaxed">
                  Heading to Gulshan 1. Total stranger to Nusrat. Books 2 minutes later and shares the ride without it getting awkward.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-800 text-xs font-mono text-slate-300">
                Trip: <span className="text-cyan-400 font-bold">Banani ➔ Gulshan 1</span>
              </div>
            </div>

            {/* Shirin */}
            <div className="bg-slate-900/60 border border-amber-500/40 p-6 rounded-2xl flex flex-col justify-between hover:border-amber-500 transition-colors">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 text-2xl flex items-center justify-center mb-4 border border-amber-500/30">
                  ⚡
                </div>
                <span className="text-xs font-mono uppercase text-amber-400 font-bold">The Concurrency Edge Case</span>
                <h3 className="text-xl font-bold text-white mt-1">Shirin</h3>
                <p className="text-gray-400 text-xs mt-2 leading-relaxed">
                  Tries to grab the last seat at the exact same millisecond. Tests our PostgreSQL row-level lock and capacity bounds!
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-800 text-xs font-mono text-slate-300">
                Status: <span className="text-amber-400 font-bold">Capacity Protected</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 5. COST COMPARISON MATRIX: TESLA POOL VS OTHERS          */}
      {/* ========================================================= */}
      <section className="py-20 bg-slate-900 border-t border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold">
            Fare Economics
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">
            Why Commuters Love Dhaka Tesla Pool
          </h2>
          <p className="text-gray-400 mt-3 text-sm max-w-2xl mx-auto">
            Compare morning rush-hour costs from Banani Road 11 to Mohakhali.
          </p>

          <div className="mt-12 overflow-x-auto">
            <table className="w-full text-left border-collapse bg-slate-950 rounded-2xl overflow-hidden border border-slate-800">
              <thead>
                <tr className="bg-slate-900/90 text-xs font-mono uppercase text-gray-400 border-b border-slate-800">
                  <th className="p-4">Transport Mode</th>
                  <th className="p-4">Cost (Banani ➔ Mohakhali)</th>
                  <th className="p-4">Traffic Performance</th>
                  <th className="p-4">Bargaining Required?</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-sm">
                <tr className="bg-emerald-950/20 text-white font-medium border-l-4 border-emerald-400">
                  <td className="p-4 flex items-center gap-2">
                    <span className="text-emerald-400 font-bold">⚡ Dhaka Tesla Pool</span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono">OUR MVP</span>
                  </td>
                  <td className="p-4 text-emerald-400 font-bold text-lg">৳54.00</td>
                  <td className="p-4 text-emerald-300">Fast (Squeezes through gridlocks)</td>
                  <td className="p-4 text-emerald-300 font-bold">Zero (System Automated)</td>
                </tr>
                <tr className="text-gray-300">
                  <td className="p-4 flex items-center gap-2">
                    <span>🛺 Traditional CNG</span>
                  </td>
                  <td className="p-4 font-bold text-red-400">৳250 - ৳350</td>
                  <td className="p-4 text-gray-400">Stuck at Kakoli junction</td>
                  <td className="p-4 text-red-400 font-bold">15 min exhausting argument</td>
                </tr>
                <tr className="text-gray-300">
                  <td className="p-4 flex items-center gap-2">
                    <span>🚗 Uber / Ride App Car</span>
                  </td>
                  <td className="p-4 font-bold text-red-400">৳280 - ৳400 + Surge</td>
                  <td className="p-4 text-gray-400">Trapped in Mohakhali flyover jam</td>
                  <td className="p-4 text-gray-400">No, but 2x surge pricing</td>
                </tr>
                <tr className="text-gray-300">
                  <td className="p-4 flex items-center gap-2">
                    <span>🚌 Local Bus</span>
                  </td>
                  <td className="p-4 font-bold text-amber-300">৳20 - ৳30</td>
                  <td className="p-4 text-gray-400">Stalled in bumper-to-bumper traffic</td>
                  <td className="p-4 text-gray-400">Struggle to even board the gate</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 6. VEHICLE TECH SPECS: THE 3-WHEELED "TESLA" ANATOMY       */}
      {/* ========================================================= */}
      <section className="py-20 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-red-400 font-bold flex items-center gap-1.5">
                <Gauge className="w-4 h-4" /> Hardware Specifications
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2 leading-tight">
                Anatomy of "Bullet":<br />The Dhaka Electric 3-Wheeler
              </h2>
              <p className="text-gray-400 mt-4 text-sm leading-relaxed">
                Elon Musk never designed it, but Banani mechanics perfected it. Bullet runs on 100% electricity, 
                costs pennies per kilometer to run, and has a turning radius that makes luxury cars cry in Dhaka traffic.
              </p>

              <div className="grid grid-cols-2 gap-4 mt-8">
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                  <BatteryCharging className="w-5 h-5 text-cyan-400 mb-2" />
                  <h4 className="text-white font-bold text-sm">60V Battery Pack</h4>
                  <p className="text-gray-500 text-xs mt-1">High-discharge cell powering instant electric acceleration.</p>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                  <Users className="w-5 h-5 text-red-400 mb-2" />
                  <h4 className="text-white font-bold text-sm">3 Fixed Passenger Seats</h4>
                  <p className="text-gray-500 text-xs mt-1">Strict database capacity limit enforced by PostgreSQL.</p>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                  <Compass className="w-5 h-5 text-emerald-400 mb-2" />
                  <h4 className="text-white font-bold text-sm">Alley Infiltration Mode</h4>
                  <p className="text-gray-500 text-xs mt-1">Squeezes through Banani residential shortcuts effortlessly.</p>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                  <Shield className="w-5 h-5 text-amber-400 mb-2" />
                  <h4 className="text-white font-bold text-sm">Zero Fuel Volatility</h4>
                  <p className="text-gray-500 text-xs mt-1">100% electric: immune to octane shortages or petrol hikes.</p>
                </div>
              </div>
            </div>

            {/* Spec visual card with Video in motion */}
            <div className="relative bg-slate-900 border border-red-500/30 rounded-3xl p-6 sm:p-8 overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="relative rounded-2xl overflow-hidden mb-6 border border-slate-800 shadow-xl">
                <video
                  src="/moving-car.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-auto max-h-[300px] object-cover"
                />
                <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-lg border border-slate-700 text-xs font-mono text-cyan-400 font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  BULLET IN MOTION — ROAD 11
                </div>
              </div>
              <div className="flex items-center justify-between text-xs font-mono text-gray-400 pt-2 border-t border-slate-800">
                <span>VEHICLE IDENTIFIER: BULLET-01</span>
                <span className="text-emerald-400 font-bold">STATUS: FLIGHT READY</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 7. PRODUCTION ENGINEERING & CONCURRENCY SHOWCASE          */}
      {/* ========================================================= */}
      <section className="py-20 bg-slate-900 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold flex items-center justify-center gap-1.5">
              <Layers className="w-4 h-4" /> Robust System Design
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">
              Engineering Judgment Behind The MVP
            </h2>
            <p className="text-gray-400 mt-3 text-sm">
              We did not build a generic demo. Every technical decision matches the RoBenDevs rubric.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Decision 1 */}
            <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center font-bold mb-4">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Row-Level Concurrency</h3>
              <p className="text-gray-400 text-xs mt-2 leading-relaxed">
                When Bullet has 1 seat left and both Nusrat and Shirin attempt to book at the exact same millisecond, 
                our PostgreSQL transaction utilizes <code className="text-red-400 font-mono">SELECT FOR UPDATE</code>. 
                Only one transaction succeeds; the other rolls back safely.
              </p>
            </div>

            {/* Decision 2 */}
            <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold mb-4">
                <DollarSign className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Integer Poysha Precision</h3>
              <p className="text-gray-400 text-xs mt-2 leading-relaxed">
                Money is never stored as floating-point decimals to avoid IEEE-754 rounding drift. 
                All fares, discounts, and payments are calculated and stored in integer poysha 
                (100 poysha = 1 BDT).
              </p>
            </div>

            {/* Decision 3 */}
            <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold mb-4">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Strict Finite State Machine</h3>
              <p className="text-gray-400 text-xs mt-2 leading-relaxed">
                Rides progress strictly through <code className="text-cyan-400 font-mono text-[11px]">REQUESTED ➔ MATCHED ➔ ARRIVED ➔ IN_PROGRESS ➔ COMPLETED</code>. 
                Invalid transitions or unauthorized passenger modifications are rejected at the ORM layer.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 8. COMMUTER TESTIMONIALS                                 */}
      {/* ========================================================= */}
      <section className="py-20 bg-slate-950 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-bold">
              Street Verdict
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">
              From Road 11 Commuters
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl">
              <p className="text-gray-300 text-sm italic leading-relaxed">
                "I reached my office in Mohakhali before my manager finished his tea. Usually I spend 40 minutes arguing with CNG drivers. Jashim took the Chairman Bari cut and I paid only ৳54."
              </p>
              <div className="mt-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">N</div>
                <div>
                  <h4 className="text-white font-bold text-sm">Nusrat Jahan</h4>
                  <span className="text-gray-500 text-xs font-mono">Product Designer @ Mohakhali</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl">
              <p className="text-gray-300 text-sm italic leading-relaxed">
                "Sharing a ride with a stranger sounded weird until I saw I saved ৳180. Rafiq was quietly checking his emails and Jashim was flying through the traffic. 10/10 Dhaka engineering."
              </p>
              <div className="mt-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">R</div>
                <div>
                  <h4 className="text-white font-bold text-sm">Rafiqul Islam</h4>
                  <span className="text-gray-500 text-xs font-mono">Financial Analyst @ Gulshan 1</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl">
              <p className="text-gray-300 text-sm italic leading-relaxed">
                "I try to book the last seat every morning. The app tells me instantly whether Bullet has room or is full. No fake booking confirmations, no false promises. Pure reliability."
              </p>
              <div className="mt-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">S</div>
                <div>
                  <h4 className="text-white font-bold text-sm">Shirin Akter</h4>
                  <span className="text-gray-500 text-xs font-mono">Software Engineer @ Banani</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 9. FAQ ACCORDION SECTION                                  */}
      {/* ========================================================= */}
      <section className="py-20 bg-slate-900 border-t border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold">
              Got Questions?
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "Is Bullet actually a Tesla?",
                a: "In Dhaka street culture, local drivers humorously refer to high-speed battery rickshaws as 'Teslas' because they run 100% on electric batteries, accelerate instantly, and have zero tailpipe emissions! There is no affiliation with Tesla Inc. — it's pure Dhaka pride."
              },
              {
                q: "How does the 20% pool discount calculate?",
                a: "Our fare engine uses the formula: passengerFare = baseFare (৳30) + distanceCharge (৳15/km) - poolDiscount. Whenever two or more passengers share Bullet on compatible corridors, a 20% discount is automatically deducted from each passenger's individual fare."
              },
              {
                q: "What happens if Bullet has 1 seat left and two passengers book simultaneously?",
                a: "We solve the classic concurrency race condition using PostgreSQL row-level locks (SELECT ... FOR UPDATE). The first request locks the vehicle pool row, checks available capacity, and reserves the seat. The concurrent request is safely rejected with 'Not enough seats available'."
              },
              {
                q: "Can a passenger see what other riders paid?",
                a: "No! Each passenger's dashboard and history only show their own fare, pickup, dropoff, and ride lifecycle. Data privacy and authorization boundaries are strictly verified."
              }
            ].map((faq, i) => (
              <div
                key={i}
                className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-white hover:text-emerald-400 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 transition-transform duration-300 text-gray-400 ${openFaq === i ? 'rotate-180 text-emerald-400' : ''}`} />
                </button>
                {openFaq === i && (
                  <div className="p-5 pt-0 text-gray-400 text-sm leading-relaxed border-t border-slate-800/60 mt-1">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 10. FINAL CTA & EVALUATOR DEMO CREDENTIALS                */}
      {/* ========================================================= */}
      <section className="py-24 bg-gradient-to-b from-slate-950 to-slate-900 border-t border-slate-800 relative">
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <div className="inline-flex p-3 rounded-2xl bg-red-500/10 text-red-400 mb-6 border border-red-500/30">
            <Zap className="w-8 h-8" />
          </div>
          <h2 className="text-4xl sm:text-5xl font-black text-white leading-tight">
            Ready to beat Banani rush hour?
          </h2>
          <p className="text-gray-300 text-lg mt-4 max-w-2xl mx-auto">
            Log in with the pre-seeded story personas to test the passenger or driver flow right now.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/login"
              className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black rounded-xl text-lg hover:from-emerald-600 hover:to-teal-700 transition-all shadow-xl shadow-emerald-500/25"
            >
              Launch Live Demo (Sign In)
            </Link>
            <Link
              to="/register"
              className="px-8 py-4 border-2 border-slate-700 text-white font-bold rounded-xl text-lg hover:bg-slate-800 transition-all"
            >
              Create New Persona
            </Link>
          </div>

          {/* Quick Demo Credentials Reminder Box */}
          <div className="mt-12 p-6 bg-slate-900/80 border border-slate-800 rounded-2xl max-w-xl mx-auto text-left text-xs font-mono">
            <span className="text-gray-400 block mb-2 font-bold uppercase tracking-wider">Quick Demo Credentials:</span>
            <div className="grid grid-cols-2 gap-2 text-slate-300">
              <div>👨‍✈️ Driver: <span className="text-red-400">jashim@teslapool.com</span></div>
              <div>👩 Passenger: <span className="text-emerald-400">nusrat@teslapool.com</span></div>
              <div>👨 Passenger: <span className="text-cyan-400">rafiq@teslapool.com</span></div>
              <div>🔑 Password: <span className="text-yellow-400">password123</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 11. FOOTER                                                */}
      {/* ========================================================= */}
      <footer className="bg-slate-950 py-10 border-t border-slate-800/80 text-center text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-red-400 font-bold">⚡ Dhaka Tesla Pool</span>
            <span>• RoBenDevs Software Engineering Internship Assessment 2026</span>
          </div>
          <div>
            Built with PERN Stack (PostgreSQL, Express, React, Node.js) & GSAP
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
