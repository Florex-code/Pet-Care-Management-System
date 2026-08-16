import { FacebookLogo, InstagramLogo, LinkedinLogo, MapPin, Phone, Envelope } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__grid">
        <div className="footer__brand"><Logo light /><p>Making pet care simpler, warmer, and better connected.</p><div className="socials"><a href="#instagram" aria-label="Instagram"><InstagramLogo /></a><a href="#facebook" aria-label="Facebook"><FacebookLogo /></a><a href="#linkedin" aria-label="LinkedIn"><LinkedinLogo /></a></div></div>
        <div><h3>Explore</h3><Link href="/">Home</Link><Link href="/#about">About us</Link><Link href="/#services">Services</Link><Link href="/#adoption">Adoption</Link></div>
        <div><h3>Services</h3><Link href="/#services">Veterinary care</Link><Link href="/#services">Vaccinations</Link><Link href="/dashboard">Medical records</Link><Link href="/#adoption">Pet adoption</Link></div>
        <div><h3>Get in touch</h3><a href="mailto:hello@pawcare.com"><Envelope /> hello@pawcare.com</a><a href="tel:+2348007292273"><Phone /> +234 800 PAW CARE</a><Link href="/contact"><MapPin /> Lagos, Nigeria</Link></div>
      </div>
      <div className="container footer__bottom"><p>© {new Date().getFullYear()} PawCare. All rights reserved.</p><div><a href="#privacy">Privacy</a><a href="#terms">Terms</a></div></div>
    </footer>
  );
}
