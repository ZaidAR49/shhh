'use client';

import Lottie from 'lottie-react';
import animationData from '../../../public/loader.json';

interface LoaderProps {
  className?: string;
  size?: number;
}

export function Loader({ className, size = 64 }: LoaderProps) {
  return (
    <div className={className} style={{ width: size, height: size }}>
      <Lottie animationData={animationData} loop={true} />
    </div>
  );
}
