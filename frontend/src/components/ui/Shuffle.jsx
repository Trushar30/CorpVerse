import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export default function Shuffle({
  text = '',
  className = '',
  style = {},
  shuffleDirection = 'right',
  duration = 0.35,
  maxDelay = 0,
  tag: Tag = 'span',
  textAlign = 'center',
  onShuffleComplete,
  shuffleTimes = 3,
  animationMode = 'evenodd',
  stagger = 0.03,
  scrambleCharset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()',
  colorFrom,
  colorTo,
  triggerOnHover = true
}) {
  const [displayText, setDisplayText] = useState(text.split(''));
  const [isHovered, setIsHovered] = useState(false);
  const isAnimatingRef = useRef(false);

  // Scramble animation loop
  const runShuffle = () => {
    if (isAnimatingRef.current || !text) return;
    isAnimatingRef.current = true;

    const chars = text.split('');
    const rolls = Math.max(1, Math.floor(shuffleTimes));
    let frame = 0;
    const maxFrames = rolls * 4;

    const interval = setInterval(() => {
      frame++;
      setDisplayText(
        chars.map((char) => {
          if (char === ' ') return ' ';
          if (frame >= maxFrames) return char;
          return scrambleCharset.charAt(Math.floor(Math.random() * scrambleCharset.length));
        })
      );

      if (frame >= maxFrames) {
        clearInterval(interval);
        setDisplayText(chars);
        isAnimatingRef.current = false;
        if (onShuffleComplete) onShuffleComplete();
      }
    }, 45);
  };

  useEffect(() => {
    runShuffle();
  }, [text]);

  const handleMouseEnter = () => {
    if (triggerOnHover) {
      setIsHovered(true);
      runShuffle();
    }
  };

  const getMotionVariants = (index) => {
    const isVertical = shuffleDirection === 'up' || shuffleDirection === 'down';
    const offset = isVertical
      ? { y: shuffleDirection === 'up' ? [12, 0] : [-12, 0] }
      : { x: shuffleDirection === 'left' ? [12, 0] : [-12, 0] };

    const delay = animationMode === 'evenodd'
      ? (index % 2 === 0 ? index * stagger : index * stagger + 0.05)
      : Math.random() * maxDelay + index * stagger;

    return {
      initial: { opacity: 0, ...offset },
      animate: {
        opacity: 1,
        x: 0,
        y: 0,
        transition: { duration, delay, ease: 'easeOut' }
      }
    };
  };

  return (
    <Tag
      className={`inline-block select-none ${className}`.trim()}
      style={{ textAlign, ...style }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setIsHovered(false)}
    >
      {displayText.map((char, i) => {
        if (text[i] === ' ') {
          return <span key={i} className="inline-block">&nbsp;</span>;
        }

        const variant = getMotionVariants(i);

        return (
          <motion.span
            key={i}
            initial={variant.initial}
            animate={variant.animate}
            className="inline-block will-change-transform"
            style={{
              color: isHovered && colorTo ? colorTo : colorFrom || undefined
            }}
          >
            {char}
          </motion.span>
        );
      })}
    </Tag>
  );
}
