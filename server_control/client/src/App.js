// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ServerList from './components/ServerList';
import AddServer from './components/AddServer';
import ControlPanel from './components/ControlPanel';

function App() {
  return (
    <Router>
      <div className="container mx-auto p-4">
        <Routes>
          <Route path="/" element={<ServerList />} />
          <Route path="/add" element={<AddServer />} />
          <Route path="/control/:id" element={<ControlPanel />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
