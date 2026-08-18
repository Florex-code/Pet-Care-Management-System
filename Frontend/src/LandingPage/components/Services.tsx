import { ArrowUpRight, FirstAid, FolderOpen, ShieldCheck, UsersThree } from "@phosphor-icons/react/dist/ssr";

const services = [
  { icon: FirstAid, title: "Veterinary care", text: "Book trusted professionals and keep every appointment stress-free." },
  { icon: ShieldCheck, title: "Vaccination tracking", text: "Never miss an important vaccine with timely, helpful reminders." },
  { icon: FolderOpen, title: "Medical records", text: "Keep your pet's complete health history safe and easy to find." },
  { icon: UsersThree, title: "Pet adoption", text: "Meet loving pets looking for a safe and caring forever home." },
];

export function Services() {
  return (
    <section className="section services" id="services">
      <div className="container">
        <div className="section-heading section-heading--center">
          <span className="eyebrow">What we do</span>
          <h2>All the care they need,<br /><span>all in one place.</span></h2>
          <p>Simple tools and trusted support for every stage of your pet&apos;s life.</p>
        </div>
        <div className="service-grid">
          {services.map(({ icon: Icon, title, text }, index) => (
            <article className="service-card" key={title}>
              <span className={`service-card__icon tone-${index + 1}`}><Icon weight="duotone" aria-hidden="true" /></span>
              <h3>{title}</h3><p>{text}</p>
              <a href="#get-started" aria-label={`Learn more about ${title}`}>Learn more <ArrowUpRight aria-hidden="true" /></a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
