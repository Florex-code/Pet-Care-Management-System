"use client";
import { ArrowRight, Heart } from "@phosphor-icons/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { loadStore, seed } from "@/Data/store";

export function Adoption() {
  const [pets, setPets] = useState(seed.adoptions);
  useEffect(() => { setPets(loadStore().adoptions.slice(0, 3)); }, []);
  return (
    <section className="section adoption" id="adoption">
      <div className="container">
        <div className="section-heading-row">
          <div className="section-heading"><span className="eyebrow">Find your new best friend</span><h2>Ready to meet <span>the one?</span></h2><p>These lovely companions are waiting for a place to call home.</p></div>
          <Link className="button button--outline" href="/adoption">View all pets <ArrowRight /></Link>
        </div>
        <div className="pet-grid" id="all-pets">
          {pets.map((pet, index) => (
            <article className="pet-card" key={pet.id}>
              <div className={`pet-card__visual ${["peach", "sage", "lilac"][index % 3]}`} style={pet.photo ? { backgroundImage: `url(${pet.photo})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}>{!pet.photo && <span role="img" aria-label={pet.breed}>{pet.species === "Cat" ? "🐈" : "🐕"}</span>}<button type="button" aria-label={`Save ${pet.name}`}><Heart weight="fill" /></button></div>
              <div className="pet-card__body"><div><h3>{pet.name}</h3><p>{pet.breed}</p></div><span>{pet.age}</span></div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
