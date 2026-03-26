import React, { useState, useEffect } from 'react';
import api from '../api';
import './PointTable.css';

const PointTable = () => {
    const [standings, setStandings] = useState([]);

    useEffect(() => {
        api.get('league-table/').then(res => setStandings(res.data));
    }, []);

    return (
        <div className="table-wrapper">
            <div className="table-header">
                <h1>LEAGUE <span>STANDINGS</span></h1>
                <p>Pro League | Season 2026</p>
            </div>

            <div className="table-container">
                <table className="pro-table">
                    <thead>
                        <tr>
                            <th>POS</th>
                            <th className="text-left">CLUB</th>
                            <th>P</th>
                            <th>W</th>
                            <th>D</th>
                            <th>L</th>
                            <th>GD</th>
                            <th className="pts-head">PTS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {standings.map((team, index) => (
                            <tr key={index} className={index < 3 ? "top-three" : ""}>
                                <td className="rank">{index + 1}</td>
                                <td className="team-cell">
                                    <img src={team.logo} alt="" />
                                    <span>{team.name}</span>
                                </td>
                                <td>{team.p}</td>
                                <td>{team.w}</td>
                                <td>{team.d}</td>
                                <td>{team.l}</td>
                                <td className={team.gd >= 0 ? "gd-plus" : "gd-minus"}>
                                    {team.gd > 0 ? `+${team.gd}` : team.gd}
                                </td>
                                <td className="pts-cell">{team.pts}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PointTable;