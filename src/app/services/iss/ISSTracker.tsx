"use client";
import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from "react-leaflet";
import { Icon, LatLngBounds, Map as LeafletMap } from "leaflet";
import { twoline2satrec, propagate, gstime, eciToGeodetic } from "satellite.js";
import type { EciVec3 } from "satellite.js";
import styles from "./map.module.css";
import "leaflet/dist/leaflet.css";

interface OrbitPoint {
    position: [number, number];
    type: "past" | "future";
}

interface ISSData {
    latitude: number;
    longitude: number;
    altitude: number;
    velocity: number;
    visibility: string;
    timestamp: number;
}

// MapEffect 컴포넌트에 타입 추가
interface MapEffectProps {
  setMapInstance: React.Dispatch<React.SetStateAction<LeafletMap | null>>;
}

// MapEffect 컴포넌트 추가 - 맵 인스턴스에 접근하기 위한 컴포넌트
const MapEffect = ({ setMapInstance }: MapEffectProps) => {
  const map = useMap();
  
  useEffect(() => {
    setMapInstance(map);
    
    // 맵이 로드된 후 크기 다시 계산
    setTimeout(() => {
      map.invalidateSize();
    }, 300);
  }, [map, setMapInstance]);
  
  return null;
};

const ISSTracker = () => {
    const [userPosition, setUserPosition] = useState<[number, number] | null>(null);
    const [issPosition, setIssPosition] = useState<[number, number]>([0, 0]);
    const [mapType, setMapType] = useState<"default" | "satellite">("satellite");
    const [orbitPath, setOrbitPath] = useState<OrbitPoint[]>([]);
    const [issData, setIssData] = useState<ISSData | null>(null);
    const [isMobile, setIsMobile] = useState(false);
    const [visibilityIcon, setVisibilityIcon] = useState("🌞");
    const [showStats, setShowStats] = useState(true);
    const [mapKey, setMapKey] = useState(Date.now()); // 맵 리렌더링을 위한 키
    const [mapInstance, setMapInstance] = useState<LeafletMap | null>(null); // 타입 추가

    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth <= 900;
            setIsMobile(mobile);
            // 화면 크기 변경 시 지도 키 업데이트로 강제 리렌더링
            setMapKey(Date.now());
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // 맵 크기 재조정
    useEffect(() => {
        if (mapInstance) {
            setTimeout(() => {
                mapInstance.invalidateSize();
            }, 300);
        }
    }, [mapInstance, mapKey, isMobile, showStats]);

    useEffect(() => {
        if (issData?.visibility === 'daylight') {
            setVisibilityIcon("🌞");
        } else {
            setVisibilityIcon("🌙");
        }
    }, [issData?.visibility]);

    const maxBounds: [[number, number], [number, number]] = [
        [-90, -180],
        [90, 180],
    ];

    // 커스텀 아이콘
    const issIcon = new Icon({
        iconUrl: "/images/iss.png",
        iconSize: [40, 40],
        iconAnchor: [20, 20],
    });

    const userIcon = new Icon({
        iconUrl: "/images/my.svg",
        iconSize: [32, 32],
        iconAnchor: [16, 16],
    });

    useEffect(() => {
        if (typeof window !== "undefined" && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => setUserPosition([position.coords.latitude, position.coords.longitude]),
                (error) => console.error("Error:", error)
            );
        }
    }, []);
    // ISS TLE 데이터 가져오기
    const fetchTLEData = async () => {
        try {
            const response = await fetch("/api/iss/tle", {
                cache: 'no-store',
                next: { revalidate: 7200 }
            });
            
            if (!response.ok) {
                throw new Error("Failed to fetch TLE data");
            }
            
            const result = await response.json();
            
            if (result.error) {
                console.error(result.error);
                throw new Error(result.error);
            }
            
            return result.data;
        } catch (error) {
            console.error("Error fetching TLE data:", error);
            throw error;
        }
    };

    // 궤도 계산
    useEffect(() => {
        const calculateOrbits = async () => {
            try {
                const data = await fetchTLEData();
                const lines = data.split("\n");
                const issLines = lines.slice(0, 3);
                const satrec = twoline2satrec(issLines[1], issLines[2]);

                if (satrec) {
                    const orbits: OrbitPoint[] = [];
                    const currentTime = new Date();

                    // 과거 궤도 계산
                    for (let i = 180; i >= 0; i--) {
                        const pastTime = new Date(currentTime.getTime() - i * 60000);
                        const positionAndVelocity = propagate(satrec, pastTime);
                        const gmst = gstime(pastTime);

                        const position = positionAndVelocity.position as EciVec3<number>;
                        if (position && "x" in position) {
                            const geodetic = eciToGeodetic(position, gmst);
                            const lat = (geodetic.latitude * 180) / Math.PI;
                            const lon = (geodetic.longitude * 180) / Math.PI;
                            
                            if (!isNaN(lat) && !isNaN(lon)) {
                                orbits.push({
                                    position: [lat, lon],
                                    type: "past",
                                });
                            }
                        }
                    }

                    // 미래 궤도 계산
                    for (let i = 0; i <= 180; i++) {
                        const futureTime = new Date(currentTime.getTime() + i * 60000);
                        const positionAndVelocity = propagate(satrec, futureTime);
                        const gmst = gstime(futureTime);

                        const position = positionAndVelocity.position as EciVec3<number>;
                        if (position && "x" in position) {
                            const geodetic = eciToGeodetic(position, gmst);
                            const lat = (geodetic.latitude * 180) / Math.PI;
                            const lon = (geodetic.longitude * 180) / Math.PI;
                            
                            if (!isNaN(lat) && !isNaN(lon)) {
                                orbits.push({
                                    position: [lat, lon],
                                    type: "future",
                                });
                            }
                        }
                    }

                    setOrbitPath(orbits);
                }
            } catch (error) {
                console.error("Orbit calculation error:", error);
            }
        };

        calculateOrbits();
        const interval = setInterval(calculateOrbits, 300000); // 5분마다 갱신
        return () => clearInterval(interval);
    }, []);

    // Fetch ISS orbit path - NaN 값을 철저히 필터링
    useEffect(() => {
        const calculateOrbits = async () => {
            try {
                const response = await fetch("https://www.celestrak.com/NORAD/elements/stations.txt");
                const data = await response.text();
                const lines = data.split("\n");
                const issLines = lines.slice(0, 3);
                const satrec = twoline2satrec(issLines[1], issLines[2]);

                if (satrec) {
                    const orbits: OrbitPoint[] = [];
                    const currentTime = new Date();

                    // Past orbits (3 hours back)
                    for (let i = 180; i >= 0; i--) {
                        try {
                            const pastTime = new Date(currentTime.getTime() - i * 60000);
                            const positionAndVelocity = propagate(satrec, pastTime);
                            const gmst = gstime(pastTime);

                            const position = positionAndVelocity.position as EciVec3<number>;
                            if (position && "x" in position) {
                                const geodetic = eciToGeodetic(position, gmst);
                                const lat = (geodetic.latitude * 180) / Math.PI;
                                const lon = (geodetic.longitude * 180) / Math.PI;
                                
                                // NaN 체크
                                if (!isNaN(lat) && !isNaN(lon)) {
                                    orbits.push({
                                        position: [lat, lon],
                                        type: "past",
                                    });
                                }
                            }
                        } catch (error) {
                            console.warn("Error calculating past orbit point:", error);
                            // 오류 발생 시 해당 지점은 건너뜀
                            continue;
                        }
                    }

                    // Future orbits (3 hours ahead)
                    for (let i = 0; i <= 180; i++) {
                        try {
                            const futureTime = new Date(currentTime.getTime() + i * 60000);
                            const positionAndVelocity = propagate(satrec, futureTime);
                            const gmst = gstime(futureTime);

                            const position = positionAndVelocity.position as EciVec3<number>;
                            if (position && "x" in position) {
                                const geodetic = eciToGeodetic(position, gmst);
                                const lat = (geodetic.latitude * 180) / Math.PI;
                                const lon = (geodetic.longitude * 180) / Math.PI;
                                
                                // NaN 체크
                                if (!isNaN(lat) && !isNaN(lon)) {
                                    orbits.push({
                                        position: [lat, lon],
                                        type: "future",
                                    });
                                }
                            }
                        } catch (error) {
                            console.warn("Error calculating future orbit point:", error);
                            // 오류 발생 시 해당 지점은 건너뜀
                            continue;
                        }
                    }

                    setOrbitPath(orbits);
                }
            } catch (error) {
                console.error("Error:", error);
            }
        };

        calculateOrbits();
        const interval = setInterval(calculateOrbits, 60000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const fetchISSData = async () => {
            try {
                const response = await fetch("https://api.wheretheiss.at/v1/satellites/25544");
                const data = await response.json();
                setIssData(data);
                setIssPosition([data.latitude, data.longitude]);
            } catch (error) {
                console.error("Error fetching ISS data:", error);
            }
        };
        fetchISSData();
        const interval = setInterval(fetchISSData, 1000);
        return () => clearInterval(interval);
    }, []);

    const formatTime = (timestamp: number) => {
        const date = new Date(timestamp * 1000);
        const kst = new Date(date.getTime() + (9 * 60 * 60 * 1000));
        const utc = date;
        const formatOptions: Intl.DateTimeFormatOptions = {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        };
        return {
            kst: kst.toLocaleTimeString('ko-KR', formatOptions),
            utc: utc.toLocaleTimeString('ko-KR', formatOptions)
        };
    };

    // 개선된 renderOrbits 함수 - NaN 값을 철저히 필터링
    const renderOrbits = () => {
        // 유효한 좌표만 필터링
        const validOrbitPath = orbitPath.filter(point => 
            !isNaN(point.position[0]) && !isNaN(point.position[1])
        );
        
        if (validOrbitPath.length < 2) {
            return null; // 유효한 포인트가 2개 미만이면 아무것도 렌더링하지 않음
        }
        
        const segments: { past: [number, number][][]; future: [number, number][][] } = {
            past: [],
            future: [],
        };
        let currentPastSegment: [number, number][] = [];
        let currentFutureSegment: [number, number][] = [];

        validOrbitPath.forEach((point, index) => {
            if (index > 0) {
                const prevLon = validOrbitPath[index - 1].position[1];
                const currentLon = point.position[1];

                // 경도 차이가 큰 경우 세그먼트 분리 (180도 경계 넘어가는 경우)
                if (Math.abs(currentLon - prevLon) > 180) {
                    if (point.type === "past" && currentPastSegment.length > 0) {
                        segments.past.push([...currentPastSegment]);
                        currentPastSegment = [];
                    } else if (point.type === "future" && currentFutureSegment.length > 0) {
                        segments.future.push([...currentFutureSegment]);
                        currentFutureSegment = [];
                    }
                }
            }

            if (point.type === "past") {
                currentPastSegment.push(point.position);
            } else {
                currentFutureSegment.push(point.position);
            }
        });

        // 남은 세그먼트 추가
        if (currentPastSegment.length > 0) segments.past.push(currentPastSegment);
        if (currentFutureSegment.length > 0) segments.future.push(currentFutureSegment);

        // 각 세그먼트에 충분한 좌표가 있는지 확인
        const validSegments = {
            past: segments.past.filter(segment => segment.length > 1),
            future: segments.future.filter(segment => segment.length > 1)
        };
        
        return (
            <>
                {validSegments.past.map((segment, index) => (
                    <Polyline
                        key={`past-${index}`}
                        positions={segment}
                        color="#FF4136"
                        weight={3}
                        opacity={0.7}
                        dashArray="5,8"
                    />
                ))}
                {validSegments.future.map((segment, index) => (
                    <Polyline
                        key={`future-${index}`}
                        positions={segment}
                        color="#0088cc"
                        weight={3}
                        opacity={0.8}
                    />
                ))}
            </>
        );
    };

    const toggleStats = () => {
        setShowStats(!showStats);
    };

    return (
        <div className={styles.modernContainer}>
            <div className={styles.mapSection}>
                <MapContainer
                    key={mapKey}
                    center={[0, 0]}
                    zoom={isMobile ? 1 : 2}
                    className={styles.modernMap}
                    scrollWheelZoom={true}
                    maxBounds={maxBounds}
                    minZoom={isMobile ? 1 : 2}
                >
                    <MapEffect setMapInstance={setMapInstance} />
                    
                    <TileLayer
                        url={
                            mapType === "default"
                                ? "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                : "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                        }
                        noWrap={true}
                        bounds={maxBounds}
                    />
                    {userPosition && (
                        <Marker position={userPosition} icon={userIcon}>
                            <Popup>내 위치</Popup>
                        </Marker>
                    )}
                    <Marker position={issPosition} icon={issIcon}>
                        <Popup>
                            <b>국제우주정거장 현재 위치</b>
                            <br />
                            위도: {issData?.latitude.toFixed(2)}° | 경도: {issData?.longitude.toFixed(2)}°
                        </Popup>
                    </Marker>
                    {renderOrbits()}
                </MapContainer>
                
                <div className={styles.mapControls}>
                    <button
                        onClick={() => setMapType(mapType === "default" ? "satellite" : "default")}
                        className={styles.modernButton}
                    >
                        {mapType === "default" ? "위성 지도" : "기본 지도"}
                    </button>
                    <button onClick={toggleStats} className={styles.modernButton}>
                        {showStats ? "정보 숨기기" : "정보 보기"}
                    </button>
                </div>
            </div>
            {showStats && (
                <div className={styles.infoPanel}>
                    <div className={styles.statsCard}>
                        <div className={styles.cardHeader}>
                            <h2 className={styles.cardTitle}>ISS 실시간 위치</h2>
                            <span 
                                className={`${styles.statusBadge} ${issData?.visibility === 'daylight' ? styles.daylight : styles.nighttime}`}
                            >
                                {visibilityIcon} {issData?.visibility === 'daylight' ? "주간" : "야간"}
                            </span>
                        </div>
                        
                        <div className={styles.statsGrid}>
                            <div className={styles.statItem}>
                                <div className={styles.statLabel}>위도</div>
                                <div className={styles.statValue}>{issData?.latitude.toFixed(2)}°</div>
                            </div>
                            <div className={styles.statItem}>
                                <div className={styles.statLabel}>경도</div>
                                <div className={styles.statValue}>{issData?.longitude.toFixed(2)}°</div>
                            </div>
                            <div className={styles.statItem}>
                                <div className={styles.statLabel}>고도</div>
                                <div className={styles.statValue}>{issData?.altitude.toFixed(2)} km</div>
                            </div>
                            <div className={styles.statItem}>
                                <div className={styles.statLabel}>속도</div>
                                <div className={styles.statValue}>{issData?.velocity.toFixed(0)} km/h</div>
                            </div>
                            <div className={styles.statItem}>
                                <div className={styles.statLabel}>시간 (한국/UTC)</div>
                                <div className={styles.statValue}>
                                    {issData && formatTime(issData.timestamp).kst} / {issData && formatTime(issData.timestamp).utc}
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className={styles.videoCard}>
                        <div className={styles.cardHeader}>
                            <span className={styles.cardTitle}>ISS 실시간 영상</span>
                        </div>
                        <div className={styles.videoWrapper}>
                            <iframe
                                width="100%"
                                height="100%"
                                src="https://www.youtube.com/embed/xRPjKQtRXR8?autoplay=1&mute=1"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        </div>
                        <div className={styles.infoNote}>
                            <p>NASA에서 제공하는 국제우주정거장 실시간 화면입니다.</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ISSTracker;