import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import GlobalRoutes from './routes';

function App() {
  return (
    <Router basename={import.meta.env.BASE_URL || '/admin'}>
      <GlobalRoutes />
    </Router>
  );
}

export default App;