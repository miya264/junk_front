'use client';

import * as React from 'react';

function stringToColor(seed: string) {
  // 名前から安定した色を作る簡易ハッシュ
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = Math.imul(31, h) + seed.charCodeAt(i) | 0;
  const hue = Math.abs(h) % 360;
  return `hsl(${hue} 70% 60%)`;
}

function getInitials(name: string) {
  // 例: "鈴木 理沙" → "鈴理", "Taro Yamada" → "TY"
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] ?? '') + (parts[1][0] ?? '');
  }
  return (name[0] ?? '').slice(0, 2);
}

export function NameAvatar({
  name,
  src,
  size = 40,
  className = '',
}: { name: string; src?: string; size?: number; className?: string }) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        width={size}
        height={size}
        className={`rounded-full object-cover ${className}`}
      />
    );
  }
  const initials = getInitials(name);
  const bg = stringToColor(name);
  const fontSize = Math.round(size * 0.42);

  return (
    <div
      aria-label={name}
      title={name}
      style={{ width: size, height: size, backgroundColor: bg, fontSize }}
      className={`rounded-full text-white grid place-items-center select-none ${className}`}
    >
      {initials}
    </div>
  );
}