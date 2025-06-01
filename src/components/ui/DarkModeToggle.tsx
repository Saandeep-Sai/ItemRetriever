import { useEffect, useState } from 'react';
import styles from './DarkModeToggle.module.css';

export default function DarkModeToggle() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = storedTheme ? storedTheme === 'dark' : prefersDark;
    setEnabled(initialTheme);
    document.documentElement.classList.toggle('dark', initialTheme);
  }, []);

  const toggleTheme = () => {
    const newEnabled = !enabled;
    setEnabled(newEnabled);
    document.documentElement.classList.toggle('dark', newEnabled);
    localStorage.setItem('theme', newEnabled ? 'dark' : 'light');
  };

  return (
    <label className={`${styles.switch} cursor-pointer`}>
      <input
        id="darkModeToggle"
        type="checkbox"
        checked={enabled}
        onChange={toggleTheme}
      />
      <div className={`${styles.slider} ${styles.round}`}>
        <div className={styles['sun-moon']}>
          {['moon-dot-1', 'moon-dot-2', 'moon-dot-3'].map(id => (
            <svg key={id} id={id} className={styles['moon-dot']} viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="50" />
            </svg>
          ))}
          {['light-ray-1', 'light-ray-2', 'light-ray-3'].map(id => (
            <svg key={id} id={id} className={styles['light-ray']} viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="50" />
            </svg>
          ))}
          {['cloud-1', 'cloud-2', 'cloud-3'].map(id => (
            <svg key={id} id={id} className={styles['cloud-dark']} viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="50" />
            </svg>
          ))}
          {['cloud-4', 'cloud-5', 'cloud-6'].map(id => (
            <svg key={id} id={id} className={styles['cloud-light']} viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="50" />
            </svg>
          ))}
        </div>
        <div className={styles.stars}>
          {['star-1', 'star-2', 'star-3', 'star-4'].map(id => (
            <svg key={id} id={id} className={styles.star} viewBox="0 0 20 20">
              <path d="M 0 10 C 10 10,10 10 ,0 10 C 10 10 , 10 10 , 10 20 C 10 10 , 10 10 , 20 10 C 10 10 , 10 10 , 10 0 C 10 10,10 10 ,0 10 Z" />
            </svg>
          ))}
        </div>
      </div>
    </label>
  );
}
