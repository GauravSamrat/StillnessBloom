import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import MapView from './pages/MapView';
import GuruDashboard from './pages/GuruDashboard';

export default function App() {
  return (
    <Router>
      <nav style={{ padding: '15px', background: '#f4f4f4', marginBottom: '20px' }}>
        <Link to="/" style={{ marginRight: '20px' }}>Community Map</Link>
        <Link to="/dashboard">Guru Performance</Link>
      </nav>

      <Routes>
        <Route path="/" element={<MapView />} />
        <Route path="/dashboard" element={<GuruDashboard />} />
      </Routes>
    </Router>
  );
}
