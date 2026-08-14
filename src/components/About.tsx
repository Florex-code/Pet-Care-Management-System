import { ArrowRight, Check } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";

export function About() {
  return (
    <section className="section about" id="about">
      <div className="container about__grid">
        <div className="about__visual">
          <div className="about__image"><Image src="/images/hero-pets.png" alt="Pets relaxing in a warm and comfortable home" fill sizes="(max-width: 800px) 100vw, 48vw" /></div>
          <div className="about__badge"><strong>5+</strong><span>years of<br />loving care</span></div>
        </div>
        <div className="about__content">
          <span className="eyebrow">Why choose PawCare</span>
          <h2>Because every pet deserves <span>exceptional care.</span></h2>
          <p>We make pet care simpler, more connected, and less stressful. Everything you need is organized around the unique life of your companion.</p>
          <ul className="check-list">
            <li><Check weight="bold" /> All your pet&apos;s information in one place</li>
            <li><Check weight="bold" /> Helpful reminders when they matter</li>
            <li><Check weight="bold" /> Built for loving pet parents</li>
          </ul>
          <a className="button button--dark" href="#get-started">Discover PawCare <ArrowRight /></a>
        </div>
      </div>
    </section>
  );
}
