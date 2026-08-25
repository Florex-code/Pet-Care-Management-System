"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle,
  Heart,
  MagnifyingGlass,
  PawPrint,
} from "@phosphor-icons/react";
import { Footer } from "@/shared/components/Footer";
import { Navbar } from "@/shared/components/Navbar";
import { SESSION_KEY } from "@/Data/store";
import type { Adoption, User } from "@/Data/types";
import { ApiError } from "@/shared/api/client";
import { getPublicAdoptions, requestAdoption as submitAdoption } from "@/shared/api/dashboard";
import { loadFavoritePets, toggleFavoritePet } from "@/shared/favorites";
import styles from "./AdoptionPage.module.css";
import adminStyles from "./AdoptionAdmin.module.css";

const petDetails: Record<
  string,
  { gender: string; location: string; description: string }
> = {
  "adopt-1": {
    gender: "Male",
    location: "Lagos shelter",
    description:
      "A cheerful companion who enjoys walks, playtime, and meeting new people.",
  },
  "adopt-2": {
    gender: "Female",
    location: "Lagos shelter",
    description:
      "A gentle, curious cat who loves quiet afternoons and comfortable laps.",
  },
};

export function AdoptionPage() {
  const router = useRouter();
  const [adoptions, setAdoptions] = useState<Adoption[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [species, setSpecies] = useState("All");
  const [selected, setSelected] = useState<Adoption | null>(null);
  const [notice, setNotice] = useState("");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    const raw = localStorage.getItem(SESSION_KEY);
    setCurrentUser(raw ? JSON.parse(raw) : null);
    setFavorites(loadFavoritePets());
    getPublicAdoptions()
      .then(setAdoptions)
      .catch(() => setNotice("Couldn’t load available pets. Please try again."))
      .finally(() => setLoading(false));
  }, []);
  const pets = useMemo(
    () =>
      adoptions.filter((pet) => {
        const matchesSpecies = species === "All" || pet.species === species;
        const term = query.trim().toLowerCase();
        return (
          matchesSpecies &&
          (!term ||
            `${pet.name} ${pet.species} ${pet.breed}`
              .toLowerCase()
              .includes(term))
        );
      }),
    [adoptions, query, species],
  );

  async function requestAdoption(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) {
      router.push("/login");
      return;
    }
    const user = JSON.parse(raw) as User;
    if (user.role !== "owner") {
      setNotice(
        "Adoption requests must be submitted from a pet-owner account.",
      );
      return;
    }
    if (!selected) return;
    const form = new FormData(event.currentTarget);
    try {
      await submitAdoption(selected.id, String(form.get("message")));
      setAdoptions((items) => items.filter((pet) => pet.id !== selected.id));
      setSelected(null);
      setNotice("Your adoption request was submitted successfully.");
    } catch (caught) {
      setNotice(caught instanceof ApiError ? caught.message : "Couldn’t submit the request. Please try again.");
    }
  }

  return (
    <>
      <Navbar />
      <main className={styles.page}>
        <section className={styles.intro}>
          <div className="container">
            <span className="eyebrow">
              <Heart weight="fill" /> Find your companion
            </span>
            <h1>
              Pets waiting for a <span>loving home.</span>
            </h1>
            <p>
              Meet every pet currently in PawCare&apos;s adoption programme and
              start your application when you find the right match.
            </p>
          </div>
        </section>
        <section className={styles.catalogue}>
          <div className="container">
            <div className={styles.filters}>
              <label>
                <MagnifyingGlass />
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search name, breed, or species"
                  aria-label="Search available pets"
                />
              </label>
              <div>
                {["All", "Dog", "Cat"].map((item) => (
                  <button
                    key={item}
                    className={species === item ? styles.active : ""}
                    onClick={() => setSpecies(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
            <div className={styles.resultHead}>
              <div>
                <h2>Available pets</h2>
                <span>
                  {pets.length} {pets.length === 1 ? "pet" : "pets"}
                </span>
              </div>
              {currentUser?.role === "admin" ? (
                <div className={adminStyles.manageNotice}>
                  <strong>Administrator controls</strong>
                  <small><Link href="/dashboard">Open the dashboard to manage listings and requests.</Link></small>
                </div>
              ) : (
                <Link className={adminStyles.manageLink} href="/login">
                  Administrator? Manage pet photos
                </Link>
              )}
            </div>
            {loading ? (
              <div className={styles.empty}><PawPrint /><p>Loading available pets…</p></div>
            ) : pets.length ? (
              <div className={styles.grid}>
                {pets.map((pet, index) => {
                  const detail = petDetails[pet.id] || {
                    gender: "Unknown",
                    location: "PawCare shelter",
                    description:
                      "A loving companion ready to meet their future family.",
                  };
                  return (
                    <article className={styles.card} key={pet.id}>
                      <div
                        className={`${styles.visual} ${styles[`tone${index % 3}`]}`}
                        style={
                          pet.photo
                            ? {
                                backgroundImage: `url(${pet.photo})`,
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                              }
                            : undefined
                        }
                      >
                        {!pet.photo && <PawPrint weight="duotone" />}
                        <button
                          type="button"
                          className={styles.favorite}
                          aria-label={`${favorites.includes(pet.id) ? "Remove" : "Save"} ${pet.name}`}
                          aria-pressed={favorites.includes(pet.id)}
                          onClick={() => setFavorites((current) => toggleFavoritePet(current, pet.id))}
                        >
                          <Heart weight={favorites.includes(pet.id) ? "fill" : "regular"} />
                        </button>
                        <span>{pet.status}</span>
                      </div>
                      <div className={styles.body}>
                        <div>
                          <h3>{pet.name}</h3>
                          <p>
                            {pet.breed} · {pet.age}
                          </p>
                        </div>
                        <dl>
                          <div>
                            <dt>Species</dt>
                            <dd>{pet.species}</dd>
                          </div>
                          <div>
                            <dt>Gender</dt>
                            <dd>{detail.gender}</dd>
                          </div>
                          <div>
                            <dt>Location</dt>
                            <dd>{detail.location}</dd>
                          </div>
                        </dl>
                        <p>{detail.description}</p>
                        <button
                          disabled={pet.status !== "Available"}
                          onClick={() => setSelected(pet)}
                        >
                          {pet.status === "Available"
                            ? "Meet & apply"
                            : "Application pending"}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className={styles.empty}>
                <PawPrint />
                <h3>No matching pets</h3>
                <p>Try another search or remove a filter.</p>
              </div>
            )}
          </div>
        </section>
        {notice && (
          <div className={styles.toast}>
            <CheckCircle weight="fill" />
            {notice}
            <button onClick={() => setNotice("")}>×</button>
          </div>
        )}
        {selected && (
          <div
            className={styles.backdrop}
            onMouseDown={(event) =>
              event.target === event.currentTarget && setSelected(null)
            }
          >
            <section className={styles.modal} role="dialog" aria-modal="true">
              <button
                className={styles.close}
                onClick={() => setSelected(null)}
              >
                ×
              </button>
              <Heart weight="duotone" />
              <span>ADOPTION REQUEST</span>
              <h2>Apply to adopt {selected.name}</h2>
              <p>
                You&apos;ll be able to track this request from your owner
                dashboard. PawCare will contact you to arrange the next steps.
              </p>
              <form onSubmit={requestAdoption}>
                <label>
                  Why would {selected.name} be a good fit for your home?
                  <textarea name="message" required minLength={20} />
                </label>
                <label className={styles.agree}>
                  <input type="checkbox" required /> I understand that
                  submitting a request does not guarantee approval.
                </label>
                <button>Submit request</button>
              </form>
            </section>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
