import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer class="bg-base-10 max-w-screen-xl">
      <div class="mx-auto w-full p-4 py-6 lg:py-8">
        <div class="md:flex md:justify-between">
          <div class="mb-6 md:mb-0">
            <a href="https://notreal003.org/" class="flex items-center">
              <img src="https://i.postimg.cc/8cJ0NZQR/IMG-7342.png" class="h-8 me-3" alt="NotReal003" />
              <span class="self-center text-2xl font-semibold whitespace-nowrap dark:text-white hover:underline">NotReal003</span>
            </a>
          </div>
          <div class="grid grid-cols-2 gap-8 sm:gap-6 sm:grid-cols-3">
            <div>
              <h2 class="mb-4 text-sm font-semibold text-gray-400 uppercase dark:text-white">Resources</h2>
              <ul class="text-gray-500 dark:text-gray-400 font-medium">
              <li class="mt-2 mb-2">
                <a href="https://support.notreal003.org" class="hover:underline">Support</a>
              </li>
                <li class="mb-2">
                  <Link to="/about" class="hover:underline">About This Portal</Link>
                </li>
                <li class="mt-2 mb-2">
                  <a href="https://github.com/NotReal003/Requests" class="hover:underline">Frontend Source Code</a>
                </li>
                <li class="mt-2">
                <a href="https://github.com/NotReal003/api" class="hover:underline">Backend Source Code</a>
                </li>
              </ul>
            </div>
            <div>
              <h2 class="mb-4 text-sm font-semibold text-gray-400 uppercase dark:text-white">Follow Us</h2>
              <ul class="text-gray-500 dark:text-gray-400 font-medium">

                <li class="mt-2 mb-2">
                  <a href="https://github.com/NotReal003" class="hover:underline ">Github</a>
                </li>

                <li class="mt-2 mb-2">

                  <a href="https://youtube.com/@notnt77?si=9FVgJdCAoYPsJjTB" class="hover:underline">YouTube</a>
                </li>
                <li class="mt-2 mb-2">

                  <a href="https://twitter.com/NotNT77" class="hover:underline">Twitter</a>

                </li>

                <li class="mt-2">
                  <a href="https://youtube.com/@notnt77?si=9FVgJdCAoYPsJjTB" class="hover:underline">Discord</a>
                </li>

              </ul>
            </div>
            <div>
              <h2 class="mb-6 text-sm font-semibold text-gray-400 uppercase dark:text-white">Important</h2>
              <ul class="text-gray-500 dark:text-gray-400 font-medium">
                <li class="mb-4">
                  <a href="https://support.notreal003.org/privacy" class="hover:underline">Privacy Policy</a>
                </li>
                <li class="mb-4">
                  <a href="https://support.notreal003.org/terms" class="hover:underline">Terms of Service</a>
                </li>
                <li class="mb-4">
                  <a href="https://pay.notreal003.org" class="hover:underline">Support This Project</a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <hr class="my-6 border-gray-200 sm:mx-auto dark:border-gray-700 lg:my-8" />
        <div class="sm:flex sm:items-center sm:justify-between">
          <span class="text-sm text-gray-500 sm:text-center dark:text-gray-400">© 2025 <a href="https://notreal003.org" class="hover:underline">NotReal003</a>. All Rights Reserved.
          </span>
          <div class="flex mt-4 sm:justify-center sm:mt-0">
            <a href="https://notreal003.org/discord" class="text-gray-500 hover:text-gray-900 dark:hover:text-white ms-5">
              <svg class="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 21 16">
                <path d="M16.942 1.556a16.3 16.3 0 0 0-4.126-1.3 12.04 12.04 0 0 0-.529 1.1 15.175 15.175 0 0 0-4.573 0 11.585 11.585 0 0 0-.535-1.1 16.274 16.274 0 0 0-4.129 1.3A17.392 17.392 0 0 0 .182 13.218a15.785 15.785 0 0 0 4.963 2.521c.41-.564.773-1.16 1.084-1.785a10.63 10.63 0 0 1-1.706-.83c.143-.106.283-.217.418-.33a11.664 11.664 0 0 0 10.118 0c.137.113.277.224.418.33-.544.328-1.116.606-1.71.832a12.52 12.52 0 0 0 1.084 1.785 16.46 16.46 0 0 0 5.064-2.595 17.286 17.286 0 0 0-2.973-11.59ZM6.678 10.813a1.941 1.941 0 0 1-1.8-2.045 1.93 1.93 0 0 1 1.8-2.047 1.919 1.919 0 0 1 1.8 2.047 1.93 1.93 0 0 1-1.8 2.045Zm6.644 0a1.94 1.94 0 0 1-1.8-2.045 1.93 1.93 0 0 1 1.8-2.047 1.918 1.918 0 0 1 1.8 2.047 1.93 1.93 0 0 1-1.8 2.045Z" />
              </svg>
              <span class="sr-only">Discord Server</span>
            </a>
            <a href="https://x.com/NotNT77" class="text-gray-500 hover:text-gray-900 dark:hover:text-white ms-5">
              <svg class="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 17">
                <path fill-rule="evenodd" d="M20 1.892a8.178 8.178 0 0 1-2.355.635 4.074 4.074 0 0 0 1.8-2.235 8.344 8.344 0 0 1-2.605.98A4.13 4.13 0 0 0 13.85 0a4.068 4.068 0 0 0-4.1 4.038 4 4 0 0 0 .105.919A11.705 11.705 0 0 1 1.4.734a4.006 4.006 0 0 0 1.268 5.392 4.165 4.165 0 0 1-1.859-.5v.05A4.057 4.057 0 0 0 4.1 9.635a4.19 4.19 0 0 1-1.856.07 4.108 4.108 0 0 0 3.831 2.807A8.36 8.36 0 0 1 0 14.184 11.732 11.732 0 0 0 6.291 16 11.502 11.502 0 0 0 17.964 4.5c0-.177 0-.35-.012-.523A8.143 8.143 0 0 0 20 1.892Z" clip-rule="evenodd" />
              </svg>
              <span class="sr-only">Twitter page</span>
            </a>
            <a href="https://github.com/NotReal003" class="text-gray-500 hover:text-gray-900 dark:hover:text-white ms-5">
              <svg class="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 .333A9.911 9.911 0 0 0 6.866 19.65c.5.092.678-.215.678-.477 0-.237-.01-1.017-.014-1.845-2.757.6-3.338-1.169-3.338-1.169a2.627 2.627 0 0 0-1.1-1.451c-.9-.615.07-.6.07-.6a2.084 2.084 0 0 1 1.518 1.021 2.11 2.11 0 0 0 2.884.823c.044-.503.268-.973.63-1.325-2.2-.25-4.516-1.1-4.516-4.9A3.832 3.832 0 0 1 4.7 7.068a3.56 3.56 0 0 1 .095-2.623s.832-.266 2.726 1.016a9.409 9.409 0 0 1 4.962 0c1.89-1.282 2.717-1.016 2.717-1.016.366.83.402 1.768.1 2.623a3.827 3.827 0 0 1 1.02 2.659c0 3.807-2.319 4.644-4.525 4.889a2.366 2.366 0 0 1 .673 1.834c0 1.326-.012 2.394-.012 2.72 0 .263.18.572.681.475A9.911 9.911 0 0 0 10 .333Z" clip-rule="evenodd" />
              </svg>
              <span class="sr-only">GitHub account</span>
            </a>
          </div>
        </div>
        <div className="flex justify-center mt-6">
          <a
            href="https://producthunt.com/posts/request-managemen-portal?embed=true&utm_source=badge-featured&utm_medium=badge&utm_souce=badge-request&#0045;managemen&#0045;portal"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=780187&theme=light&t=1736846709096"
              alt="Request&#0032;Managemen&#0032;Portal - A&#0032;comprehensive&#0032;platform&#0032;for&#0032;submitting&#0032;and&#0032;managing&#0032;request | Product Hunt"
              style={{ width: '250px', height: '54px' }}
              width="250"
              height="54"
            />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
