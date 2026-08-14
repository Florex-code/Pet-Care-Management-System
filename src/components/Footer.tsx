import { FacebookLogo, InstagramLogo, LinkedinLogo, MapPin, Phone, Envelope } from "@phosphor-icons/react/dist/ssr";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="footer" id="contact">
      <div className="container footer__grid">
        <div className="footer__brand"><Logo light /><p>Making pet care simpler, warmer, and better connected.</p><div className="socials"><a href="#instagram" aria-label="Instagram"><InstagramLogo /></a><a href="#facebook" aria-label="Facebook"><FacebookLogo /></a><a href="#linkedin" aria-label="LinkedIn"><LinkedinLogo /></a></div></div>
        <div><h3>Explore</h3><a href="#home">Home</a><a href="#about">About us</a><a href="#services">Services</a><a href="#adoption">Adoption</a></div>
        <div><h3>Services</h3><a href="#services">Veterinary care</a><a href="#services">Vaccinations</a><a href="#services">Medical records</a><a href="#adoption">Pet adoption</a></div>
        <div><h3>Get in touch</h3><span><Envelope /> hello@pawcare.com</span><span><Phone /> +234 800 PAW CARE</span><span><MapPin /> Lagos, Nigeria</span></div>
      </div>
      <div className="container footer__bottom"><p>© {new Date().getFullYear()} PawCare. All rights reserved.</p><div><a href="#privacy">Privacy</a><a href="#terms">Terms</a></div></div>
    </footer>
  );
}
