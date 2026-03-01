import React, { useEffect, useState } from "react";
import "./IntroAnimation.css";

const IntroAnimation = ({ onComplete }) => {
  const [phase, setPhase] = useState("center");

  useEffect(() => {
    const t1 = setTimeout(() => {
      setPhase("left");
    }, 900); // Stay centered for 0.9s
    
    const t2 = setTimeout(() => {
      setPhase("hide");
    }, 1800); // Stay in navbar position for 0.9s
    
    const t3 = setTimeout(() => {
      onComplete && onComplete();
    }, 2200); // Clean up after fade

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onComplete]);

  return (
    <div className={`intro-wrapper ${phase}`}>
      <h1 className="intro-title">
        <span>S</span>
        <span>helter</span>
        <span>S</span>
        <span>eek</span>
      </h1>
    </div>
  );
};

export default IntroAnimation;