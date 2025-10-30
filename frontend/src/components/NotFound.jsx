import { useState } from 'react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center text-white">
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <h2 className="text-2xl mb-4">Page Not Found</h2>
        <a href="/" className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded">
          Go Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;