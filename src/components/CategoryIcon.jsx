import React from 'react';
import { Cable, Scroll, HeartPulse, Footprints, Compass, Award, Crown, HelpCircle } from 'lucide-react';

export default function CategoryIcon({ icon, className = "w-6 h-6" }) {
  switch (icon) {
    case 'Cable':
      return <Cable className={className} />;
    case 'Scroll':
      return <Scroll className={className} />;
    case 'HeartPulse':
      return <HeartPulse className={className} />;
    case 'Footprints':
      return <Footprints className={className} />;
    case 'Compass':
      return <Compass className={className} />;
    case 'Award':
      return <Award className={className} />;
    case 'Crown':
      return <Crown className={className} />;
    default:
      return <HelpCircle className={className} />;
  }
}

