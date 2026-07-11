import { useEffect, useRef, useState } from 'react';

/**
 * Custom hook for scroll-triggered animations using IntersectionObserver.
 * Returns a ref to attach to the element and a boolean indicating visibility.
 * @param {Object} options - IntersectionObserver options
 * @param {number} options.threshold - Visibility threshold (0-1)
 * @param {string} options.rootMargin - Root margin for observer
 * @param {boolean} options.triggerOnce - If true, animation only triggers once
 */
export const useScrollAnimation = ({
  threshold = 0.15,
  rootMargin = '0px 0px -60px 0px',
  triggerOnce = true,
} = {}) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce) {
            observer.unobserve(element);
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [threshold, rootMargin, triggerOnce]);

  return [ref, isVisible];
};

/**
 * Hook that returns stagger-delayed visibility for a list of items.
 * @param {number} count - Number of items to stagger
 * @param {number} staggerMs - Milliseconds between each item
 * @param {boolean} parentVisible - Whether the parent container is visible
 */
export const useStaggerAnimation = (count, staggerMs = 120, parentVisible = false) => {
  const [visibleItems, setVisibleItems] = useState([]);

  useEffect(() => {
    if (!parentVisible) {
      setVisibleItems([]);
      return;
    }

    const timers = [];
    for (let i = 0; i < count; i++) {
      const timer = setTimeout(() => {
        setVisibleItems((prev) => [...prev, i]);
      }, i * staggerMs);
      timers.push(timer);
    }

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [count, staggerMs, parentVisible]);

  return visibleItems;
};

/**
 * Hook that applies a smooth parallax offset on scroll.
 * Returns a ref and a transform style string.
 * @param {number} speed - Speed factor, positive = move down slower, negative = move up slower
 */
export const useParallax = (speed = 0.3) => {
  const ref = useRef(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const scrollCenter = rect.top + rect.height / 2 - window.innerHeight / 2;
      setOffset(scrollCenter * speed);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed]);

  return [ref, offset];
};
