import { useEffect, useState } from 'react';

const Note = () => {
  const [text, setText] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const textFromUrl = urlParams.get('text');
    if (textFromUrl) {
      setText(textFromUrl);
    }
  }, []);

  const handleCopy = () => {
    if (text) {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000); // Reset copied status after 2 seconds
      });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black-100 p-4">
      <div className="bg-white shadow-lg rounded-lg p-6 max-w-md w-full">
        <h1 className="text-2xl font-semibold text-gray-100 mb-4">Your Note</h1>
        <p className="text-gray-200 bg-gray-50 p-4 rounded-md border">{text || 'No text provided.'}</p>
        <button
          onClick={handleCopy}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none"
        >
          {copied ? 'Copied!' : 'Copy Text'}
        </button>
      </div>
    </div>
  );
};

export default Note;
