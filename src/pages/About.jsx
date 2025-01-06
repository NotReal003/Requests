import React from 'react';

const About = () => {
  return (
    <div className="container mx-auto p-6 bg-gray-900 text-gray-300 min-h-screen">
      {/* Header Section */}
      <header className="text-center mb-12 bg-gray-800 shadow-lg p-8 rounded-lg">
        <h1 className="text-4xl font-bold mb-4 text-white">Request Management Portal</h1>
        <p className="text-lg font-serif">
          A comprehensive platform to manage user requests with authentication, notifications, and admin control.
        </p>
      </header>

      {/* Overview Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6 text-white">Overview</h2>
        <p>
          This project is a fully functional request management system that seamlessly integrates backend and frontend components. Users can submit various types of requests, such as Discord reports, support queries, and guild applications. Administrators enjoy advanced control options for reviewing and managing these requests.
        </p>
        <p className="mt-4">
          Discover more details about this project on our{' '}
          <a
            href="https://github.com/NotReal003/Requests"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 underline"
          >
            GitHub Repository
          </a>.
        </p>
      </section>

      {/* Key Features Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6 text-white">Key Features</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gray-800 shadow-md rounded-lg p-6 hover:shadow-xl transition duration-300">
            <h3 className="text-xl font-semibold mb-4 text-blue-400">Frontend</h3>
            <ul className="list-disc list-inside">
              <li>Submit Discord reports, support requests, and guild applications.</li>
              <li>Dynamic authentication with JWT-based login/logout.</li>
              <li>Admin Panel with options for managing requests and review messages.</li>
              <li>Responsive, mobile-friendly design with a modern interface.</li>
              <li>Multiple authentication options: GitHub, Discord, and email.</li>
            </ul>
          </div>

          <div className="bg-gray-800 shadow-md rounded-lg p-6 hover:shadow-xl transition duration-300">
            <h3 className="text-xl font-semibold mb-4 text-blue-400">Backend</h3>
            <ul className="list-disc list-inside">
              <li>Request handling routes for support, Discord reports, and guild applications.</li>
              <li>Secure JWT-based authentication system.</li>
              <li>Dedicated admin routes for managing requests and users.</li>
              <li>Automated email notifications for request updates.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Support Us Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6 text-white">Support Us</h2>
        <p>
          If you find this project helpful and want to support its development, consider donating. Your contributions help us keep the platform running and improve its features.
        </p>
        <a
          href="https://patreon.com/NotNT77"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary bg-blue-500 hover:bg-blue-600 text-white border-none mt-6"
        >
          Donate Now
        </a>
      </section>

      {/* Links Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6 text-white">Links</h2>
        <ul className="space-y-4">
          <li>
            <a
              href="https://github.com/NotReal003/Requests"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-400 underline"
            >
              GitHub Repository
            </a>
          </li>
          <li>
            <a
              href="/"
              className="hover:text-blue-400 underline"
            >
              API Documentation (Coming Soon)
            </a>
          </li>
          <li>
            <a
              href="https://github.com/NotReal003/Requests/API"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-400 underline"
            >
              API Repository
            </a>
          </li>
          <li>
            <a
              href="https://support.notreal003.xyz/terms"
              className="hover:text-blue-400 underline"
            >
              Terms and Conditions
            </a>
          </li>
        </ul>
      </section>

      {/* Footer Section */}
      <footer className="text-center py-6 border-t border-gray-700 mt-12">
        <p className="text-gray-500">© 2025 NotReal003. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default About;
