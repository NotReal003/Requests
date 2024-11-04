import React from 'react';
import { useNavigate } from 'react-router-dom';

const ForSell = () => {
  const navigate = useNavigate();

  const handleAboutClick = () => {
    navigate('/about');
  };

  return (
    <div className="bg-base-100 shadow-lg text-sm p-4 text-center rounded-lg">
      This website and with backend API are for sale. For more information, please{' '}
      <a href="discord:/users/1131271104590270606" className="text-blue-500 hover:underline font-bold">
        Contact Me On Discord
      </a>, if not working, my username on Discord is <strong>notnt77</strong> — add me there :) read more about this system by{' '}
      <button onClick={handleAboutClick} className="text-blue-500 hover:underline font-bold">
        Clicking Here.
      </button>
    </div>
  );
};

export default ForSell;
