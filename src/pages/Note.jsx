import { useEffect, useState } from 'react';

const Note = () => {
  const [text, setText] = useState('');

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const textFromUrl = urlParams.get('text');
    if (textFromUrl) {
      setText(textFromUrl);
    }
  }, []);

  return (
    <div>
      <p>{text}</p>
    </div>
  );
}

export default Note;
