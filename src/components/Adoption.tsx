import { ArrowRight, Heart } from "@phosphor-icons/react/dist/ssr";

const pets = [
  { name: "Milo", kind: "Golden retriever", age: "2 years", emoji: "🐕", tone: "peach" },
  { name: "Luna", kind: "British shorthair", age: "1 year", emoji: "🐈", tone: "sage" },
  { name: "Coco", kind: "Beagle mix", age: "3 years", emoji: "🐶", tone: "lilac" },
];

export function Adoption() {
  return (
    <section className="section adoption" id="adoption">
      <div className="container">
        <div className="section-heading-row">
          <div className="section-heading"><span className="eyebrow">Find your new best friend</span><h2>Ready to meet <span>the one?</span></h2><p>These lovely companions are waiting for a place to call home.</p></div>
          <a className="button button--outline" href="#all-pets">View all pets <ArrowRight /></a>
        </div>
        <div className="pet-grid" id="all-pets">
          {pets.map((pet) => (
            <article className="pet-card" key={pet.name}>
              <div className={`pet-card__visual ${pet.tone}`}><span role="img" aria-label={pet.kind}>{pet.emoji}</span><button type="button" aria-label={`Save ${pet.name}`}><Heart weight="fill" /></button></div>
              <div className="pet-card__body"><div><h3>{pet.name}</h3><p>{pet.kind}</p></div><span>{pet.age}</span></div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
