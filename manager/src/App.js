import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Login from './components/Login';
import Manager from './components/manager/Manager';

function App() {

  const [manager, setManager] = useState({ name: "", manager_id: "" })
  return (
    <div>
      <Router>
        <Routes>
          <Route path="/login" element={<Login setManager={setManager} />} />
          <Route path="/:manager/*" element={<Manager manager={manager} />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
