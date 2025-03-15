import SunCalc from 'suncalc';

interface Location {
  latitude: number;
  longitude: number;
}

export function calculateMoonData(date: Date, location: Location) {
  // SunCalc is a library that calculates moon position, phase, etc.
  const moonTimes = SunCalc.getMoonTimes(date, location.latitude, location.longitude);
  const moonPosition = SunCalc.getMoonPosition(date, location.latitude, location.longitude);
  const moonIllumination = SunCalc.getMoonIllumination(date);
  
  // Format rise and set times
  const formatTime = (time: Date | null) => {
    if (!time) return 'Not visible';
    return time.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  // Calculate moon age (days since new moon)
  const moonAge = moonIllumination.phase * 29.53; // 29.53 days in a lunar month

  // Determine which image to use based on moon age
  const imageIndex = Math.min(Math.floor(moonAge) + 1, 31);
  const phaseImage = `${imageIndex}.png`;

  // Determine moon phase name
  const getPhaseName = (phase: number) => {
    if (phase < 0.03) return 'New Moon';
    if (phase < 0.23) return 'Waxing Crescent';
    if (phase < 0.27) return 'First Quarter';
    if (phase < 0.48) return 'Waxing Gibbous';
    if (phase < 0.52) return 'Full Moon';
    if (phase < 0.73) return 'Waning Gibbous';
    if (phase < 0.77) return 'Last Quarter';
    if (phase < 0.97) return 'Waning Crescent';
    return 'New Moon';
  };

  // Astronomical calculations for moon distance
  // Average distance is about 384,400 km
  const moonDistance = 384400 - 20000 * Math.cos(moonIllumination.phase * 2 * Math.PI);
  
  // Moon's apparent magnitude varies from -12.7 (full) to +1.5 (new)
  const moonMagnitude = -12.7 * moonIllumination.fraction + 1.5 * (1 - moonIllumination.fraction);

  return {
    riseTime: formatTime(moonTimes.rise),
    setTime: formatTime(moonTimes.set),
    illumination: moonIllumination.fraction,
    phase: getPhaseName(moonIllumination.phase),
    distance: moonDistance,
    magnitude: moonMagnitude,
    altitude: moonPosition.altitude * (180/Math.PI), // Convert from radians to degrees
    azimuth: moonPosition.azimuth * (180/Math.PI),   // Convert from radians to degrees
    moonAge: moonAge,
    phaseImage: phaseImage
  };
}
