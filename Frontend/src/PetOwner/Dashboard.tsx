"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Bell,
  CalendarBlank,
  ChartBar,
  ClipboardText,
  Heart,
  House,
  PawPrint,
  Plus,
  SignOut,
  Stethoscope,
  Users,
  X,
  ArrowRight,
  FirstAid,
  Syringe,
  CaretDown,
  CaretLeft,
  CaretRight,
  CaretDoubleLeft,
  CaretDoubleRight,
  Check,
} from "@phosphor-icons/react";
import { seed, SESSION_KEY } from "@/Data/store";
import { ApiError, AUTH_TOKEN_KEY } from "@/shared/api/client";
import {
  createAppointment,
  createAdoption,
  cancelAppointment,
  createMedicalRecord,
  createPet,
  deletePet,
  getDashboard,
  markNotificationRead,
  requestAdoption,
  rescheduleAppointment,
  reviewAdoption,
  updateAppointmentStatus,
  updateAdoption,
  updatePet,
} from "@/shared/api/dashboard";
import type {
  Appointment,
  Pet,
  Role,
  Store,
  User,
} from "@/Data/types";
import dashboardStyles from "./Dashboard.module.css";
import imageStyles from "./PetImages.module.css";
import homeStyles from "./ReturnHome.module.css";
const styles = { ...dashboardStyles, ...imageStyles };
type View =
  | "overview"
  | "pets"
  | "appointments"
  | "medical"
  | "adoption"
  | "users"
  | "reports"
  | "notifications";
type Modal = "pet" | "appointment" | "record" | "adoption" | null;
const nav: Record<Role, { id: View; label: string; icon: typeof House }[]> = {
  owner: [
    { id: "overview", label: "Dashboard", icon: House },
    { id: "pets", label: "My pets", icon: PawPrint },
    { id: "appointments", label: "Appointments", icon: CalendarBlank },
    { id: "medical", label: "Medical records", icon: ClipboardText },
    { id: "adoption", label: "Adoption", icon: Heart },
    { id: "notifications", label: "Notifications", icon: Bell },
  ],
  vet: [
    { id: "overview", label: "Dashboard", icon: House },
    { id: "appointments", label: "Appointments", icon: CalendarBlank },
    { id: "medical", label: "Medical management", icon: Stethoscope },
    { id: "pets", label: "Patients", icon: PawPrint },
    { id: "notifications", label: "Notifications", icon: Bell },
  ],
  admin: [
    { id: "overview", label: "Dashboard", icon: House },
    { id: "users", label: "Users & vets", icon: Users },
    { id: "pets", label: "Manage pets", icon: PawPrint },
    { id: "appointments", label: "Appointments", icon: CalendarBlank },
    { id: "adoption", label: "Adoption", icon: Heart },
    { id: "reports", label: "Reports", icon: ChartBar },
  ],
};
export function Dashboard() {
  const router = useRouter(),
    [store, setStore] = useState<Store>(seed),
    [user, setUser] = useState<User | null>(null),
    [view, setView] = useState<View>("overview"),
    [modal, setModal] = useState<Modal>(null),
    [ready, setReady] = useState(false),
    [loadError, setLoadError] = useState(""),
    [editing, setEditing] = useState<Pet | null>(null),
    [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null),
    [feedback, setFeedback] = useState<{ text: string; error?: boolean } | null>(null),
    [profileOpen, setProfileOpen] = useState(false);
  useEffect(() => {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) {
      router.replace("/login");
      return;
    }
    setUser(JSON.parse(raw));
    getDashboard()
      .then(setStore)
      .catch((caught) => {
        if (caught instanceof ApiError && caught.status === 401) {
          localStorage.removeItem(SESSION_KEY);
          localStorage.removeItem(AUTH_TOKEN_KEY);
          router.replace("/login");
          return;
        }
        setLoadError("Couldn’t load your dashboard. Check that the backend is running and refresh.");
      })
      .finally(() => setReady(true));
  }, [router]);
  const pets = useMemo(
    () =>
      user?.role === "owner"
        ? store.pets.filter((p) => p.ownerId === user.id)
        : store.pets,
    [store.pets, user],
  );
  const appts = useMemo(
    () =>
      user?.role === "owner"
        ? store.appointments.filter((a) => a.ownerId === user.id)
        : user?.role === "vet"
          ? store.appointments.filter((a) => a.vetId === user.id)
          : store.appointments,
    [store.appointments, user],
  );
  const petName = (id: string) =>
    store.pets.find((p) => p.id === id)?.name || "Unknown";
  const vetName = (id: string) =>
    store.users.find((u) => u.id === id)?.name || "Unassigned";
  const unreadCount = user
    ? store.notices.filter(
        (notice) => notice.userId === user.id && !notice.read,
      ).length
    : 0;
  const nextAppointment = [...appts]
    .filter((appointment) =>
      ["Pending", "Accepted"].includes(appointment.status),
    )
    .sort((a, b) =>
      `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`),
    )[0];
  const upcomingAppts = appts.filter((a) => ["Pending", "Accepted"].includes(a.status));
  const pastAppts = appts.filter((a) => !["Pending", "Accepted"].includes(a.status));
  function showFeedback(text: string, error = false) {
    setFeedback({ text, error });
    window.setTimeout(() => setFeedback(null), 4500);
  }
  async function status(id: string, value: Appointment["status"]) {
    if (value === "Cancelled" && !window.confirm("Cancel this appointment? This cannot be undone.")) return;
    try {
      const persisted = user?.role === "owner" && value === "Cancelled"
        ? await cancelAppointment(id)
        : user?.role === "vet"
          ? await updateAppointmentStatus(id, value)
          : null;
      setStore((s) => ({ ...s, appointments: s.appointments.map((a) => a.id === id ? persisted || { ...a, status: value } : a) }));
      showFeedback(value === "Cancelled" ? "Appointment cancelled." : `Appointment marked ${value.toLowerCase()}.`);
    } catch (caught) {
      showFeedback(caught instanceof ApiError ? caught.message : "Couldn’t update the appointment.", true);
    }
  }
  async function savePet(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user) return;
    const d = new FormData(e.currentTarget),
      file = d.get("photo"),
      photo =
        file instanceof File && file.size
          ? await fileToDataUrl(file)
          : editing?.photo,
      input = {
        name: String(d.get("name")),
        species: String(d.get("species")),
        breed: String(d.get("breed")),
        gender: String(d.get("gender")),
        dob: String(d.get("dob")),
        weight: String(d.get("weight")),
        photo,
        healthStatus: String(d.get("health")),
        allergies: String(d.get("allergies")),
      };
    const p = editing ? await updatePet(editing.id, input) : await createPet(input);
    setStore((s) => ({
      ...s,
      pets: editing
        ? s.pets.map((x) => (x.id === p.id ? p : x))
        : [...s.pets, p],
    }));
    setEditing(null);
    setModal(null);
    setStore(await getDashboard());
  }
  async function removePet(pet: Pet) {
    if (!window.confirm(`Delete ${pet.name}? Their appointments and medical records will also be permanently deleted.`)) return;
    try {
      await deletePet(pet.id);
      setStore((current) => ({
        ...current,
        pets: current.pets.filter((item) => item.id !== pet.id),
        appointments: current.appointments.filter((item) => item.petId !== pet.id),
        records: current.records.filter((item) => item.petId !== pet.id),
      }));
      showFeedback(`${pet.name} was deleted.`);
    } catch (caught) {
      showFeedback(caught instanceof ApiError ? caught.message : "Couldn’t delete the pet.", true);
    }
  }
  async function saveAdoption(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const d = new FormData(e.currentTarget),
      file = d.get("photo"),
      photo =
        file instanceof File && file.size
          ? await fileToDataUrl(file)
          : undefined;
    const adoption = await createAdoption({
      name: String(d.get("name")),
      species: String(d.get("species")),
      breed: String(d.get("breed")),
      age: String(d.get("age")),
      photo,
    });
    setStore((s) => ({ ...s, adoptions: [...s.adoptions, adoption] }));
    setModal(null);
  }
  async function book(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user) return;
    const d = new FormData(e.currentTarget),
      input = {
        petId: String(d.get("pet")),
        vetId: String(d.get("vet")),
        date: String(d.get("date")),
        time: String(d.get("time")),
        reason: String(d.get("reason")),
      };
    try {
      if (editingAppointment) await rescheduleAppointment(editingAppointment.id, input);
      else await createAppointment(input);
      setStore(await getDashboard());
      setModal(null);
      setEditingAppointment(null);
      showFeedback(editingAppointment ? "Appointment rescheduled and sent for review." : "Appointment request submitted.");
    } catch (caught) {
      showFeedback(caught instanceof ApiError ? caught.message : "Couldn’t save the appointment.", true);
    }
  }
  async function record(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user) return;
    const d = new FormData(e.currentTarget),
      input = {
        petId: String(d.get("pet")),
        date: String(d.get("date")),
        diagnosis: String(d.get("diagnosis")),
        treatment: String(d.get("treatment")),
        medication: String(d.get("medication")),
        vaccination: String(d.get("vaccination")),
        notes: String(d.get("notes")),
      };
    await createMedicalRecord(input);
    setStore(await getDashboard());
    setModal(null);
  }
  if (!ready || !user)
    return <div className={styles.loading}>Loading PawCare…</div>;
  if (loadError) return <div className={styles.loading}>{loadError}</div>;
  const stats =
    user.role === "admin"
      ? [
          ["Users", store.users.length],
          ["Pets", store.pets.length],
          ["Appointments", store.appointments.length],
          ["Adoptions", store.adoptions.length],
        ]
      : user.role === "vet"
        ? [
            ["Patients", pets.length],
            ["Appointments", appts.length],
            ["Pending", appts.filter((a) => a.status === "Pending").length],
            ["Records", store.records.length],
          ]
        : [
            ["My pets", pets.length],
            ["Appointments", appts.length],
            ["Vaccines", store.records.filter((r) => r.vaccination).length],
            [
              "Records",
              store.records.filter((r) => pets.some((p) => p.id === r.petId))
                .length,
            ],
          ];
  return (
    <div className={styles.app}>
      <aside className={styles.sidebar}>
        <Link href="/" className={styles.logo} title="Return to public website">
          <PawPrint weight="fill" />
          Paw<strong>Care</strong>
        </Link>
        <Link href="/" className={homeStyles.publicSite}>
          ← Public website
        </Link>
        <small>{user.role} workspace</small>
        <nav>
          {nav[user.role].map((n) => (
            <button
              key={n.id}
              className={view === n.id ? styles.active : ""}
              onClick={() => setView(n.id)}
            >
              <n.icon />
              <span>{n.label}</span>
              {n.id === "notifications" && unreadCount > 0 && (
                <b
                  className={styles.navBadge}
                  aria-label={`${unreadCount} unread`}
                >
                  {unreadCount}
                </b>
              )}
            </button>
          ))}
        </nav>
        <button
          className={styles.logout}
          onClick={() => {
            localStorage.removeItem(SESSION_KEY);
            localStorage.removeItem(AUTH_TOKEN_KEY);
            router.push("/login");
          }}
        >
          <SignOut />
          Sign out
        </button>
      </aside>
      <main className={styles.main}>
        <header>
          <div>
            <p>
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </p>
            <h1>
              {view === "overview"
                ? `Welcome, ${user.name.split(" ")[0]}`
                : nav[user.role].find((n) => n.id === view)?.label}
            </h1>
          </div>
          <Link href="/" className={homeStyles.mobileHome}>
            ← Website
          </Link>
          <button
            className={styles.avatar}
            aria-label="Open account menu"
            aria-expanded={profileOpen}
            aria-controls="account-menu"
            onClick={() => setProfileOpen((open) => !open)}
          >
            {user.name
              .split(" ")
              .map((x) => x[0])
              .slice(0, 2)
              .join("")}
          </button>
          {profileOpen && (
            <div className={styles.profileMenu} id="account-menu">
              <div>
                <span className={styles.profileAvatar}>
                  {user.name
                    .split(" ")
                    .map((part) => part[0])
                    .slice(0, 2)
                    .join("")}
                </span>
                <p>
                  <strong>{user.name}</strong>
                  <small>{user.email}</small>
                </p>
              </div>
              <Link href="/">
                <House /> Public website
              </Link>
              <Link href="/account">
                <Users /> Account settings
              </Link>
              <button
                onClick={() => {
                  localStorage.removeItem(SESSION_KEY);
                  localStorage.removeItem(AUTH_TOKEN_KEY);
                  router.push("/login");
                }}
              >
                <SignOut /> Sign out
              </button>
            </div>
          )}
        </header>
        {view === "overview" && (
          <>
            <section className={styles.hero}>
              <div>
                <span>{user.role.toUpperCase()} WORKSPACE</span>
                <h2>
                  {user.role === "owner"
                    ? "Everything your pets need, in one place."
                    : user.role === "vet"
                      ? "Thoughtful care starts with a clear record."
                      : "A clear view of the whole PawCare system."}
                </h2>
                <p>
                  Review priorities and manage every record from one friendly
                  workspace.
                </p>
              </div>
              <PawPrint weight="duotone" />
            </section>
            {user.role === "owner" && (
              <>
                <div className={styles.quickActions} aria-label="Quick actions">
                  <button onClick={() => setModal("appointment")}>
                    <span>
                      <CalendarBlank weight="duotone" />
                    </span>
                    Book a visit
                  </button>
                  <button onClick={() => setView("medical")}>
                    <span>
                      <FirstAid weight="duotone" />
                    </span>
                    Health records
                  </button>
                  <button onClick={() => setView("pets")}>
                    <span>
                      <PawPrint weight="duotone" />
                    </span>
                    My pets
                  </button>
                  <button onClick={() => setView("adoption")}>
                    <span>
                      <Heart weight="duotone" />
                    </span>
                    Find a friend
                  </button>
                </div>
                <div className={styles.careGrid}>
                  <article className={styles.nextCare}>
                    <header>
                      <span>UP NEXT</span>
                      <CalendarBlank weight="duotone" />
                    </header>
                    {nextAppointment ? (
                      <>
                        <h3>{nextAppointment.reason}</h3>
                        <p>
                          {petName(nextAppointment.petId)} with{" "}
                          {vetName(nextAppointment.vetId)}
                        </p>
                        <div>
                          <strong>
                            {formatAppointmentDate(nextAppointment.date)}
                          </strong>
                          <span>{formatTime(nextAppointment.time)}</span>
                        </div>
                        <button onClick={() => setView("appointments")}>
                          View appointment <ArrowRight />
                        </button>
                      </>
                    ) : (
                      <EmptyState
                        compact
                        title="No visits scheduled"
                        text="Book a checkup whenever your pet needs care."
                        action={
                          <button onClick={() => setModal("appointment")}>
                            Book a visit
                          </button>
                        }
                      />
                    )}
                  </article>
                  <article className={styles.healthPulse}>
                    <header>
                      <span>HEALTH PULSE</span>
                      <Syringe weight="duotone" />
                    </header>
                    <h3>
                      {pets.filter(
                        (pet) => pet.healthStatus.toLowerCase() !== "healthy",
                      ).length || "All"}{" "}
                      {pets.filter(
                        (pet) => pet.healthStatus.toLowerCase() !== "healthy",
                      ).length
                        ? "need attention"
                        : "pets doing well"}
                    </h3>
                    <p>
                      {pets.find(
                        (pet) => pet.healthStatus.toLowerCase() !== "healthy",
                      )?.healthStatus || "No health alerts right now."}
                    </p>
                    <button onClick={() => setView("pets")}>
                      Check pet profiles <ArrowRight />
                    </button>
                  </article>
                </div>
              </>
            )}
            <div className={styles.stats}>
              {stats.map(([l, v]) => (
                <article key={l}>
                  <span>{l}</span>
                  <strong>{v}</strong>
                </article>
              ))}
            </div>
            <Section title="Recent appointments">
              <Appointments
                items={appts.slice(0, 5)}
                petName={petName}
                vetName={vetName}
                role={user.role}
                update={status}
              />
            </Section>
          </>
        )}
        {view === "pets" && (
          <Section
            title={user.role === "owner" ? "My pets" : "Pet profiles"}
            action={
              user.role !== "vet" ? (
                <button
                  onClick={() => {
                    setEditing(null);
                    setModal("pet");
                  }}
                >
                  <Plus />
                  Add pet
                </button>
              ) : undefined
            }
          >
            <div className={styles.cards}>
              {pets.length === 0 && (
                <EmptyState
                  title="No pet profiles yet"
                  text="Add your first pet to start tracking care, appointments, and records."
                  action={
                    user.role !== "vet" ? (
                      <button onClick={() => setModal("pet")}>
                        <Plus /> Add a pet
                      </button>
                    ) : undefined
                  }
                />
              )}
              {pets.map((p) => (
                <article
                  className={`${styles.pet} ${imageStyles.petCard}`}
                  key={p.id}
                >
                  {p.photo ? (
                    <div
                      className={styles.petPhoto}
                      style={{ backgroundImage: `url(${p.photo})` }}
                      role="img"
                      aria-label={`${p.name} identification photo`}
                    />
                  ) : (
                    <div className={imageStyles.petPlaceholder}>
                      <PawPrint weight="duotone" />
                    </div>
                  )}
                  <div className={imageStyles.petInfo}>
                    <h3>{p.name}</h3>
                    <p className={imageStyles.breed}>
                      {p.species} · {p.breed}
                    </p>
                    <div className={imageStyles.details}>
                      <span>
                        <small>Gender</small>
                        {p.gender}
                      </span>
                      <span>
                        <small>Born</small>
                        {formatPetDate(p.dob)}
                      </span>
                      <span>
                        <small>Weight</small>
                        {p.weight}
                      </span>
                    </div>
                    <p className={imageStyles.allergies}>
                      <small>Allergies</small>
                      {p.allergies}
                    </p>
                    <b className={imageStyles.health}>{p.healthStatus}</b>
                  </div>
                  {user.role === "owner" && (
                    <div className={imageStyles.petActions}>
                      <button
                        className={imageStyles.editPet}
                        onClick={() => {
                          setEditing(p);
                          setModal("pet");
                        }}
                      >
                        Edit pet
                      </button>
                      <button className={imageStyles.deletePet} onClick={() => removePet(p)}>
                        Delete
                      </button>
                    </div>
                  )}
                </article>
              ))}
            </div>
          </Section>
        )}
        {view === "appointments" && (
          <Section
            title="Appointment management"
            action={
              user.role === "owner" ? (
                <button onClick={() => setModal("appointment")}>
                  <Plus />
                  Book appointment
                </button>
              ) : undefined
            }
          >
            {upcomingAppts.length > 0 && <h3>Upcoming appointments</h3>}
            <Appointments
              items={upcomingAppts}
              petName={petName}
              vetName={vetName}
              role={user.role}
              update={status}
              reschedule={(appointment) => { setEditingAppointment(appointment); setModal("appointment"); }}
              emptyText={pastAppts.length ? undefined : "Scheduled visits and their status will appear here."}
            />
            {pastAppts.length > 0 && <><h3>Appointment history</h3><Appointments items={pastAppts} petName={petName} vetName={vetName} role={user.role} update={status} /></>}
          </Section>
        )}
        {view === "medical" && (
          <Section
            title="Medical management"
            action={
              user.role === "vet" ? (
                <button onClick={() => setModal("record")}>
                  <Plus />
                  Add record
                </button>
              ) : undefined
            }
          >
            <div className={styles.records}>
              {store.records.filter((r) => pets.some((p) => p.id === r.petId))
                .length === 0 && (
                <EmptyState
                  title="No medical records yet"
                  text="New examinations, treatments, and vaccinations will appear here."
                />
              )}
              {store.records
                .filter((r) => pets.some((p) => p.id === r.petId))
                .map((r) => (
                  <article key={r.id}>
                    <h3>
                      {petName(r.petId)} <time>{r.date}</time>
                    </h3>
                    <dl>
                      <dt>Diagnosis</dt>
                      <dd>{r.diagnosis}</dd>
                      <dt>Treatment</dt>
                      <dd>{r.treatment}</dd>
                      <dt>Medication</dt>
                      <dd>{r.medication}</dd>
                      <dt>Vaccination</dt>
                      <dd>{r.vaccination || "—"}</dd>
                      <dt>Notes</dt>
                      <dd>{r.notes}</dd>
                    </dl>
                  </article>
                ))}
            </div>
          </Section>
        )}
        {view === "adoption" && (
          <Section
            title="Pet adoption"
            action={
              user.role === "admin" ? (
                <button onClick={() => setModal("adoption")}>
                  <Plus />
                  List a pet
                </button>
              ) : undefined
            }
          >
            <div className={styles.cards}>
              {store.adoptions.map((a) => (
                <article className={styles.adopt} key={a.id}>
                  {a.photo ? (
                    <div
                      className={styles.adoptionPhoto}
                      style={{ backgroundImage: `url(${a.photo})` }}
                      role="img"
                      aria-label={a.name}
                    />
                  ) : (
                    <Heart weight="duotone" />
                  )}
                  <h3>{a.name}</h3>
                  <p>
                    {a.breed} · {a.age}
                  </p>
                  <b className={styles.adoptionStatus}>{a.status}</b>
                  {user.role === "admin" && a.status === "Pending" && (
                    <div className={styles.applicantDetails}>
                      <strong>Applicant: {a.applicantName || "Owner"}</strong>
                      {a.requestMessage && <p>{a.requestMessage}</p>}
                    </div>
                  )}
                  {user.role === "admin" && (
                    <AdoptionPhotoInput
                      hasPhoto={Boolean(a.photo)}
                      onSelect={async (file) => {
                        const photo = await fileToDataUrl(file);
                        const updated = await updateAdoption(a.id, { ...a, photo });
                        setStore((s) => ({ ...s, adoptions: s.adoptions.map((x) => x.id === a.id ? updated : x) }));
                      }}
                    />
                  )}
                  {user.role === "owner" && a.status === "Available" && (
                    <button
                      onClick={async () => {
                        await requestAdoption(a.id, `I would like to apply to adopt ${a.name}. Please contact me to discuss the next steps.`);
                        setStore(await getDashboard());
                      }}
                    >
                      Request adoption
                    </button>
                  )}
                  {user.role === "admin" && a.status === "Pending" && (
                    <div className={styles.adoptionActions}>
                      <button
                        onClick={async () => {
                          await reviewAdoption(a.id, "Adopted");
                          setStore(await getDashboard());
                        }}
                      >
                        Approve
                      </button>
                      <button
                        onClick={async () => {
                          await reviewAdoption(a.id, "Available");
                          setStore(await getDashboard());
                        }}
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </article>
              ))}
            </div>
          </Section>
        )}
        {view === "users" && (
          <Section title="Users and veterinarians">
            <Table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {store.users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>{u.role}</td>
                    <td>
                      <Badge text={u.status} />
                    </td>
                    <td>
                      <button
                        className={styles.link}
                        onClick={() =>
                          setStore((s) => ({
                            ...s,
                            users: s.users.map((x) =>
                              x.id === u.id
                                ? {
                                    ...x,
                                    status:
                                      x.status === "Active"
                                        ? "Suspended"
                                        : "Active",
                                  }
                                : x,
                            ),
                          }))
                        }
                      >
                        {u.status === "Active" ? "Suspend" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Section>
        )}
        {view === "reports" && (
          <Section title="System reports">
            <div className={styles.report}>
              {stats.map(([l, v]) => (
                <article key={l}>
                  <div style={{ height: `${55 + Number(v) * 8}px` }} />
                  <strong>{v}</strong>
                  <span>{l}</span>
                </article>
              ))}
            </div>
          </Section>
        )}
        {view === "notifications" && (
          <Section title="Notifications">
            <div className={styles.notices}>
              {store.notices.filter((n) => n.userId === user.id).length ===
                0 && (
                <EmptyState
                  title="You're all caught up"
                  text="Care reminders and appointment updates will appear here."
                />
              )}
              {store.notices
                .filter((n) => n.userId === user.id)
                .map((n) => (
                  <article className={n.read ? styles.noticeRead : styles.noticeUnread} key={n.id}>
                    <span className={styles.noticeIcon}><Bell weight={n.read ? "regular" : "fill"} /></span>
                    <div className={styles.noticeContent}>
                      <strong>{n.read ? "Care update" : "New update"}</strong>
                      <p>{n.text}</p>
                    </div>
                    <button
                      onClick={async () => {
                        if (!n.read) await markNotificationRead(n.id);
                        setStore((s) => ({
                          ...s,
                          notices: s.notices.map((x) =>
                            x.id === n.id ? { ...x, read: true } : x,
                          ),
                        }));
                      }}
                    >
                      {n.read ? "Read" : "Mark as read"}
                    </button>
                  </article>
                ))}
            </div>
          </Section>
        )}
      </main>
      {modal && (
        <FormModal
          kind={modal}
          pets={pets}
          vets={store.users.filter((u) => u.role === "vet")}
          editing={editing}
          editingAppointment={editingAppointment}
          close={() => {
            setModal(null);
            setEditing(null);
            setEditingAppointment(null);
          }}
          changeKind={setModal}
          pet={savePet}
          appointment={book}
          record={record}
          adoption={saveAdoption}
        />
      )}
      {feedback && <div className={`${styles.feedback} ${feedback.error ? styles.feedbackError : ""}`} role="status">{feedback.text}<button onClick={() => setFeedback(null)} aria-label="Dismiss message"><X /></button></div>}
    </div>
  );
}
function Section({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className={styles.section}>
      <header>
        <h2>{title}</h2>
        {action}
      </header>
      {children}
    </section>
  );
}
function Badge({ text }: { text: string }) {
  return (
    <span className={`${styles.badge} ${styles[text.toLowerCase()] || ""}`}>
      {text}
    </span>
  );
}
function Table({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.table}>
      <table>{children}</table>
    </div>
  );
}
function EmptyState({
  title,
  text,
  action,
  compact = false,
}: {
  title: string;
  text: string;
  action?: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <div
      className={`${styles.emptyState} ${compact ? styles.compactEmpty : ""}`}
    >
      <span>
        <PawPrint weight="duotone" />
      </span>
      <h3>{title}</h3>
      <p>{text}</p>
      {action}
    </div>
  );
}
function Appointments({
  items,
  petName,
  vetName,
  role,
  update,
  reschedule,
  emptyText,
}: {
  items: Appointment[];
  petName: (x: string) => string;
  vetName: (x: string) => string;
  role: Role;
  update: (id: string, s: Appointment["status"]) => void;
  reschedule?: (appointment: Appointment) => void;
  emptyText?: string;
}) {
  if (items.length === 0 && !emptyText) return null;
  if (items.length === 0)
    return (
      <EmptyState
        title="No appointments yet"
        text={emptyText || "Scheduled visits and their status will appear here."}
      />
    );
  return (
    <>
      <div className={styles.desktopAppointments}>
        <Table>
          <thead>
            <tr>
              <th>Pet</th>
              <th>Date & time</th>
              <th>Veterinarian</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((a) => (
              <tr key={a.id}>
                <td>
                  <b>{petName(a.petId)}</b>
                </td>
                <td>
                  {a.date} · {a.time}
                </td>
                <td>{vetName(a.vetId)}</td>
                <td>{a.reason}</td>
                <td>
                  <Badge text={a.status} />
                </td>
                <td>
                  {role === "vet" && a.status === "Pending" ? (
                    <>
                      <button
                        className={styles.link}
                        onClick={() => update(a.id, "Accepted")}
                      >
                        Accept
                      </button>{" "}
                      <button
                        className={styles.link}
                        onClick={() => update(a.id, "Rejected")}
                      >
                        Reject
                      </button>
                    </>
                  ) : role === "vet" && a.status === "Accepted" ? (
                    <button
                      className={styles.link}
                      onClick={() => update(a.id, "Completed")}
                    >
                      Complete
                    </button>
                  ) : role === "owner" &&
                    !["Cancelled", "Rejected", "Completed"].includes(
                      a.status,
                    ) ? (
                    <><button className={styles.link} onClick={() => reschedule?.(a)}>Reschedule</button>{" "}<button className={styles.link} onClick={() => update(a.id, "Cancelled")}>Cancel</button></>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
      <div className={styles.mobileAppointments}>
        {items.map((a) => (
          <article key={a.id}>
            <div className={styles.dateTile}>
              <strong>
                {new Date(`${a.date}T00:00:00`).toLocaleDateString("en-US", {
                  day: "2-digit",
                })}
              </strong>
              <span>
                {new Date(`${a.date}T00:00:00`).toLocaleDateString("en-US", {
                  month: "short",
                })}
              </span>
            </div>
            <div className={styles.appointmentInfo}>
              <header>
                <h3>{a.reason}</h3>
                <Badge text={a.status} />
              </header>
              <p>
                <PawPrint /> {petName(a.petId)}
              </p>
              <p>
                <Stethoscope /> {vetName(a.vetId)}
              </p>
              <p>
                <CalendarBlank /> {formatTime(a.time)}
              </p>
              <div className={styles.appointmentActions}>
                {role === "vet" && a.status === "Pending" ? (
                  <>
                    <button
                      className={styles.link}
                      onClick={() => update(a.id, "Accepted")}
                    >
                      Accept
                    </button>
                    <button
                      className={styles.link}
                      onClick={() => update(a.id, "Rejected")}
                    >
                      Reject
                    </button>
                  </>
                ) : role === "vet" && a.status === "Accepted" ? (
                  <button
                    className={styles.link}
                    onClick={() => update(a.id, "Completed")}
                  >
                    Mark completed
                  </button>
                ) : role === "owner" &&
                  !["Cancelled", "Rejected", "Completed"].includes(a.status) ? (
                  <><button className={styles.link} onClick={() => reschedule?.(a)}>Reschedule</button><button className={styles.link} onClick={() => update(a.id, "Cancelled")}>Cancel appointment</button></>
                ) : (
                  <span>No action needed</span>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
function Input({
  label,
  name,
  type = "text",
  value,
  required = true,
}: {
  label: string;
  name: string;
  type?: string;
  value?: string;
  required?: boolean;
}) {
  if (type === "date")
    return <DateField label={label} name={name} defaultValue={value} />;
  if (type === "time") return <TimeField label={label} name={name} defaultValue={value} />;
  return (
    <label>
      {label}
      <input name={name} type={type} defaultValue={value} required={required} />
    </label>
  );
}
function DateField({
  label,
  name,
  defaultValue = "",
}: {
  label: string;
  name: string;
  defaultValue?: string;
}) {
  const initial = defaultValue
    ? new Date(`${defaultValue}T00:00:00`)
    : new Date();
  const [value, setValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(
    new Date(initial.getFullYear(), initial.getMonth(), 1),
  );
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1).getDay();
  const mondayOffset = (firstDay + 6) % 7;
  const daysInMonth = new Date(
    month.getFullYear(),
    month.getMonth() + 1,
    0,
  ).getDate();
  const days = Array.from({ length: mondayOffset + daysInMonth }, (_, index) =>
    index < mondayOffset ? null : index - mondayOffset + 1,
  );
  const moveMonth = (amount: number) =>
    setMonth(
      (current) =>
        new Date(current.getFullYear(), current.getMonth() + amount, 1),
    );
  const moveYear = (amount: number) =>
    setMonth(
      (current) =>
        new Date(current.getFullYear() + amount, current.getMonth(), 1),
    );
  const chooseDay = (day: number) => {
    const next = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    setValue(next);
    setOpen(false);
  };
  return (
    <label className={styles.dateField}>
      {label}
      <input type="hidden" name={name} value={value} />
      <button
        type="button"
        className={`${styles.dateTrigger} ${open ? styles.selectOpen : ""}`}
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span className={value ? "" : styles.selectPlaceholder}>
          {value ? formatAppointmentDate(value) : "Select a date"}
        </span>
        <CalendarBlank />
      </button>
      {open && (
        <div
          className={styles.calendar}
          role="dialog"
          aria-label={`Choose ${label.toLowerCase()}`}
        >
          <header>
            <button
              type="button"
              aria-label="Previous year"
              onClick={() => moveYear(-1)}
            >
              <CaretDoubleLeft />
            </button>
            <button
              type="button"
              aria-label="Previous month"
              onClick={() => moveMonth(-1)}
            >
              <CaretLeft />
            </button>
            <strong>
              {month.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </strong>
            <button
              type="button"
              aria-label="Next month"
              onClick={() => moveMonth(1)}
            >
              <CaretRight />
            </button>
            <button
              type="button"
              aria-label="Next year"
              onClick={() => moveYear(1)}
            >
              <CaretDoubleRight />
            </button>
          </header>
          <div className={styles.weekdays}>
            {["M", "T", "W", "T", "F", "S", "S"].map((day, index) => (
              <span key={`${day}-${index}`}>{day}</span>
            ))}
          </div>
          <div className={styles.calendarGrid}>
            {days.map((day, index) =>
              day ? (
                <button
                  type="button"
                  key={day}
                  className={
                    value ===
                    `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
                      ? styles.selectedDay
                      : ""
                  }
                  onClick={() => chooseDay(day)}
                >
                  {day}
                </button>
              ) : (
                <span key={`empty-${index}`} />
              ),
            )}
          </div>
          <footer>
            <button
              type="button"
              onClick={() => {
                const today = new Date();
                setMonth(new Date(today.getFullYear(), today.getMonth(), 1));
                setValue(
                  `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`,
                );
                setOpen(false);
              }}
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => {
                setValue("");
                setOpen(false);
              }}
            >
              Clear
            </button>
          </footer>
        </div>
      )}
    </label>
  );
}
function TimeField({ label, name, defaultValue = "09:00" }: { label: string; name: string; defaultValue?: string }) {
  const options = Array.from({ length: 20 }, (_, index) => {
    const totalMinutes = 8 * 60 + index * 30;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const value = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
    return { value, label: formatTime(value) };
  });
  return (
    <SelectField
      label={label}
      name={name}
      options={options}
      defaultValue={defaultValue}
    />
  );
}
function SelectField({
  label,
  name,
  options,
  placeholder = "Select an option",
  defaultValue = "",
}: {
  label: string;
  name: string;
  options: { value: string; label: string }[];
  placeholder?: string;
  defaultValue?: string;
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(defaultValue);
  const selected = options.find((option) => option.value === value);
  return (
    <label className={styles.selectField}>
      {label}
      <input type="hidden" name={name} value={value} />
      <button
        type="button"
        className={`${styles.selectTrigger} ${open ? styles.selectOpen : ""}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <span className={selected ? "" : styles.selectPlaceholder}>
          {selected?.label || placeholder}
        </span>
        <CaretDown />
      </button>
      {open && (
        <div className={styles.selectMenu} role="listbox" aria-label={label}>
          {options.map((option) => (
            <button
              type="button"
              role="option"
              aria-selected={option.value === value}
              className={option.value === value ? styles.selectedOption : ""}
              key={option.value}
              onClick={() => {
                setValue(option.value);
                setOpen(false);
              }}
            >
              <span>{option.label}</span>
              {option.value === value && <Check weight="bold" />}
            </button>
          ))}
        </div>
      )}
    </label>
  );
}
function AdoptionPhotoInput({
  hasPhoto,
  onSelect,
}: {
  hasPhoto: boolean;
  onSelect: (file: File) => void;
}) {
  return (
    <label className={imageStyles.photoInput}>
      {hasPhoto ? "Change photo" : "Add photo"}
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onSelect(file);
        }}
      />
    </label>
  );
}
function FormModal({
  kind,
  pets,
  vets,
  editing,
  editingAppointment,
  close,
  pet,
  appointment,
  record,
  adoption,
  changeKind,
}: {
  kind: Exclude<Modal, null>;
  pets: Pet[];
  vets: User[];
  editing: Pet | null;
  editingAppointment: Appointment | null;
  close: () => void;
  pet: (e: FormEvent<HTMLFormElement>) => void;
  appointment: (e: FormEvent<HTMLFormElement>) => void;
  record: (e: FormEvent<HTMLFormElement>) => void;
  adoption: (e: FormEvent<HTMLFormElement>) => void;
  changeKind: (kind: Modal) => void;
}) {
  useEffect(() => {
    const dismiss = (event: KeyboardEvent) => event.key === "Escape" && close();
    window.addEventListener("keydown", dismiss);
    return () => window.removeEventListener("keydown", dismiss);
  }, [close]);
  return (
    <div
      className={styles.backdrop}
      onMouseDown={(event) => event.target === event.currentTarget && close()}
    >
      <section
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="form-modal-title"
      >
        <header>
          <h2 id="form-modal-title">
            {kind === "pet"
              ? editing
                ? "Edit pet"
                : "Add pet"
              : kind === "appointment"
                ? editingAppointment ? "Reschedule appointment" : "Book appointment"
                : kind === "adoption"
                  ? "List a pet for adoption"
                  : "Add medical record"}
          </h2>
          <button onClick={close} aria-label="Close form">
            <X />
          </button>
        </header>
        {kind === "pet" && (
          <form onSubmit={pet}>
            <label>
              Identification photo
              <input
                name="photo"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                required={!editing?.photo}
              />
              <small>
                {editing?.photo
                  ? "Choose a new file only if you want to replace the current photo."
                  : "Upload a clear photo of the pet."}
              </small>
            </label>
            <div className={styles.grid}>
              <Input label="Name" name="name" value={editing?.name} />
              <Input label="Species" name="species" value={editing?.species} />
              <Input label="Breed" name="breed" value={editing?.breed} />
              <SelectField
                label="Gender"
                name="gender"
                options={[
                  { value: "Male", label: "Male" },
                  { value: "Female", label: "Female" },
                ]}
                defaultValue={editing?.gender || "Male"}
              />
              <Input
                label="Date of birth"
                name="dob"
                type="date"
                value={editing?.dob}
              />
              <Input label="Weight" name="weight" value={editing?.weight} />
              <Input
                label="Health status"
                name="health"
                value={editing?.healthStatus || "Healthy"}
              />
              <Input
                label="Allergies"
                name="allergies"
                value={editing?.allergies || "None known"}
              />
            </div>
            <button>Save pet</button>
          </form>
        )}
        {kind === "appointment" &&
          (pets.length === 0 ? (
            <div className={styles.formPrerequisite}>
              <span>
                <PawPrint weight="duotone" />
              </span>
              <h3>Add a pet before booking</h3>
              <p>
                An appointment needs a pet profile so the veterinarian receives
                the right details.
              </p>
              <button onClick={() => changeKind("pet")}>
                <Plus /> Create pet profile
              </button>
            </div>
          ) : vets.length === 0 ? (
            <div className={styles.formPrerequisite}>
              <span>
                <Stethoscope weight="duotone" />
              </span>
              <h3>No veterinarians available</h3>
              <p>
                Please check back later or contact PawCare for help arranging a
                visit.
              </p>
              <button onClick={close}>Close</button>
            </div>
          ) : (
            <form onSubmit={appointment}>
              <SelectField
                label="Pet"
                name="pet"
                options={pets.map((pet) => ({
                  value: pet.id,
                  label: pet.name,
                }))}
                defaultValue={editingAppointment?.petId || pets[0]?.id}
              />
              <SelectField
                label="Veterinarian"
                name="vet"
                options={vets.map((vet) => ({
                  value: vet.id,
                  label: vet.name,
                }))}
                defaultValue={editingAppointment?.vetId || vets[0]?.id}
              />
              <div className={styles.grid}>
                <Input label="Date" name="date" type="date" value={editingAppointment?.date} />
                <Input label="Time" name="time" type="time" value={editingAppointment?.time} />
              </div>
              <Input label="Reason" name="reason" value={editingAppointment?.reason} />
              <small>Appointments are available Monday to Friday, 8:00 AM to 5:00 PM.</small>
              <button>{editingAppointment ? "Save new schedule" : "Request appointment"}</button>
            </form>
          ))}
        {kind === "record" &&
          (pets.length === 0 ? (
            <div className={styles.formPrerequisite}>
              <span>
                <PawPrint weight="duotone" />
              </span>
              <h3>No patient profiles available</h3>
              <p>Add a patient profile before creating a medical record.</p>
              <button onClick={() => changeKind("pet")}>
                <Plus /> Add patient
              </button>
            </div>
          ) : (
            <form onSubmit={record}>
              <SelectField
                label="Patient"
                name="pet"
                options={pets.map((pet) => ({
                  value: pet.id,
                  label: pet.name,
                }))}
                defaultValue={pets[0]?.id}
              />
              <Input label="Date" name="date" type="date" />
              <Input label="Diagnosis" name="diagnosis" />
              <Input label="Treatment" name="treatment" />
              <Input label="Medication / prescription" name="medication" />
              <Input label="Vaccination" name="vaccination" required={false} />
              <label>
                Medical notes
                <textarea name="notes" required />
              </label>
              <button>Save medical record</button>
            </form>
          ))}
        {kind === "adoption" && (
          <form onSubmit={adoption}>
            <label>
              Pet photo
              <input
                name="photo"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                required
              />
            </label>
            <div className={styles.grid}>
              <Input label="Name" name="name" />
              <SelectField
                label="Species"
                name="species"
                options={[
                  { value: "Dog", label: "Dog" },
                  { value: "Cat", label: "Cat" },
                  { value: "Other", label: "Other" },
                ]}
                defaultValue="Dog"
              />
              <Input label="Breed" name="breed" />
              <Input label="Age" name="age" />
            </div>
            <button>Publish adoption listing</button>
          </form>
        )}
      </section>
    </div>
  );
}
function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
function formatPetDate(value: string) {
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
}
function formatAppointmentDate(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}
function formatTime(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return new Date(2000, 0, 1, hours, minutes).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}
