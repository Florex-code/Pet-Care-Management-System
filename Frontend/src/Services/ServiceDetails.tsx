import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle, PawPrint } from "@phosphor-icons/react/dist/ssr";
import { Footer } from "@/shared/components/Footer";
import { Navbar } from "@/shared/components/Navbar";
import { serviceData, type ServiceSlug } from "./serviceData";
import styles from "./ServiceDetails.module.css";

export function ServiceDetails({ slug }: { slug: ServiceSlug }) {
  const service = serviceData[slug]; const Icon = service.icon;
  return <><Navbar /><main className={styles.page}>
    <section className={styles.hero}><div className="container"><Link href="/#services" className={styles.back}><ArrowLeft /> All services</Link><div className={styles.heroGrid}><div><span className="eyebrow">{service.eyebrow}</span><h1>{service.title}</h1><p>{service.summary}</p><Link className="button" href={service.href}>{service.cta}<ArrowRight /></Link></div><div className={styles.heroIcon}><Icon weight="duotone" /></div></div></div></section>
    <section className={styles.content}><div className={`container ${styles.contentGrid}`}><article><span className="eyebrow">About this service</span><h2>Care made clear and manageable.</h2><p>{service.description}</p><div className={styles.includes}><h3>What&apos;s included</h3>{service.includes.map((item)=><div key={item}><CheckCircle weight="fill"/><span>{item}</span></div>)}</div></article><aside><PawPrint weight="duotone"/><h3>Built around your pet</h3><p>Every PawCare service connects to your pet&apos;s profile, keeping important information accurate and easy to find.</p></aside></div></section>
    <section className={styles.process}><div className="container"><div className={styles.heading}><span className="eyebrow">How it works</span><h2>Three simple steps</h2></div><div className={styles.steps}>{service.steps.map(([title,text],index)=><article key={title}><span>0{index+1}</span><h3>{title}</h3><p>{text}</p></article>)}</div><div className={styles.finalCta}><div><h2>Ready to get started?</h2><p>Create or access your PawCare account and take the next step.</p></div><Link className="button" href={service.href}>{service.cta}<ArrowRight/></Link></div></div></section>
  </main><Footer /></>;
}
