import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import GlobalRoutes from './routes';

function App() {
  return (
    <Router>
      <GlobalRoutes />
    </Router>
  );
}

export default App;