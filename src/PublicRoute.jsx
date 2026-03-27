// src/PublicRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const PublicRoute = ({ children }) => {
  const token = Cookies.get('access_token'); 

  if (token) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PublicRoute;