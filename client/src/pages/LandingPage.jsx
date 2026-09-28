/**
 * LandingPage.jsx
 * Epic landing page with GSAP animations.
 * Features a Tesla zooming across the hero section at rocket speed,
 * animated text reveals, floating particles, and scroll-triggered feature cards.
 */
import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Users, Zap, Shield, MapPin, ArrowRight, Star } from 'lucide-react';
import gsap from 'gsap';

const LandingPage = () => {
  // Refs for GSAP animations
  const heroRef = useRef(null);
  const teslaRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const ctaRef = useRef(null);
  const speedLinesRef = useRef(null);
  const featuresRef = useRef(null);
  const statsRef = useRef(null);
  const glowRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // === MASTER TIMELINE ===
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      // 1. Background glow pulse
      gsap.to(glowRef.current, {
        opacity: 0.6,
        scale: 1.2,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });

      // 2. Speed lines animation (continuous)
      document.querySelectorAll('.speed-line').forEach((line, i) => {
        gsap.fromTo(line,
          { x: '100vw', opacity: 0 },
          {
            x: '-100vw',
            opacity: 0.6,
            duration: 0.8 + Math.random() * 0.5,
            repeat: -1,
            delay: i * 0.15,
            ease: 'none'
          }
        );
      });

      // 3. Tesla entrance — zooms in from the right like a rocket!
      tl.fromTo(teslaRef.current,
        { x: '100vw', rotation: 0, scale: 0.5 },
        { x: '0%', rotation: 0, scale: 1, duration: 1.5, ease: 'power4.out' }
      );

      // 4. Tesla bounce/settle
      tl.to(teslaRef.current, {
        y: -10,
        duration: 0.3,
        ease: 'power2.out'
      }).to(teslaRef.current, {
        y: 0,
        duration: 0.5,
        ease: 'bounce.out'
      });

      // 5. Title text reveal — letter by letter pop
      tl.fromTo(titleRef.current,
        { y: 60, opacity: 0, scale: 0.9 },
        { y: 0, opacity: 1, scale: 1, duration: 0.8, ease: 'back.out(1.7)' },
        '-=0.5'
      );

      // 6. Subtitle slide up
      tl.fromTo(subtitleRef.current,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6 },
        '-=0.3'
      );

      // 7. CTA buttons pop in
      tl.fromTo(ctaRef.current?.children || [],
        { y: 30, opacity: 0, scale: 0.8 },
        { y: 0, opacity: 1, scale: 1, duration: 0.5, stagger: 0.15, ease: 'back.out(2)' },
        '-=0.2'
      );

      // 8. Floating Tesla hover animation (continuous)
      gsap.to(teslaRef.current, {
        y: -15,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: 2.5
      });

      // 9. Feature cards stagger in
      gsap.fromTo('.feature-card',
        { y: 80, opacity: 0, scale: 0.9 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.7,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: featuresRef.current,
            start: 'top 80%'
          },
          delay: 2.8
        }
      );

      // 10. Stats counter animation
      gsap.fromTo('.stat-item',
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.2,
          delay: 3.2
        }
      );

      // 11. Floating particles
      document.querySelectorAll('.particle').forEach((p, i) => {
        gsap.to(p, {
          y: -30 - Math.random() * 50,
          x: Math.random() * 40 - 20,
          opacity: 0,
          duration: 2 + Math.random() * 2,
          repeat: -1,
          delay: i * 0.5,
          ease: 'power1.out'
        });
      });

    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={heroRef} className="overflow-hidden">

      {/* ==================== HERO SECTION ==================== */}
      <div className="relative min-h-[90vh] flex items-center justify-center overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #0a0f1c 0%, #0d1a2d 30%, #0f2027 50%, #0d2137 70%, #0a1628 100%)'
        }}>

        {/* Animated background glow */}
        <div ref={glowRef} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-30"
          style={{
            background: 'radial-gradient(circle, rgba(34, 197, 94, 0.3) 0%, rgba(59, 130, 246, 0.15) 40%, transparent 70%)'
          }}
        />

        {/* Speed lines — horizontal streaks */}
        <div ref={speedLinesRef} className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="speed-line absolute h-[2px] rounded-full"
              style={{
                top: `${15 + i * 10}%`,
                width: `${80 + Math.random() * 120}px`,
                background: `linear-gradient(90deg, transparent, ${i % 2 === 0 ? 'rgba(34, 197, 94, 0.5)' : 'rgba(59, 130, 246, 0.5)'}, transparent)`
              }}
            />
          ))}
        </div>

        {/* Floating particles */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="particle absolute w-1 h-1 rounded-full bg-green-400"
              style={{
                left: `${10 + Math.random() * 80}%`,
                top: `${30 + Math.random() * 40}%`,
                opacity: 0.4
              }}
            />
          ))}
        </div>

        {/* Grid overlay for tech feel */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">

          {/* Tesla "Rickshaw" — zooms in from right like a rocket */}
          <div ref={teslaRef} className="mb-8 relative inline-block max-w-xl mx-auto px-4">
            {/* Outer dynamic aura & speed glow */}
            <div className="absolute -inset-2 bg-gradient-to-r from-red-600 via-emerald-500 to-cyan-500 rounded-3xl blur-2xl opacity-40 animate-pulse pointer-events-none" />

            {/* Rickshaw Hero Card */}
            <div className="relative rounded-2xl overflow-hidden border-2 border-red-500/60 shadow-[0_0_50px_rgba(239,68,68,0.3)] bg-slate-900/90 backdrop-blur-md">
              <img
                src="/tesla-bullet-rickshaw.jpg"
                alt="Jashim's Tesla Bullet - Dhaka Battery-Powered Rickshaw"
                className="w-full h-auto max-h-[340px] object-cover rounded-xl"
              />

              {/* Floating Live Spec Badge */}
              <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 bg-slate-950/85 backdrop-blur-md px-4 py-2 rounded-xl border border-red-500/40">
                <div className="flex items-center gap-2">
                  <span className="flex h-3 w-3 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                  <span className="text-white font-black text-sm tracking-wider uppercase">Jashim's "Tesla" Bullet</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-red-400 font-mono text-xs font-bold px-2 py-0.5 rounded bg-red-950/60 border border-red-800">
                    🛺 3-WHEELER
                  </span>
                  <span className="text-cyan-400 font-mono text-xs font-bold px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-800">
                    ⚡ 3 SEATS • 100% BATTERY
                  </span>
                </div>
              </div>
            </div>

            {/* Bullet subtitle */}
            <div className="mt-3 flex items-center justify-center gap-2 text-xs font-mono text-gray-400">
              <span className="text-red-400 font-semibold">⚡ The Legendary Dhaka Battery Rickshaw</span>
              <span>•</span>
              <span className="text-gray-300">Fast, Electric & Traffic-Proof</span>
            </div>
          </div>

          {/* Hero Title */}
          <h1 ref={titleRef} className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight opacity-0">
            <span className="bg-gradient-to-r from-green-400 via-emerald-300 to-blue-400 bg-clip-text text-transparent">
              Share a seat.
            </span>
            <br />
            <span className="text-white">Split the fare.</span>
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
              Survive Dhaka traffic.
            </span>
          </h1>

          {/* Subtitle */}
          <p ref={subtitleRef} className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 opacity-0">
            Dhaka's first electric Tesla ride-pooling platform. Book a ride, share with others,
            and save money — all in <span className="text-green-400 font-semibold">Jashim's Bullet</span>.
          </p>

          {/* CTA Buttons */}
          <div ref={ctaRef} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="group relative inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl text-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-lg shadow-green-500/25 hover:shadow-green-500/40 hover:scale-105"
            >
              <Zap className="w-5 h-5" />
              Ride as Passenger
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/register"
              className="group relative inline-flex items-center gap-2 px-8 py-4 border-2 border-blue-500/50 text-blue-400 font-bold rounded-xl text-lg hover:bg-blue-500/10 hover:border-blue-400 transition-all duration-300 hover:scale-105"
            >
              Drive Your Tesla
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-slate-950 to-transparent" />
      </div>

      {/* ==================== STATS BAR ==================== */}
      <div ref={statsRef} className="bg-slate-950 py-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { value: '3', label: 'Seats on Bullet', icon: '🪑' },
            { value: '10+', label: 'Dhaka Zones', icon: '📍' },
            { value: '20%', label: 'Pool Discount', icon: '💰' },
            { value: '⚡', label: 'Instant Matching', icon: '' },
          ].map((stat, i) => (
            <div key={i} className="stat-item text-center opacity-0">
              <div className="text-3xl md:text-4xl font-black text-white">
                {stat.icon} {stat.value}
              </div>
              <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ==================== FEATURES SECTION ==================== */}
      <div ref={featuresRef} className="py-20 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
              Why Choose <span className="text-green-400">Dhaka Tesla Pool</span>?
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Built for Dhaka's rush-hour chaos. Smart pooling, fair fares, zero hassle.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <Users className="w-8 h-8" />,
                title: 'Smart Pooling',
                desc: 'Share rides with passengers heading the same way. Nusrat and Rafiq can split Bullet\'s seats effortlessly.',
                color: 'from-blue-500 to-blue-600',
                glow: 'group-hover:shadow-blue-500/20'
              },
              {
                icon: <Zap className="w-8 h-8" />,
                title: 'Fair Fares',
                desc: 'Transparent pricing with 20% pool discount. Every poysha calculated — no surprises, no hidden charges.',
                color: 'from-green-500 to-emerald-600',
                glow: 'group-hover:shadow-green-500/20'
              },
              {
                icon: <MapPin className="w-8 h-8" />,
                title: 'Dhaka Zones',
                desc: 'Banani, Gulshan, Mohakhali, Dhanmondi — pick up and drop off across 10+ popular Dhaka locations.',
                color: 'from-purple-500 to-purple-600',
                glow: 'group-hover:shadow-purple-500/20'
              },
              {
                icon: <Shield className="w-8 h-8" />,
                title: 'Safe & Tracked',
                desc: 'Real-time ride status from REQUESTED to COMPLETED. Know exactly where your Tesla is, always.',
                color: 'from-orange-500 to-amber-600',
                glow: 'group-hover:shadow-orange-500/20'
              }
            ].map((feature, i) => (
              <div
                key={i}
                className={`feature-card group relative bg-slate-900/50 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl ${feature.glow} opacity-0`}
              >
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.color} text-white mb-4 shadow-lg`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ==================== HOW IT WORKS ==================== */}
      <div className="py-20 bg-slate-900 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-black text-white text-center mb-16">
            How It <span className="text-green-400">Works</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Request a Ride',
                desc: 'Pick your pickup & destination from Dhaka zones. See your fare estimate instantly.',
                emoji: '📱'
              },
              {
                step: '02',
                title: 'Get Matched',
                desc: 'Jashim accepts your request. If others are going the same way, you share Bullet — and the fare!',
                emoji: '🤝'
              },
              {
                step: '03',
                title: 'Ride & Save',
                desc: 'Track your ride in real-time. Arrive at your destination. Pay fair fare with pool discount.',
                emoji: '⚡'
              }
            ].map((step, i) => (
              <div key={i} className="relative text-center group">
                <div className="text-6xl mb-4">{step.emoji}</div>
                <div className="text-green-400 font-mono text-sm mb-2">STEP {step.step}</div>
                <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                <p className="text-gray-400 text-sm">{step.desc}</p>
                {i < 2 && (
                  <div className="hidden md:block absolute top-8 -right-4 text-gray-600">
                    <ArrowRight className="w-8 h-8" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ==================== THE STORY CAST ==================== */}
      <div className="py-20 bg-slate-950 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-black text-white text-center mb-4">
            Meet the <span className="text-green-400">Cast</span>
          </h2>
          <p className="text-gray-500 text-center mb-12 max-w-lg mx-auto">The Banani rush-hour crew. 8:41 AM, Road 11.</p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: 'Jashim', role: 'Driver', vehicle: 'Bullet (3 seats)', emoji: '🚗', color: 'border-green-500/50 bg-green-500/5' },
              { name: 'Nusrat', role: 'Passenger', vehicle: 'Banani → Mohakhali', emoji: '👩', color: 'border-blue-500/50 bg-blue-500/5' },
              { name: 'Rafiq', role: 'Passenger', vehicle: 'Banani → Gulshan 1', emoji: '👨', color: 'border-purple-500/50 bg-purple-500/5' },
              { name: 'Shirin', role: 'Passenger', vehicle: 'The edge case!', emoji: '👩‍💼', color: 'border-orange-500/50 bg-orange-500/5' },
            ].map((char, i) => (
              <div key={i} className={`border rounded-2xl p-5 text-center ${char.color} hover:scale-105 transition-transform duration-300`}>
                <div className="text-4xl mb-3">{char.emoji}</div>
                <h3 className="text-white font-bold text-lg">{char.name}</h3>
                <p className="text-green-400 text-xs font-mono mb-1">{char.role}</p>
                <p className="text-gray-500 text-xs">{char.vehicle}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ==================== BOTTOM CTA ==================== */}
      <div className="py-16 bg-gradient-to-r from-green-600 to-emerald-700">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
            Ready to survive Dhaka traffic?
          </h2>
          <p className="text-green-100 mb-8 text-lg">Join the ride. Split the fare. Make it to work on time.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-green-700 font-bold rounded-xl text-lg hover:bg-gray-100 transition-all shadow-lg hover:scale-105"
            >
              <Zap className="w-5 h-5" /> Get Started Now
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-8 py-4 border-2 border-white/30 text-white font-bold rounded-xl text-lg hover:bg-white/10 transition-all"
            >
              Already have an account? Login
            </Link>
          </div>
        </div>
      </div>

      {/* ==================== FOOTER ==================== */}
      <footer className="bg-slate-950 py-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-600 text-sm">
            ⚡ Dhaka Tesla Pool — Built for RoBenDevs Internship Assessment 2026
          </p>
          <p className="text-gray-700 text-xs mt-2">
            Share a seat. Split the fare. Survive Dhaka traffic.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
