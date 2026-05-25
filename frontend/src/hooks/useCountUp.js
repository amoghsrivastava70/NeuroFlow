import { useState, useEffect } from 'react';

export function useCountUp(end, duration = 1500) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime = null;
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);
      
      // easeOutQuart
      const ease = 1 - Math.pow(1 - percentage, 4);
      setCount(Math.floor(end * ease));

      if (progress < duration) {
        requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };
    requestAnimationFrame(animate);
  }, [end, duration]);

  return count;
}