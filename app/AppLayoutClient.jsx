'use client';

import { usePathname } from 'next/navigation';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import styles from './Layout.module.css';

export default function AppLayoutClient({ children }) {
  const pathname = usePathname();
  const hideSidebarRoutes = ['/login', '/unauthorized'];
  const hideSidebar = hideSidebarRoutes.includes(pathname);

  return (
    <div className={`${styles.shell} ${hideSidebar ? styles.noSidebar : ''}`}>
      {!hideSidebar && <Sidebar />}

      <div className={styles.mainArea}>
        {!hideSidebar && <Topbar />}

        {/* main landmark */}
        <main id="main" className={styles.mainContent} role="main" aria-live="polite">
          {children}
        </main>
      </div>
    </div>
  );
}
