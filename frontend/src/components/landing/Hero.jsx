import { motion } from 'framer-motion';
import { Code2, Terminal, Cpu, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import Shuffle from '../ui/Shuffle';

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#0b0e14]">
      {/* Hero Parallax Scene Container */}
      <div className="w-full relative min-h-[580px] sm:min-h-[640px] md:min-h-[700px] flex flex-col items-center justify-between select-none py-10 px-4 sm:px-6 lg:px-8">
        
        {/* Layer 0: Base Sky */}
        <div 
          className="absolute inset-0 z-0 pointer-events-none pixel-render"
          style={{
            backgroundImage: `url('/LandingPage_Sky.webp')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center top',
            backgroundRepeat: 'no-repeat'
          }}
        />

        {/* Layer 1: Mountains */}
        <div 
          className="absolute inset-0 z-1 pointer-events-none pixel-render opacity-95"
          style={{
            backgroundImage: `url('/LandingPage_Mountain.webp')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center top',
            backgroundRepeat: 'no-repeat'
          }}
        />

        {/* Layer 2: Green Hills */}
        <div 
          className="absolute inset-0 z-2 pointer-events-none pixel-render"
          style={{
            backgroundImage: `url('/LandingPage_Hills.webp')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center top',
            backgroundRepeat: 'no-repeat'
          }}
        />

        {/* Layer 3: Grass Field Foreground (Symmetric Left & Mirrored Right Grass Field) */}
        <div 
          className="absolute inset-y-0 left-0 w-1/2 z-3 pointer-events-none pixel-render"
          style={{
            backgroundImage: `url('/LandingPage_Grass.webp')`,
            backgroundSize: 'cover',
            backgroundPosition: 'left top',
            backgroundRepeat: 'no-repeat'
          }}
        />
        <div 
          className="absolute inset-y-0 right-0 w-1/2 z-3 pointer-events-none pixel-render scale-x-[-1]"
          style={{
            backgroundImage: `url('/LandingPage_Grass.webp')`,
            backgroundSize: 'cover',
            backgroundPosition: 'left top',
            backgroundRepeat: 'no-repeat'
          }}
        />

        {/* Foreground Content */}
        <div className="relative z-20 max-w-3xl mx-auto text-center flex flex-col items-center mt-4 sm:mt-6">
          
          {/* Subtitle Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-2 sm:mb-3 font-pixel text-xs sm:text-sm font-extrabold uppercase tracking-[0.25em] text-white drop-shadow-[2px_2px_0px_#000000]"
          >
            START YOUR CAREER QUEST
          </motion.div>

          {/* Main Pixel Title ("Corporate Adventure") */}
          <motion.h1
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-pixel-heading text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight mb-3 sm:mb-4 leading-[1.05]"
          >
            <span 
              className="block text-[#ffc700] drop-shadow-[4px_4px_0px_#2a1436]"
              style={{
                WebkitTextStroke: '2px #2a1436',
                textShadow: '3px 3px 0px #2a1436, -1px -1px 0px #2a1436, 1px -1px 0px #2a1436, -1px 1px 0px #2a1436'
              }}
            >
              Corporate
            </span>
            <span 
              className="block relative text-[#ffc700] drop-shadow-[4px_4px_0px_#2a1436]"
              style={{
                WebkitTextStroke: '2px #2a1436',
                textShadow: '3px 3px 0px #2a1436, -1px -1px 0px #2a1436, 1px -1px 0px #2a1436, -1px 1px 0px #2a1436'
              }}
            >
              Adventure <span className="inline-block text-2xl sm:text-4xl align-top text-[#fff3a1] -ml-1">✨</span>
            </span>
          </motion.h1>

          {/* Tagline (CorpVerse Value Proposition) */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="font-pixel text-white text-xs sm:text-base md:text-lg max-w-md sm:max-w-xl mx-auto mb-6 sm:mb-8 font-bold drop-shadow-[2px_2px_0px_#000000]"
          >
            The AI career simulator — master interviews, level up, & build companies. ✨
          </motion.p>

          {/* Golden Action Button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="z-30"
          >
            <Link
              to="/sign-up"
              className="retro-btn-yellow text-sm sm:text-base md:text-lg px-8 py-3 rounded-md font-pixel font-bold border-2 border-black shadow-[4px_4px_0px_#000] inline-block"
            >
              <Shuffle
                text="Enter Simulation"
                shuffleDirection="right"
                duration={0.35}
                animationMode="evenodd"
                shuffleTimes={1}
                ease="power3.out"
                stagger={0.03}
                threshold={0.1}
                triggerOnce={true}
                triggerOnHover={true}
                respectReducedMotion={true}
              />
            </Link>
          </motion.div>

        </div>

        {/* Pixel Mascot Companion (Sitting on left side of grass) */}
        <div className="absolute bottom-[16%] sm:bottom-[18%] md:bottom-[20%] left-[4%] sm:left-[12%] md:left-[18%] lg:left-[22%] z-20 pointer-events-none animate-float-mascot">
          <img
            src="/LandingPage_Mascot.webp"
            alt="CorpVerse Pixel Companion"
            className="w-24 sm:w-36 md:w-44 pixel-render drop-shadow-[4px_4px_0px_rgba(0,0,0,0.4)]"
          />
        </div>

        {/* Integrated Supported By Overlay at Bottom of Grass Scene */}
        <div className="relative z-20 w-full max-w-4xl mx-auto mb-2 font-pixel text-slate-200">
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs sm:text-sm font-bold drop-shadow-[2px_2px_0px_#000000]">
            <span className="text-slate-300 uppercase tracking-wider text-[11px] sm:text-xs">
              POWERED BY
            </span>
            <span className="flex items-center gap-1.5 hover:text-emerald-400 transition-colors">
              <Terminal className="w-4 h-4 text-emerald-400" /> React 19
            </span>
            <span className="flex items-center gap-1.5 hover:text-[#ffc700] transition-colors">
              <Code2 className="w-4 h-4 text-[#ffc700]" /> Node.js & Express
            </span>
            <span className="flex items-center gap-1.5 hover:text-cyan-400 transition-colors">
              <Cpu className="w-4 h-4 text-cyan-400" /> Python FastAPI AI
            </span>
            <span className="flex items-center gap-1.5 hover:text-purple-400 transition-colors">
              <Sparkles className="w-4 h-4 text-purple-400" /> Custom JWT Auth
            </span>
          </div>
        </div>

      </div>
    </section>
  );
}
