import React from 'react';
import * as Icons from 'lucide-react';

export default function CategoryIcon({ name, size = 18, className = '', color }) {
  const IconComponent = Icons[name] || Icons.CircleDot;
  return <IconComponent size={size} className={className} style={color ? { color } : undefined} />;
}
