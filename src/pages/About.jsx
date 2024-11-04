import React from 'react';

const About = () => {
  return (
    <div className="container mx-auto p-6">
      <header className="text-center mb-8 bg-base-100">
        <h1 className="text-xl font-bold mb-4">Request Management Portal</h1>
        <p className="text-md font-serif">
          A comprehensive platform to manage user requests with authentication, notifications, and admin control.
        </p>
      </header>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Overview</h2>
        <p className="font-serif">
          This project is a fully functional request management system, including both backend and frontend components. It is designed for users to submit different types of requests such as Discord reports, support requests, and guild applications. Administrators can manage these requests with advanced control options.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Key Features</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-base-100 shadow-lg rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Frontend</h3>
            <ul className="list-disc list-inside">
              <li>Request Form Pages: Submit Discord reports, support requests, guild applications.</li>
              <li>JWT-based login/logout with dynamic navbar status display.</li>
              <li>Admin Panel for managing requests with review messages and status updates.</li>
              <li>Responsive Design: Mobile-friendly with modern design practices.</li>
              <li>We provide authentication options to users with Github, Discord & Email.</li>
            </ul>
          </div>

          {/* Backend Features */}
          <div className="bg-base-100 shadow-lg rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Backend</h3>
            <ul className="list-disc list-inside">
              <li>Request Routes: Handles support, Discord report, guild application requests.</li>
              <li>JWT Authentication: Secure token-based access control.</li>
              <li>Admin Routes: Manage requests and users.</li>
              <li>Email Notifications: Automatic notifications for request status updates.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Tech Stack</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-base-100 shadow-lg rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Frontend</h3>
            <ul className="list-disc list-inside">
              <li>React</li>
              <li>React Router</li>
              <li>DaisyUI/TailwindCSS</li>
              <li>Axios</li>
              <li>React Toastify</li>
            </ul>
          </div>
          <div className="bg-base-100 shadow-lg rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Backend</h3>
            <ul className="list-disc list-inside">
              <li>Node.js</li>
              <li>Express.js</li>
              <li>MongoDB</li>
              <li>JWT Authentication</li>
              <li>Nodemailer</li>
            </ul>
          </div>
        </div>
      </section>

      {/* API Endpoints */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">API Endpoints</h2>

        <div className="bg-base-100 shadow-lg rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">User Authentication</h3>
          <ul className="list-disc list-inside">
            <li>GET /auth/signin: Login With Discord</li>
            <li>GET /auth/github: Login With GitHub</li>
            <li>GET /auth/email-signup: SignUp With Email</li>
            <li>GET /auth/email-signin: Login With Email</li>
            <li>GET /auth/email-verify: Verify SignUp Email</li>
            <li>GET /auth/verify-signin-email: Verify SignIn Email</li>
            <li>GET /auth/callback: Verify Discord Code</li>
            <li>GET /auth/github/callback: Verify Github Code</li>
            <li>GET /users/@me: Get current user details.</li>
            <li>GET /auth/signout: Logout user.</li>
            <li>And other routes</li>
          </ul>
        </div>

        <div className="bg-base-100 shadow-lg rounded-lg p-6 mt-6">
          <h3 className="text-xl font-semibold mb-4">Requests</h3>
          <ul className="list-disc list-inside">
            <li>POST /requests/report: Submit a Discord report request.</li>
            <li>POST /requests/support: Submit a support request.</li>
            <li>POST /requests/guild-application: Submit a guild application request.</li>
            <li>GET /requests: Get all requests for the current user.</li>
            <li>PUT /requests/:requestId: Update request status (Admin only).</li>
            <li>And many more routes.</li>
          </ul>
        </div>
      </section>
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Admin Actions</h2>
        <ul className="list-disc list-inside">
          <li>Approve, reject, or cancel requests and leave review messages.</li>
          <li>Block/unblock users as needed.</li>
          <li>Update request statuses directly from the admin dashboard.</li>
        </ul>
      </section>
      <footer className="text-center py-6 border-t mt-12">
        <p>
          © 2024 NotReal003
        </p>
      </footer>
    </div>
  );
};

export default About;
