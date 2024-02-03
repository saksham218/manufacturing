import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Login from './components/Login';
import Manager from './components/manager/Manager';

function App() {

  return (
    <div>
      <Router>
        <Routes>
          {/* <Route path="/" exact element={<Navigate to="/login" />} /> */}
          <Route path="/login" element={<Login />} />
          <Route path="/:manager/*" element={<Manager />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
