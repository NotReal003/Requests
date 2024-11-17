import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaUserCircle } from "react-icons/fa";
import { IoLogIn } from "react-icons/io5";
import { ImExit, ImSpinner6 } from "react-icons/im";
import { MdNavigateNext } from "react-icons/md";
import { LiaExternalLinkAltSolid } from "react-icons/lia";
import axios from 'axios';
import { FcSettings } from "react-icons/fc";
import toast, { Toaster } from "react-hot-toast";

export default function Navbar({ isAuthenticated }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAlert, setShowAlert] = useState(false);
  const [errorIssue, setErrorIssue] = useState('');
  const [logMe, setLogMe] = useState(false);
  const API = process.env.REACT_APP_API;

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);

      try {
        const res = await fetch(`${API}/users/@me`, {
          withCredentials: true,
        });

        if (res.status === 403) {
          axios.get(`https://api.notreal003.xyz/auth/signout`, {
        withCredentials: true,
      });
          setShowAlert(true);
          setErrorIssue('You must be logged in to access this page, please refesh the page and try again.');
        }

        if (!res.ok) {
          const errorData = await res.json();
          setLoading(false);
          setShowAlert(true);
          setErrorIssue(errorData.message || 'A: Connection error between the server and the client :/')
          return;
        }

        const userData = await res.json();
        setUser(userData);
        if (userData.staff === true) {
          toast('Welcome Staff Member');
        }
      } catch (error) {
        console.error(error);
        toast.error('Something went wrong :/');
        setShowAlert(true);
        setErrorIssue('B: Connection error between the server and the client :/');
      }

      setLoading(false);
    };

    if (isAuthenticated) {
      fetchUserData();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, API]);

  const handleLogout = async () => {
    try {
      const res = await axios.get(`https://api.notreal003.xyz/auth/signout`, {
        withCredentials: true,
      });
      if (!res.ok) {
        setLogMe(true);
        setErrorIssue('We are unable to logout you.')
      }

//      if (res.status !== 404) {
//       setErrorIssue(`${status}: Sorry, we are unable to log you out at the moment.`);
//       throw new Error('Failed to logout');
//     }

       document.cookie = 'token=; Max-Age=0; path=/; domain=.notreal003.xyz; secure';
      setLogMe(true);
      setErrorIssue('You have been logged out, please refresh the page to continue.');
    } catch (error) {
      setShowAlert(true);
      console.error(error);
    }
  };

  return (
    <>
      <Toaster />
      {showAlert && (
        <div role="alert" className="alert">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            className="stroke-info h-6 w-6 shrink-0">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span>
            We are unable to verify you: <strong>{errorIssue}</strong>
          </span>
          <div>
            <button className="btn btn-sm btn-outline btn-warning" onClick={() => window.location.reload()}>Reload</button>
          </div>
        </div>
      )}

      {logMe && (
        <div role="alert" className="alert">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            className="stroke-info h-6 w-6 shrink-0">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span>
            <strong>{errorIssue}</strong>
          </span>
          <div>
            <button className="btn btn-sm btn-outline btn-warning" onClick={() => window.location.reload()}>Reload</button>
          </div>
        </div>
      )}

      <nav className="z-20 mb-5">
        <div className="container"></div>

        <div className="drawer drawer-end">
          <input id="my-drawer-3" type="checkbox" className="drawer-toggle" />
          <div className="drawer-content flex flex-col">
            <div className="w-full navbar bg-base-300">
              <Link to="/" className="font-bold text-lg flex-1 px-2 mx-2">
                NotReal003
              </Link>
              <div className="dropdown dropdown-bottom dropdown-end">
                <div tabIndex={0} role="button" className="btn m-1 btn-sm">
                  Display
                  <svg
                    width="12px"
                    height="12px"
                    className="inline-block h-2 w-2 fill-current opacity-60"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 2048 2048">
                    <path d="M1799 349l242 241-1017 1017L7 590l242-241 775 775 775-775z"></path>
                  </svg>
                </div>
                <ul tabIndex={0} className="dropdown-content bg-base-300 rounded-box z-[1] w-52 p-2 shadow-2xl">
                  <li>
                    <input
                      type="radio"
                      name="theme-dropdown"
                      className="theme-controller btn btn-sm btn-block btn-ghost justify-start"
                      aria-label="Auto"
                      value="default" />
                  </li>
                  <li>
                    <input
                      type="radio"
                      name="theme-dropdown"
                      className="theme-controller btn btn-sm btn-block btn-ghost justify-start"
                      aria-label="Dracula"
                      value="dracula" />
                  </li>
                  <li>
                    <input
                      type="radio"
                      name="theme-dropdown"
                      className="theme-controller btn btn-sm btn-block btn-ghost justify-start"
                      aria-label="Aqua"
                      value="aqua" />
                  </li>
                  <li>
                    <input
                      type="radio"
                      name="theme-dropdown"
                      className="theme-controller btn btn-sm btn-block btn-ghost justify-start"
                      aria-label="Night"
                      value="night" />
                  </li>
                </ul>
              </div>

              <div className="dropdown dropdown-bottom dropdown-end">
                <div tabIndex={0} role="button" className="btn m-1 btn-sm flex items-center justify-center"><MdNavigateNext />Requests</div>
                <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
                  <li><Link to="https://notreal003.xyz">Home <LiaExternalLinkAltSolid /></Link></li>
                  <li><Link to="/support">Support</Link></li>
                  <li><Link to="/Report">Discord Report</Link></li>
                  <li><Link to="/apply">Guild Application</Link></li>
                </ul>
              </div>

              {loading ? (
                <div className="flex items-center mr-4">
                  <ImSpinner6 className="animate-spin h-4 w-4" />
                </div>
              ) : (
                <div className="dropdown dropdown-bottom dropdown-end mr-4 ml-2">
                  <button tabIndex={0} className="flex items-center justify-center">
                    {user && user.avatarHash ? (
                      <img
                        src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatarHash}.webp?size=128`}
                        className="size-6 object-cover rounded-full border-blue-500"
                        alt="user"
                      />
                    ) : (
                      <FaUserCircle className="size-6" />
                    )}
                  </button>
                  <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-40">
                    {isAuthenticated ? (
                      <>
                        <li>
                          <Link to="/profile" className="flex items-center gap-x-3">
                            <FcSettings /> Profile
                          </Link>
                        </li>
                        <li>
                          <span onClick={handleLogout} className="flex items-center gap-x-3 hover:text-red-500 cursor-pointer">
                            <ImExit className="size-3" /> <span>Sign out</span>
                          </span>
                        </li>
                      </>
                    ) : (
                      <>
                        <li>
                          <Link to="https://api.notreal003.xyz/auth/signin" className="flex items-center gap-x-2 hover:text-blue-500">
                            <IoLogIn className="size-4" /> <span>Sign in with Discord</span>
                          </Link>
                        </li>
                        <li>
                          <Link to="https://request.notreal003.xyz/email-signin" className="flex items-center gap-x-2 hover:text-blue-500">
                            <IoLogIn className="size-4" /> <span>Sign in with Email</span>
                          </Link>
                        </li>
                      </>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
