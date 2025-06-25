import React from 'react';

export function SkeletonBarChart({ bars = 5 }: { bars?: number }) {
  return (
    <div className="skeleton-bar-chart vertical">
      <div className="skeleton-label">Executing cell</div>
      {Array.from({ length: bars }).map((_, i) => (
        <div
          key={i}
          className="bar vertical-bar"
          style={{ animationDelay: `${i * 0.4}s` }}
        />
      ))}
    </div>
  );
}

export function SkeletonLineChart() {
  return (
    <div className="skeleton-line-chart">
      <div className="skeleton-label">Executing cell</div>
      <svg viewBox="0 0 100 40" preserveAspectRatio="none">
        <polyline points="0,30 20,20 40,25 60,15 80,10 100,20" />
      </svg>
    </div>
  );
}

export function RandomSkeleton() {
  const random = Math.random();
  if (random < 0.5) {
    return <SkeletonLineChart />;
  }
  return <SkeletonBarChart />;
}
