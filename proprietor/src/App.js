import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import Proprietor from './components/proprietor/Proprietor';
import Login from './components/Login';
import Signup from './components/Signup';


function App() {

  const [proprietor, setProprietor] = useState({ name: "", proprietor_id: "" })
  return (
    <div>
      <Router>
        <Routes>
          <Route path="/login" element={<Login setProprietor={setProprietor} />} />
          <Route path="/signup" element={<Signup setProprietor={setProprietor} />} />
          <Route path="/:proprietor/*" element={<Proprietor proprietor={proprietor} />} />
        </Routes>
      </Router>
      {/* <Proprietor /> */}

    </div>
  );
}

export default App;
