import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';

import Proprietor from './components/proprietor/Proprietor';
import Login from './components/Login';
import Signup from './components/Signup';


function App() {


  return (
    <div>
      <Router>
        <Routes>
          <Route path="/" exact element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/:proprietor/*" element={<Proprietor />} />
        </Routes>
      </Router>
      {/* <Proprietor /> */}

    </div>
  );
}

export default App;
