import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from './App';
import AdminDashboard from './AdminEventPage';
import ClaimPage from './ClaimPage';

function MainApp() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/claim" element={<ClaimPage />} />
      </Routes>
    </Router>
  );
}

export default MainApp;
