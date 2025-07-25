'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { FiMenu, FiLogOut } from 'react-icons/fi';
import { MdDashboard } from 'react-icons/md';
import { FaDatabase, FaBoxes } from 'react-icons/fa';
import { AiOutlinePlusCircle, AiOutlineInfoCircle } from 'react-icons/ai';
import { PiWarehouseFill } from "react-icons/pi";
import { BiTransferAlt } from 'react-icons/bi';
import { SiGoogleforms } from 'react-icons/si';
import styles from './Sidebar.module.css'; // assuming styles are handled separately

// Route Configuration Object
const sidebarRoutes = [
  { href: '/', label: 'Dashboard', icon: MdDashboard },
  { href: '/ims', label: 'IMS Master', icon: FaDatabase },
  { href: '/live-stock', label: 'Live Stock', icon: FaBoxes },
  { href: '/add-items', label: 'Add Item', icon: AiOutlinePlusCircle },
  { href: '/inventory-entry', label: 'In - Out', icon: BiTransferAlt },
  { href: '/inventory-form-responses', label: 'Stock entries', icon: SiGoogleforms },
  { href: '/damage-material-form', label: 'Damage', icon: BiTransferAlt },
  { href: '/damage-material-form-responses', label: 'Damage Entries', icon: SiGoogleforms },
  { href: '/stores', label: 'Stores', icon: PiWarehouseFill },
  // Optional extras:
  // { href: '/about', label: 'About', icon: AiOutlineInfoCircle },
  // { href: '/logout', label: 'Log out', icon: FiLogOut },
];

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close drawer on larger screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      {/* Hamburger button */}
      <button
        aria-label="Toggle navigation"
        className={`${styles.hamburger} ${open ? styles.hamburgerOpen : ''}`}
        onClick={() => setOpen(!open)}
      >
        <FiMenu />
      </button>

      {/* Mobile backdrop */}
      {open && <div className={styles.backdrop} onClick={() => setOpen(false)} />}

      {/* Sidebar drawer */}
      <aside className={`${styles.sidebar} ${open ? styles.show : ''}`}>
        <h2 className={styles.logo}>H.R. Exports</h2>

        <nav className={styles.nav}>
          {sidebarRoutes.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`${styles.link} ${pathname === href ? styles.active : ''}`}
              onClick={() => setOpen(false)} // auto-close on click (mobile)
            >
              <Icon size={20} /> {label}
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
}
