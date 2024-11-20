import React, { useState, useEffect } from 'react';
import Login from './components/auth/Login';
import Dashboard from './components/dashboard/Dashboard';
import PepperControl from './components/robots/pepper/PepperControl';
import DogControl from './components/robots/dog/DogControl'; 
import ArmControl from './components/robots/arm/ArmControl';
import SpiderControl from './components/robots/spider/SpiderControl';
import TeleDrivingControl from './components/robots/teledriving/TeleDrivingControl';
import { auth } from './firebase/config';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('dashboard');

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });

    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      setCurrentView(hash || 'dashboard');
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();

    return () => {
      unsubscribe();
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-600">Cargando...</div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }
// En la función renderView de App.jsx, añade el caso para el robot perro:
  const renderView = () => {
    switch (currentView) {
      case 'pepper':
        return <PepperControl />;
      case 'dog':
        return <DogControl />; 
      case 'arm':
        return <ArmControl />;
      case 'spider':
        return <SpiderControl />;
      case 'teledriving':
        return <TeleDrivingControl />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {renderView()}
    </div>
  );
}

export default App;