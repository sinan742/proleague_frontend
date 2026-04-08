import React, { Suspense, useState, useEffect, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, PerspectiveCamera, Html, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import './WeekTeam.css';

const OriginalPitch = () => {
    // We create a CanvasTexture that mimics a professional pitch perfectly
    const pitchTexture = useMemo(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 1024;
        const ctx = canvas.getContext('2d');

        // 1. Draw Professional Grass Stripes (Alternating Green)
        for (let i = 0; i < 10; i++) {
            ctx.fillStyle = i % 2 === 0 ? '#1a3c15' : '#224d1d';
            ctx.fillRect(0, i * 102.4, 1024, 102.4);
        }

        // 2. Add Grass "Grain" for realism
        for (let i = 0; i < 20000; i++) {
            ctx.fillStyle = `rgba(0,0,0,${Math.random() * 0.1})`;
            ctx.fillRect(Math.random() * 1024, Math.random() * 1024, 2, 2);
        }

        // 3. Draw Official White Markings
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 6;

        // Outer Boundary
        ctx.strokeRect(50, 50, 924, 924);
        // Halfway Line
        ctx.beginPath();
        ctx.moveTo(50, 512);
        ctx.lineTo(974, 512);
        ctx.stroke();
        // Center Circle
        ctx.beginPath();
        ctx.arc(512, 512, 80, 0, Math.PI * 2);
        ctx.stroke();
        // Penalty Areas
        ctx.strokeRect(262, 50, 500, 150); // Top Box
        ctx.strokeRect(262, 824, 500, 150); // Bottom Box
        
        // Goal Areas
        ctx.strokeRect(382, 50, 260, 60);
        ctx.strokeRect(382, 914, 260, 60);

        const tex = new THREE.CanvasTexture(canvas);
        tex.anisotropy = 16;
        return tex;
    }, []);

    return (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
            <planeGeometry args={[140, 200]} />
            <meshStandardMaterial map={pitchTexture} roughness={1} metalness={0} />
        </mesh>
    );
};

const PlayerNode = ({ player, position }) => {
    const navigate = useNavigate();
    const backendUrl = "http://127.0.0.1:8000";
    const imageUrl = player.player_photo 
        ? (player.player_photo.startsWith('http') ? player.player_photo : `${backendUrl}${player.player_photo}`)
        : 'https://cdn-icons-png.flaticon.com/512/166/166344.png';

    return (
        <Html position={position} center distanceFactor={15}>
            <motion.div 
                whileHover={{ scale: 1.1, rotateY: 10, cursor: 'pointer' }}
                className="fut-card gold large-card"
                onClick={() => navigate(`/players/${player.player}`)}
            >
                <div className="card-inner">
                    <div className="card-top">
                        <div className="card-rating">{player.power_score || 88}</div>
                        <div className="card-pos">{player.player_position}</div>
                    </div>
                    <div className="card-image-wrap">
                        <img src={imageUrl} alt="" onError={(e) => e.target.src = 'https://cdn-icons-png.flaticon.com/512/166/166344.png'} />
                    </div>
                    <div className="card-bottom">
                        <div className="card-name">{player.player_name}</div>
                        <div className="card-stats-mini">
                            <span>G {player.goals}</span>
                            <span>A {player.assists}</span>
                        </div>
                    </div>
                </div>
            </motion.div>
        </Html>
    );
};

const WeekTeam = () => {
    const [squad, setSquad] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTOTW = async () => {
            try {
                const res = await api.get('/team-of-the-week/');
                setSquad(res.data);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchTOTW();
    }, []);

    if (loading) return <div className="totw-loader"><h1>ENTERING STADIUM...</h1></div>;

    return (
        <div className="totw-wrapper">
            <div className="totw-overlay-ui">
                <h1>TEAM OF THE <span className="gold-text">WEEK</span></h1>
            </div>

            <div className="canvas-holder">
                <Canvas shadows onCreated={({ gl }) => { gl.shadowMap.type = THREE.PCFShadowMap }}>
                    <PerspectiveCamera makeDefault position={[0, 60, 100]} fov={45} />
                    <OrbitControls minPolarAngle={0.1} maxPolarAngle={Math.PI / 2.25} enableDamping />
                    
                    <ambientLight intensity={0.8} />
                    <spotLight position={[0, 100, 0]} intensity={2} angle={0.5} castShadow />
                    <Stars radius={150} count={3000} factor={4} />

                    <Suspense fallback={null}>
                        <OriginalPitch />
                        
                        {/* Goalkeeper */}
                        {squad?.goalkeeper && <PlayerNode player={squad.goalkeeper} position={[0, 4, 75]} />}
                        {/* Defenders */}
                        {squad?.defenders?.map((p, i) => <PlayerNode key={p.id} player={p} position={[-48 + i * 32, 4, 45]} />)}
                        {/* Midfielders */}
                        {squad?.midfielders?.map((p, i) => <PlayerNode key={p.id} player={p} position={[-32 + i * 32, 4, 10]} />)}
                        {/* Forwards */}
                        {squad?.forwards?.map((p, i) => <PlayerNode key={p.id} player={p} position={[-32 + i * 32, 4, -30]} />)}
                    </Suspense>
                </Canvas>
            </div>
        </div>
    );
};

export default WeekTeam;