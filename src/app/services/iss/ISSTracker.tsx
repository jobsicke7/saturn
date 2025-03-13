"use client";

import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Polyline, Rectangle } from "react-leaflet";
import { Icon, LatLngBounds } from "leaflet";
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

const ISSTracker = () => {
    const [userPosition, setUserPosition] = useState<[number, number] | null>(null);
    const [issPosition, setIssPosition] = useState<[number, number]>([0, 0]);
    const [mapType, setMapType] = useState<"default" | "satellite">("default");
    const [orbitPath, setOrbitPath] = useState<OrbitPoint[]>([]);
    const [issData, setIssData] = useState<ISSData | null>(null);
    const [nightBounds, setNightBounds] = useState<LatLngBounds | null>(null);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth <= 900;
            setIsMobile(mobile);
        };

        // 초기 판단
        checkMobile();

        // resize 이벤트 핸들러 등록
        window.addEventListener('resize', checkMobile);

        // cleanup
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        console.log('isMobile:', isMobile); // 상태 변경될 때 출력
    }, [isMobile]); // isMobile 값이 변경될 때만 실행

    const maxBounds: [[number, number], [number, number]] = [
        [-90, -180],
        [90, 180],
    ];

    // Custom icons
    const issIcon = new Icon({
        iconUrl: "/images/iss.png",
        iconSize: [32, 32],
        iconAnchor: [16, 16],
    });

    const userIcon = new Icon({
        iconUrl: "/images/my.png",
        iconSize: [32, 32],
        iconAnchor: [16, 16],
    });




    // Get user's location
    useEffect(() => {
        if (typeof window !== "undefined" && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => setUserPosition([position.coords.latitude, position.coords.longitude]),
                (error) => console.error("Error:", error)
            );
        }
    }, []);

    // Fetch ISS orbit path
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
                        const pastTime = new Date(currentTime.getTime() - i * 60000);
                        const positionAndVelocity = propagate(satrec, pastTime);
                        const gmst = gstime(pastTime);

                        const position = positionAndVelocity.position as EciVec3<number>;
                        if (position && "x" in position) {
                            const geodetic = eciToGeodetic(position, gmst);
                            orbits.push({
                                position: [
                                    (geodetic.latitude * 180) / Math.PI,
                                    (geodetic.longitude * 180) / Math.PI,
                                ],
                                type: "past",
                            });
                        }
                    }

                    // Future orbits (3 hours ahead)
                    for (let i = 0; i <= 180; i++) {
                        const futureTime = new Date(currentTime.getTime() + i * 60000);
                        const positionAndVelocity = propagate(satrec, futureTime);
                        const gmst = gstime(futureTime);

                        const position = positionAndVelocity.position as EciVec3<number>;
                        if (position && "x" in position) {
                            const geodetic = eciToGeodetic(position, gmst);
                            orbits.push({
                                position: [
                                    (geodetic.latitude * 180) / Math.PI,
                                    (geodetic.longitude * 180) / Math.PI,
                                ],
                                type: "future",
                            });
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

    // Fetch ISS data
    useEffect(() => {
        const fetchISSData = async () => {
            try {
                const response = await fetch("https://api.wheretheiss.at/v1/satellites/25544");
                const data = await response.json();
                setIssData(data);
                setIssPosition([data.latitude, data.longitude]);
            } catch (error) {
                console.error("Error:", error);
            }
        };

        fetchISSData();
        const interval = setInterval(fetchISSData, 1000);
        return () => clearInterval(interval);
    }, []);

    // Format time for different timezones
    const formatTime = (timestamp: number) => {
        const date = new Date(timestamp * 1000);

        // 시간대 -9시간씩 조정
        const kst = new Date(date.getTime() + (9 * 60 * 60 * 1000) - (9 * 60 * 60 * 1000)); // -9시간 적용
        const utc = new Date(date.getTime() - (9 * 60 * 60 * 1000)); // -9시간 적용
        const pst = new Date(date.getTime() - (8 * 60 * 60 * 1000) - (9 * 60 * 60 * 1000)); // -9시간 적용

        const formatOptions: Intl.DateTimeFormatOptions = {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        };

        return {
            kst: kst.toLocaleTimeString('ko-KR', formatOptions),
            utc: utc.toLocaleTimeString('en-US', formatOptions),
            pst: pst.toLocaleTimeString('en-US', formatOptions)
        };
    };


    // Render orbits
    const renderOrbits = () => {
        const segments: { past: [number, number][][]; future: [number, number][][] } = {
            past: [],
            future: [],
        };
        let currentPastSegment: [number, number][] = [];
        let currentFutureSegment: [number, number][] = [];

        orbitPath.forEach((point, index) => {
            if (index > 0) {
                const prevLon = orbitPath[index - 1].position[1];
                const currentLon = point.position[1];

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

        if (currentPastSegment.length > 0) segments.past.push(currentPastSegment);
        if (currentFutureSegment.length > 0) segments.future.push(currentFutureSegment);

        return (
            <>
                {segments.past.map((segment, index) => (
                    <Polyline
                        key={`past-${index}`}
                        positions={segment}
                        color="#ff6b6b"
                        weight={2}
                        opacity={0.7}
                    />
                ))}
                {segments.future.map((segment, index) => (
                    <Polyline
                        key={`future-${index}`}
                        positions={segment}
                        color="#4ecdc4"
                        weight={2}
                        opacity={0.7}
                    />
                ))}
            </>
        );
    };

    return (
        <div className={styles.container}>
            <div className={styles.rightContainer}>
                <div className={`${styles.infoContainer}`}>
                    <h2 style={{ marginBottom: '20px' }} className={issData?.visibility === 'daylight' ? styles.daylight : styles.nighttime}>
                        {issData?.visibility === 'daylight'
                            ? "국제우주정거장이 낮 시간대에 위치해 있습니다"
                            : "국제우주정거장이 밤 시간대에 위치해 있습니다"}
                    </h2>

                    <div className={styles.infoGrid}>
                        <div className={styles.infoLabel}>위도:</div>
                        <div className={styles.infoValue}>{issData?.latitude.toFixed(2)}°</div>

                        <div className={styles.infoLabel}>경도:</div>
                        <div className={styles.infoValue}>{issData?.longitude.toFixed(2)}°</div>

                        <div className={styles.infoLabel}>고도:</div>
                        <div className={styles.infoValue}>{issData?.altitude.toFixed(2)} km</div>

                        <div className={styles.infoLabel}>속도:</div>
                        <div className={styles.infoValue}>{issData?.velocity.toFixed(0)} km/h</div>

                        <div className={styles.infoLabel}>KST:</div>
                        <div className={styles.infoValue}>
                            {issData && formatTime(issData.timestamp).kst}
                        </div>

                        <div className={styles.infoLabel}>UTC:</div>
                        <div className={styles.infoValue}>
                            {issData && formatTime(issData.timestamp).utc}
                        </div>

                        <div className={styles.infoLabel}>PST:</div>
                        <div className={styles.infoValue}>
                            {issData && formatTime(issData.timestamp).pst}
                        </div>
                    </div>
                </div>

                <div className={styles.videoContainer}>
                    <iframe
                        width="100%"
                        height="100%"
                        src="https://www.youtube.com/embed/xRPjKQtRXR8?autoplay=1&mute=1"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        style={{ border: 0, borderRadius: '8px' }}
                    ></iframe>
                </div>
            </div>
            <div className={styles.mapContainer}>

                <div className={styles.controls}>
                    <button
                        onClick={() => setMapType(mapType === "default" ? "satellite" : "default")}
                        className={styles.mapToggle}
                    >
                        {mapType === "default" ? "위성 지도로 변경" : "기본 지도로 변경"}
                    </button>
                </div>

                <MapContainer
                    key={isMobile ? "mobile" : "desktop"} // 상태 변경 시 리렌더링 유도
                    center={[0, 0]}
                    zoom={isMobile ? 0 : 2}
                    className={styles.map}
                    scrollWheelZoom={true}
                    maxBounds={maxBounds}
                    minZoom={isMobile ? 0.4 : 2} // 동적 설정
                >
                    <TileLayer
                        url={
                            mapType === "default"
                                ? "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                : "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                        }
                        noWrap={true}
                        bounds={maxBounds}
                    />
                    {userPosition && <Marker position={userPosition} icon={userIcon} />}
                    <Marker position={issPosition} icon={issIcon} />
                    {renderOrbits()}
                </MapContainer>
            </div>


        </div >
    );
};

export default ISSTracker;