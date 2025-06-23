import React from 'react';

export function SkeletonBarChart({ bars = 5 }: { bars?: number }) {
  const heights = Array.from(
    { length: bars },
    () => `${30 + Math.random() * 60}%`
  );

  return (
    <div className="skeleton-bar-chart">
      {heights.map((height, i) => (
        <div key={i} className="bar" style={{ height }} />
      ))}
    </div>
  );
}

export function SkeletonLineChart() {
  return (
    <div className="skeleton-line-chart">
      <svg viewBox="0 0 100 40" preserveAspectRatio="none">
        <polyline points="0,30 20,20 40,25 60,15 80,10 100,20" />
      </svg>
    </div>
  );
}
