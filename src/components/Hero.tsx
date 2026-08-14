import { ArrowRight, CheckCircle, Heart } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";

export function Hero() {
  return (
    <section className="hero" id="home">
      <div className="container hero__grid">
        <div className="hero__content">
          <span className="eyebrow"><Heart weight="fill" aria-hidden="true" /> Care that feels like family</span>
          <h1>Better care for your <span>best friend.</span></h1>
          <p className="hero__copy">Everything your pet needs, thoughtfully organized in one place—from everyday wellness to lifelong health records.</p>
          <div className="hero__actions">
            <a className="button" href="#get-started">Start caring better <ArrowRight aria-hidden="true" /></a>
            <a className="button button--outline" href="#services">Explore our services</a>
          </div>
          <div className="hero__trust" aria-label="Service benefits">
            <span><CheckCircle weight="fill" /> Easy to use</span>
            <span><CheckCircle weight="fill" /> Always secure</span>
          </div>
        </div>
        <div className="hero__visual">
          <div className="hero__image-wrap">
            <Image src="/images/hero-pets.png" alt="A happy golden retriever and tabby cat sitting together at home" fill priority sizes="(max-width: 900px) 100vw, 48vw" />
          </div>
          <div className="floating-card floating-card--top"><span className="floating-icon">♥</span><span><strong>Healthy & happy</strong><small>Care made simple</small></span></div>
          <div className="floating-card floating-card--bottom"><span className="avatar-stack"><i>🐶</i><i>🐱</i><i>🐾</i></span><span><strong>2,000+</strong><small>pets cared for</small></span></div>
        </div>
      </div>
    </section>
  );
}
