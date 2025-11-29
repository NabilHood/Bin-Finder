// App.jsx
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SignUp from './components/Auth/SignUp';
import Login from './components/Auth/Login';
import Dashboard from './components/Auth/Dashboard';
import Home from './components/Home/Home';
import FarmingSimulator from './components/Game/FarmingSimulator'; // Import the new game component
import './App.css';

function App() {
  const [user, setUser] = useState(null);

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route 
            path="/" 
            element={<Home />} 
          />
          <Route 
            path="/signup" 
            element={<SignUp setUser={setUser} />} 
          />
          <Route 
            path="/login" 
            element={<Login setUser={setUser} />} 
          />
          <Route 
            path="/dashboard" 
            element={user ? <Dashboard user={user} /> : <Navigate to="/" />} 
          />
          <Route
            path="/farm"
            // Optionally protect this route so only logged-in users can access it
            element={user ? <FarmingSimulator /> : <Navigate to="/login" />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;