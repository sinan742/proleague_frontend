import React, { useEffect, useState } from 'react';
import './SplashScreen.css';

const SplashScreen = ({ onFinished }) => {
    const [fadeOut, setFadeOut] = useState(false);

    useEffect(() => {
        // Show splash for 2.5 seconds then start fade out
        const timer = setTimeout(() => {
            setFadeOut(true);
            // Completely remove from DOM after fade animation ends
            setTimeout(() => {
                onFinished();
            }, 600); 
        }, 2500);

        return () => clearTimeout(timer);
    }, [onFinished]);

    return (
        <div className={`ss-overlay ${fadeOut ? 'ss-exit' : ''}`}>
            <div className="ss-content">
                <div className="ss-logo-wrap">
                    <h1 className="ss-logo">PRO<span>LEAGUE</span></h1>
                    <div className="ss-shimmer"></div>
                </div>
                
                <div className="ss-loader-container">
                    <div className="ss-football">⚽</div>
                    <p className="ss-loading-text">PREPARING PITCH...</p>
                </div>
            </div>
            
            <div className="ss-footer">
                <p>v2.0.26 | Powered by AI Scout</p>
            </div>
        </div>
    );
};

export default SplashScreen;