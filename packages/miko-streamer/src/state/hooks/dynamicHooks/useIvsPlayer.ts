import { useEffect, useState } from 'react';

export const useIvsPlayer = () => {
  const [IVSPlayer, setIVSPlayer] = useState(window.IVSPlayer);

  useEffect(() => {
    //  @ts-ignore
    const interval = setInterval(() => {
      // 처음부터 있을 경우
      if (IVSPlayer) return clearInterval(interval);
      // 로딩 완료되면 set
      if (window.IVSPlayer) {
        setIVSPlayer(window.IVSPlayer);
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return IVSPlayer;
};
