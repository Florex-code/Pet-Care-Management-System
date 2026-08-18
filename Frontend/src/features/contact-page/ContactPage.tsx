import { Clock, Envelope, MapPin, Phone } from "@phosphor-icons/react/dist/ssr";
import { Footer } from "@/shared/components/Footer";
import { Navbar } from "@/shared/components/Navbar";
import { ContactForm } from "./ContactForm";

export function ContactPage() {
  return <><Navbar /><main className="contact-page"><section className="contact-intro"><div className="container"><span className="eyebrow">Contact PawCare</span><h1>How can we help you and your pet?</h1><p>Send us a message or speak with our care team. We will direct your request to the right person.</p></div></section><section className="contact-main"><div className="container contact-layout"><div className="contact-details"><div><span><Envelope /></span><div><h2>Email</h2><a href="mailto:hello@pawcare.com">hello@pawcare.com</a><p>For general questions and account support.</p></div></div><div><span><Phone /></span><div><h2>Phone</h2><a href="tel:+2348007292273">+234 800 PAW CARE</a><p>For appointments and urgent assistance.</p></div></div><div><span><MapPin /></span><div><h2>Visit</h2><p>Lagos, Nigeria</p><p>Contact us before visiting so we can prepare.</p></div></div><div><span><Clock /></span><div><h2>Hours</h2><p>Monday to Friday, 8:00 AM to 6:00 PM</p><p>Saturday, 9:00 AM to 3:00 PM</p></div></div></div><div className="contact-form-wrap"><div><span className="eyebrow">Send a message</span><h2>Tell us what you need</h2></div><ContactForm /></div></div></section></main><Footer /></>;
}
