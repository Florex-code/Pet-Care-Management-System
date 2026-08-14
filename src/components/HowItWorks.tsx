import { Heartbeat, PawPrint, UserPlus } from "@phosphor-icons/react/dist/ssr";

const steps = [
  { number: "01", icon: UserPlus, title: "Create your account", text: "Join PawCare in just a few quick steps." },
  { number: "02", icon: PawPrint, title: "Add your pet", text: "Build a profile with the details that matter." },
  { number: "03", icon: Heartbeat, title: "Manage their care", text: "Stay on top of health, visits, and records." },
];

export function HowItWorks() {
  return (
    <section className="section how" id="get-started">
      <div className="container">
        <div className="section-heading section-heading--center"><span className="eyebrow">Simple by design</span><h2>Great pet care in <span>three easy steps.</span></h2></div>
        <div className="steps">
          {steps.map(({ number, icon: Icon, title, text }, index) => (
            <article className="step" key={title}>
              <span className="step__number">{number}</span>
              <span className="step__icon"><Icon weight="duotone" /></span>
              <h3>{title}</h3><p>{text}</p>
              {index < steps.length - 1 && <span className="step__line" aria-hidden="true" />}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
