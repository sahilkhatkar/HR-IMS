'use client';               // ← needed if you’re on Next 13/14 app router
import { useState, useEffect } from 'react';
import { usePathname, useSearchParams } from "next/navigation";
import Link from 'next/link';
import { FiMenu } from 'react-icons/fi';
import styles from './Sidebar.module.css';

import { MdDashboard } from 'react-icons/md';
import { FaDatabase } from 'react-icons/fa';
import { FaBoxes } from 'react-icons/fa';
import { AiOutlinePlusCircle } from 'react-icons/ai';
import { AiOutlineInfoCircle } from 'react-icons/ai';
import { FiLogOut } from 'react-icons/fi';
import { BiTransferAlt } from "react-icons/bi";
import { BsBoxSeam } from 'react-icons/bs';


export default function Sidebar() {
    const [open, setOpen] = useState(false);

    // ⤵︎ Auto-close the drawer when you resize above the breakpoint
    useEffect(() => {
        const onResize = () => {
            if (window.innerWidth >= 768) setOpen(false);
        };
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    const pathname = usePathname();
    const searchParams = useSearchParams();

    const fullUrl = `${pathname}`;
    console.log(fullUrl);
    // const fullUrl = `${window.location.origin}${pathname}${searchParams ? `?${searchParams.toString()}` : ''}`;


    return (
        <>
            {/* Hamburger */}

            <div className={styles.sidebarContainer}>

                <button
                    aria-label="Toggle navigation"
                    className={`${styles.hamburger} ${open ? styles.hamburgerOpen : ''}`}
                    onClick={() => setOpen(!open)}
                >
                    <FiMenu />
                </button>

                {/* Overlay for mobile */}
                {open && <div className={styles.backdrop} onClick={() => setOpen(false)} />}

                {/* Drawer */}
                <div className={`${styles.sidebar} ${open ? styles.show : ''}`}>
                    <h2 className={styles.logo}>H.R. Exports</h2>
                    <div className="">

                        <nav className={styles.nav}>
                            <Link href="/" className={`${styles.link} ${pathname === "/" ? styles.active : ""}`}><MdDashboard/> Dashboard</Link>
                            <Link href="/ims" className={`${styles.link} ${pathname === "/ims" ? styles.active : ""}`}><FaDatabase/> IMS Master</Link>
                            <Link href="/livestock" className={`${styles.link} ${pathname === "/livestock" ? styles.active : ""}`}><FaBoxes/> Live Stock</Link>
                            <Link href="/additems" className={`${styles.link} ${pathname === "/additems" ? styles.active : ""}`}><AiOutlinePlusCircle /> Add Item</Link>
                            <Link href="/inwardoutward" className={`${styles.link} ${pathname === "/inwardoutward" ? styles.active : ""}`}><BiTransferAlt /> In - Out</Link>
                            <Link href="/form-responses" className={`${styles.link} ${pathname === "/form-responses" ? styles.active : ""}`}><BsBoxSeam size={20} title="Form Responses" /> Stock entries</Link>
                            {/* <Link href="/dailyconsumption" className={`${styles.link} ${pathname === "/dailyconsumption" ? styles.active : ""}`}>Daily</Link> */}
                            <Link href="/about" className={`${styles.link} ${pathname === "/about" ? styles.active : ""}`} style={{marginTop:"5rem"}}><AiOutlineInfoCircle /> About</Link>
                            <Link href="/logout" className={`${styles.link} ${pathname === "/logout" ? styles.active : ""}`}><FiLogOut /> Log out</Link>
                        </nav>

                        {/* <nav className={styles.nav}>
                            <Link href="/" className={`${styles.link} ${pathname === "/logout" ? styles.active : ""}`}>Log out</Link>
                            <Link href="/ims" className={`${styles.link} ${pathname === "/hide" ? styles.active : ""}`}>Hide</Link>
                        </nav> */}
                    </div>
                </div>
            </div>
        </>
    );
}
