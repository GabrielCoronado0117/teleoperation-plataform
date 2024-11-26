// src/components/layout/UserLayout.jsx
import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { auth } from '../../firebase/config';

const UserLayout = ({ user, userData }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  // Filtrar solo los robots a los que el usuario tiene acceso
  const availableRobots = [
    { name: 'Robot Pepper', path: '/user/pepper', icon: '🤖', permission: 'pepper' },
    { name: 'Robot Araña', path: '/user/spider', icon: '🕷️', permission: 'spider' },
    { name: 'Robot Perro', path: '/user/dog', icon: '🐕', permission: 'dog' },
    { name: 'Brazo Robot', path: '/user/arm', icon: '🦾', permission: 'robotArm' },
    { name: 'TeleDriving', path: '/user/teledriving', icon: '🚗', permission: 'teledriving' }
  ].filter(robot => userData?.permissions?.[robot.permission]);

  const menuItems = [
    {
      title: 'Principal',
      items: [
        {
          name: 'Dashboard',
          path: '/user/dashboard',
          icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          ),
        }
      ]
    },
    {
      title: 'Robots Disponibles',
      items: availableRobots
    }
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside 
        className={`bg-blue-800 text-white w-64 min-h-screen transition-all duration-300 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-64'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-blue-700">
          <h2 className="text-xl font-bold">Panel de Usuario</h2>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="lg:hidden"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="mt-4">
          {menuItems.map((section, idx) => (
            <div key={idx} className="px-4 py-2">
              <h3 className="mb-2 text-sm font-semibold text-blue-200 uppercase tracking-wider">
                {section.title}
              </h3>
              <div className="space-y-1">
                {section.items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center px-2 py-2 text-sm rounded-md transition-colors ${
                        isActive
                          ? 'bg-blue-900 text-white'
                          : 'text-blue-100 hover:bg-blue-700 hover:text-white'
                      }`
                    }
                  >
                    <span className="mr-3">{typeof item.icon === 'string' ? item.icon : item.icon}</span>
                    <span>{item.name}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-blue-700">
          <div className="mb-2 px-2 text-sm text-blue-200">
            {user?.email}
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-2 py-2 text-sm text-blue-100 rounded-md hover:bg-blue-700 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Contenido Principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow">
          <div className="flex items-center justify-between px-6 py-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </header>

        {/* Contenido de la página */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default UserLayout;