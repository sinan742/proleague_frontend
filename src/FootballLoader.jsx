import React from 'react';
import './FootballLoader.css';

const FootballLoader = ({ message = "Loading..." }) => {
    return (
        <div className="lp-global-loader-overlay">
            
            <div className="lp-loader-content">
                <div className="lp-football-loader">
                    <div className="lp-football">
                        <div className="lp-hex"></div>
                        <div className="lp-hex"></div>
                        <div className="lp-hex"></div>
                    </div>
                    <div className="lp-shadow"></div>
                </div>
                <h2 className="lp-loading-text">{message}</h2>
            </div>
        </div>
    );
};

export default FootballLoader;