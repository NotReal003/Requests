import axios from 'axios';
import { useEffect } from 'react';

const PerformanceSender = () => {
  useEffect(() => {
    import('web-vitals').then(({ getCLS, getFID, getLCP, getFCP, getTTFB, getINP }) => {
      const send = (metric) => {
        axios.post('https://api.notreal003.org/performance', metric, {
          headers: {
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }).catch(err => {
          console.warn("Failed to send metric:", err);
        });
      };
      getCLS(send);
      getFID(send);
      getLCP(send);
      getFCP(send);
      getTTFB(send);
      getINP?.(send);
    });
  }, []);

  return null;
};

export default PerformanceSender;
