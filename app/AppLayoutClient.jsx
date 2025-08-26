'use client';

import { usePathname } from 'next/navigation';
import Sidebar from './components/Sidebar';
import styles from './Layout.module.css';
import Topbar from './components/Topbar';

export default function AppLayoutClient({ children }) {
  const pathname = usePathname();

  // Define all routes where you want to hide the sidebar
  const hideSidebarRoutes = ['/login', '/unauthorized'];
  const hideSidebar = hideSidebarRoutes.includes(pathname); 

  return (
    <>
      <div style={{ display: 'flex', height: '100vh' }}>
        {!hideSidebar && <Sidebar />}
        <main className={styles.mainContent}>
          {!hideSidebar && <Topbar />}
          {children}
        </main>
      </div>
    </>
  );
}
