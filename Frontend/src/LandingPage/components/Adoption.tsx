"use client";

import { ArrowRight, Heart } from "@phosphor-icons/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { seed } from "@/Data/store";
import { getPublicAdoptions } from "@/shared/api/dashboard";
import { loadFavoritePets, toggleFavoritePet } from "@/shared/favorites";

export function Adoption() {
  const [pets, setPets] = useState(seed.adoptions.slice(0, 3));
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    setFavorites(loadFavoritePets());
    getPublicAdoptions().then((items) => setPets(items.slice(0, 3))).catch(() => undefined);
  }, []);

  return (
    <section className="section adoption" id="adoption">
      <div className="container">
        <div className="section-heading-row">
          <div className="section-heading">
            <span className="eyebrow">Find your new best friend</span>
            <h2>Ready to meet <span>the one?</span></h2>
            <p>These lovely companions are waiting for a place to call home.</p>
          </div>
          <Link className="button button--outline" href="/adoption">View all pets <ArrowRight /></Link>
        </div>
        <div className="pet-grid" id="all-pets">
          {pets.map((pet, index) => {
            const favorite = favorites.includes(pet.id);
            return (
              <article className="pet-card" key={pet.id}>
                <div
                  className={`pet-card__visual ${["peach", "sage", "lilac"][index % 3]}`}
                  style={pet.photo ? { backgroundImage: `url(${pet.photo})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
                >
                  {!pet.photo && <span role="img" aria-label={pet.breed}>{pet.species === "Cat" ? "🐈" : "🐕"}</span>}
                  <button
                    type="button"
                    aria-label={`${favorite ? "Remove" : "Save"} ${pet.name}`}
                    aria-pressed={favorite}
                    onClick={() => setFavorites((current) => toggleFavoritePet(current, pet.id))}
                  >
                    <Heart weight={favorite ? "fill" : "regular"} />
                  </button>
                </div>
                <div className="pet-card__body"><div><h3>{pet.name}</h3><p>{pet.breed}</p></div><span>{pet.age}</span></div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
