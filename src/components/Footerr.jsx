// src/components/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer footer-center bg-base-200 text-base-content rounded p-4">
      <nav className="grid grid-flow-col gap-4">

        <Link to="https://support.notreal003.xyz/terms" className="link link-hover hover:underline">Terms of Service</Link>
        <Link to="https://github.com/NotReal003/Requests" className="link link-hover hover:underline">Open Source</Link>
        <Link to="https://support.notreal003.xyz/privacy" className="link link-hover hover:underline">Privacy Policy</Link>
      </nav>
      <nav>
        <div className="grid grid-flow-col gap-4">
          <Link to="https://x.com/NotNT77">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              className="fill-current">
              <path
                d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"></path>
            </svg>
          </Link>
          <Link to="https://youtube.com/@notnt77?si=VYMvcWcwVCnpeZGL">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              className="fill-current">
              <path
                d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"></path>
            </svg>
          </Link>
        </div>
      </nav>
      <aside>
        <p>Copyright © 2024 <a href="https://notreal003.xyz" className="hover:underline">NotReal003</a> - All rights reserved.</p>
        <a href="//www.dmca.com/Protection/Status.aspx?ID=06a7e07d-65ce-4e2c-b9ad-296e1ee1586a" title="DMCA.com Protection Status" class="dmca-badge"> <img src ="https://images.dmca.com/Badges/dmca-badge-w100-5x1-05.png?ID=06a7e07d-65ce-4e2c-b9ad-296e1ee1586a"  alt="DMCA.com Protection Status" /></a>  <script src="https://images.dmca.com/Badges/DMCABadgeHelper.min.js"> </script>
      </aside>
    </footer>
  );
};

export default Footer;