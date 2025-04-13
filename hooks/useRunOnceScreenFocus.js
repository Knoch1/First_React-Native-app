import { useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';

const useRunOnceOnScreenFocus =  (callback) => {
  const hasRun = useRef(false);

  useFocusEffect(() => {
    if (!hasRun.current) {
      callback();
      hasRun.current = true;
    }
  });
};

export default useRunOnceOnScreenFocus;