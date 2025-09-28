import React, { useState, useEffect } from 'react';

const OptimizedImage = ({ src, fallbackSrc, alt, className, onError, ...props }) => {
  const [imageSrc, setImageSrc] = useState(src);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setImageSrc(src);
    setIsLoaded(false);
    setHasError(false);
  }, [src]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = (e) => {
    if (!hasError && fallbackSrc) {
      setHasError(true);
      setImageSrc(fallbackSrc);
      e.target.dataset.fallbackUsed = 'true';
    }
    if (onError) {
      onError(e);
    }
  };

  return (
    <img
      {...props}
      src={imageSrc}
      alt={alt}
      className={className}
      onLoad={handleLoad}
      onError={handleError}
      style={{
        opacity: 1,
        transition: 'opacity 0.2s ease',
        ...props.style
      }}
    />
  );
};

export default OptimizedImage;