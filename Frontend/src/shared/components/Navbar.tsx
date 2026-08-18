"use client";

import { List, X } from "@phosphor-icons/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";

const links = [
  ["Services", "/#services"],
  ["Records", "/dashboard"],
  ["Adoption", "/#adoption"],
  ["Contact", "/contact"],
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.classList.toggle("menu-open", open);
    return () => document.body.classList.remove("menu-open");
  }, [open]);

  return (
    <header className="site-header">
      <div className="container nav-wrap">
        <Logo />
        <button className="menu-button" type="button" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} aria-controls="main-navigation" onClick={() => setOpen(!open)}>
          {open ? <X aria-hidden="true" /> : <List aria-hidden="true" />}
        </button>
        <nav id="main-navigation" className={`main-nav ${open ? "is-open" : ""}`} aria-label="Main navigation">
          <div className="nav-links">
            {links.map(([label, href]) => <a key={label} href={href} onClick={() => setOpen(false)}>{label}</a>)}
          </div>
          <div className="nav-actions">
            <Link className="text-link" href="/login" onClick={() => setOpen(false)}>Sign in</Link>
            <Link className="button button--small" href="/register" onClick={() => setOpen(false)}>Get started</Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
