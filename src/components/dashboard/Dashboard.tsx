"use client";

import Image from "next/image";
import Link from "next/link";
import { Bell, CalendarBlank, CaretDown, CaretLeft, CaretRight, DotsThreeVertical, EnvelopeSimple, FileText, List, MagnifyingGlass, PawPrint, Plus, Prescription, SignOut, Syringe, X } from "@phosphor-icons/react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { activities, initialAppointments, initialPets, navigation, type Appointment, type Pet, type Tone } from "./dashboardData";
import styles from "./Dashboard.module.css";

const stats: { id: string; label: string; icon: typeof PawPrint; tone: Tone }[] = [
  { id: "my-pets", label: "My Pets", icon: PawPrint, tone: "purple" }, { id: "appointments", label: "Appointments", icon: CalendarBlank, tone: "green" },
  { id: "vaccinations", label: "Vaccines Due", icon: Syringe, tone: "blue" }, { id: "medical-records", label: "Medical Records", icon: FileText, tone: "orange" },
];
type DialogKind = "pet" | "appointment" | "record" | null;

export function Dashboard() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [query, setQuery] = useState("");
  const [dialog, setDialog] = useState<DialogKind>(null);
  const [pets, setPets] = useState(initialPets);
  const [appointments, setAppointments] = useState(initialAppointments);
  const [monthOffset, setMonthOffset] = useState(0);
  const [notice, setNotice] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => { document.body.classList.toggle("menu-open", menuOpen || Boolean(dialog)); return () => document.body.classList.remove("menu-open"); }, [menuOpen, dialog]);
  const searchResults = useMemo(() => {
    const term = query.trim().toLowerCase(); if (!term) return [];
    return [...pets.map((pet) => ({ id: pet.id, label: pet.name, meta: `${pet.breed} · ${pet.status}`, section: "my-pets" })), ...appointments.map((item) => ({ id: item.id, label: `${item.pet}: ${item.type}`, meta: formatDate(item.date), section: "appointments" })), ...activities.map((item) => ({ id: item.id, label: item.title, meta: item.detail, section: "activity" }))].filter((item) => `${item.label} ${item.meta}`.toLowerCase().includes(term)).slice(0, 6);
  }, [query, pets, appointments]);
  const statValues: Record<string, number> = { "my-pets": pets.length, appointments: appointments.length, vaccinations: 1, "medical-records": 12 };
  const calendarDate = new Date(2026, 7 + monthOffset, 1); const calendarDays = createCalendarDays(calendarDate);

  function goToSection(id: string) { setActiveSection(id); setMenuOpen(false); setQuery(""); document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }); }
  function showNotice(message: string) { setNotice(message); window.setTimeout(() => setNotice(""), 2800); }
  function submitPet(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const data = new FormData(event.currentTarget); const imageFile = data.get("image"); const image = imageFile instanceof File && imageFile.size > 0 ? URL.createObjectURL(imageFile) : undefined; const pet: Pet = { id: crypto.randomUUID(), name: String(data.get("name")), sex: String(data.get("sex")) as Pet["sex"], breed: String(data.get("breed")), age: String(data.get("age")), image, position: "center", status: "Healthy" }; setPets((current) => [...current, pet]); setDialog(null); showNotice(`${pet.name} was added successfully.`); }
  function submitAppointment(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const data = new FormData(event.currentTarget); const appointment: Appointment = { id: crypto.randomUUID(), pet: String(data.get("pet")), type: String(data.get("type")), clinician: String(data.get("clinician")), date: String(data.get("date")), time: String(data.get("time")) }; setAppointments((current) => [...current, appointment]); setDialog(null); showNotice("Appointment booked successfully."); }

  return <div className={styles.shell}>
    <aside className={`${styles.sidebar} ${menuOpen ? styles.sidebarOpen : ""}`}>
      <Link href="/" className={styles.brand} aria-label="Return to PawCare homepage"><span><PawPrint weight="fill" /></span><div><strong>Paw<span>Care</span></strong><small>Management System</small></div></Link>
      <button className={styles.sidebarClose} onClick={() => setMenuOpen(false)} aria-label="Close navigation"><X /></button>
      <nav aria-label="Dashboard navigation" className={styles.nav}>{navigation.map(({ id, label, icon: Icon }) => <button className={activeSection === id ? styles.active : ""} type="button" key={id} onClick={() => goToSection(id)}><Icon weight={activeSection === id ? "fill" : "regular"} /><span>{label}</span></button>)}</nav>
      <button className={styles.signOut} type="button" onClick={() => showNotice("Sign-out is ready for the authentication service.")}><SignOut /> Sign out</button>
    </aside>
    {menuOpen && <button className={styles.scrim} aria-label="Close navigation" onClick={() => setMenuOpen(false)} />}
    <main className={styles.main}>
      <header className={styles.topbar}>
        <button className={styles.menuButton} onClick={() => setMenuOpen(true)} aria-label="Open navigation"><List /></button><Link className={styles.backHome} href="/">← Public website</Link>
        <div className={styles.searchWrap}><label className={styles.search}><MagnifyingGlass /><input value={query} onChange={(event) => setQuery(event.target.value)} type="search" placeholder="Search pets, records, appointments..." aria-label="Search dashboard" /></label>{query && <div className={styles.searchResults}>{searchResults.length ? searchResults.map((result) => <button type="button" key={result.id} onClick={() => goToSection(result.section)}><strong>{result.label}</strong><span>{result.meta}</span></button>) : <p>No matching results</p>}</div>}</div>
        <div className={styles.headerActions}><button aria-label="Notifications" onClick={() => goToSection("notifications")}><Bell /><i>3</i></button><button aria-label="Messages" onClick={() => goToSection("messages")}><EnvelopeSimple /><i>2</i></button><div className={styles.profileWrap}><button className={styles.profileMenu} onClick={() => setProfileOpen((open) => !open)} aria-expanded={profileOpen}><span className={styles.avatar}>SJ</span><span>Sarah Johnson</span><CaretDown /></button>{profileOpen && <div className={styles.profileDropdown}><button onClick={() => goToSection("settings")}>Account settings</button><button onClick={() => showNotice("Sign-out is ready for the authentication service.")}>Sign out</button></div>}</div></div>
      </header>
      <div className={styles.content}>
        <section className={styles.workspace}>
          <div className={styles.welcome}><div><p className={styles.kicker}>Friday, 14 August</p><h1>Welcome back, Sarah!</h1><p>Here&apos;s what&apos;s happening with your pets today.</p></div><button className={styles.addButton} onClick={() => setDialog("pet")}><Plus /> Add pet</button></div>
          <div className={styles.stats}>{stats.map(({ id, label, icon: Icon, tone }) => <button className={`${styles.stat} ${styles[tone]}`} key={id} onClick={() => goToSection(id)}><span className={styles.statIcon}><Icon weight="duotone" /></span><span className={styles.statBody}><span>{label}</span><strong>{statValues[id]}</strong><small>View details →</small></span></button>)}</div>
          <div className={styles.primaryGrid}>
            <div className={styles.leftColumn}>
              <section className={styles.panel} id="my-pets"><div className={styles.panelHead}><h2>My Pets</h2><button onClick={() => setDialog("pet")}><Plus /> Add pet</button></div><div className={styles.petGrid}>{pets.map((pet) => <article className={styles.pet} key={pet.id}><div className={styles.petPhoto}>{pet.image ? <Image src={pet.image} alt={pet.name} fill sizes="180px" unoptimized={pet.image.startsWith("blob:")} style={{ objectPosition: pet.position }} /> : <span className={styles.petPlaceholder}><PawPrint /></span>}<button aria-label={`More options for ${pet.name}`}><DotsThreeVertical /></button></div><div className={styles.petInfo}><h3>{pet.name} <i>{pet.sex}</i></h3><p>{pet.breed}</p><p>{pet.age}</p><span>{pet.status}</span></div></article>)}</div></section>
              <section className={`${styles.panel} ${styles.activity}`} id="activity"><div className={styles.panelHead}><h2>Recent Activity</h2></div><div>{activities.map(({ id, icon: Icon, tone, title, detail, time }) => <article key={id}><span className={`${styles.activityIcon} ${styles[tone]}`}><Icon weight="duotone" /></span><div><h3>{title}</h3><p>{detail}</p></div><time>{time}</time></article>)}</div></section>
            </div>
            <section className={`${styles.panel} ${styles.calendarPanel}`} id="appointments"><div className={styles.panelHead}><h2>Upcoming Appointments</h2></div><div className={styles.calendarHeader}><button onClick={() => setMonthOffset((value) => value - 1)} aria-label="Previous month"><CaretLeft /></button><strong>{calendarDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</strong><button onClick={() => setMonthOffset((value) => value + 1)} aria-label="Next month"><CaretRight /></button></div><div className={styles.calendar}><span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>{calendarDays.map(({ day, current }, index) => <button className={`${!current ? styles.otherMonth : ""} ${current && day === 14 && monthOffset === 0 ? styles.today : ""}`} key={`${day}-${index}`}>{day}</button>)}</div><div className={styles.appointments}>{appointments.slice(0, 3).map((item) => <AppointmentRow key={item.id} appointment={item} />)}</div><button className={styles.primaryButton} onClick={() => setDialog("appointment")}><Plus /> Book New Appointment</button></section>
          </div>
        </section>
        <aside className={styles.rightRail}><section className={styles.ownerCard}><span className={styles.ownerAvatar}>SJ</span><strong>Sarah Johnson</strong><p>Pet Owner</p></section><section className={`${styles.panel} ${styles.reminder}`} id="vaccinations"><div><Bell /><strong>Health Reminder</strong></div><p>Max&apos;s rabies vaccine is due in 5 days.</p><button onClick={() => showNotice("Opening Max's vaccination record.")}>View Details</button></section><section className={`${styles.panel} ${styles.quick}`}><div className={styles.panelHead}><h2>Quick Actions</h2></div><button onClick={() => setDialog("pet")}><span><PawPrint /></span>Add New Pet<CaretRight /></button><button onClick={() => setDialog("appointment")}><span><CalendarBlank /></span>Book Appointment<CaretRight /></button><button onClick={() => setDialog("record")}><span><FileText /></span>Upload Medical Record<CaretRight /></button><button onClick={() => goToSection("prescriptions")}><span><Prescription /></span>View Prescriptions<CaretRight /></button></section></aside>
      </div>
    </main>
    {dialog && <Dialog kind={dialog} pets={pets} onClose={() => setDialog(null)} onPetSubmit={submitPet} onAppointmentSubmit={submitAppointment} onRecordSubmit={(event) => { event.preventDefault(); setDialog(null); showNotice("Medical record ready for backend upload."); }} />}{notice && <div className={styles.toast} role="status">{notice}</div>}
  </div>;
}

function AppointmentRow({ appointment }: { appointment: Appointment }) { return <article><span><PawPrint /></span><div><strong>{appointment.pet}</strong><p>{appointment.type}</p><small>{appointment.clinician}</small></div><div><p>{formatDate(appointment.date)}</p><time>{appointment.time}</time></div></article>; }
function Dialog({ kind, pets, onClose, onPetSubmit, onAppointmentSubmit, onRecordSubmit }: { kind: Exclude<DialogKind, null>; pets: Pet[]; onClose: () => void; onPetSubmit: (event: FormEvent<HTMLFormElement>) => void; onAppointmentSubmit: (event: FormEvent<HTMLFormElement>) => void; onRecordSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  const [preview, setPreview] = useState<string | null>(null);
  const titles = { pet: "Add a new pet", appointment: "Book an appointment", record: "Upload medical record" };
  return <div className={styles.modalBackdrop} role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="dialog-title"><div className={styles.modalHead}><h2 id="dialog-title">{titles[kind]}</h2><button onClick={onClose} aria-label="Close dialog"><X /></button></div>{kind === "pet" && <form onSubmit={onPetSubmit}><label className={styles.imagePicker}><span className={styles.imagePreview}>{preview ? <Image src={preview} alt="Selected pet preview" fill unoptimized /> : <PawPrint />}</span><span><strong>{preview ? "Change pet photo" : "Add pet photo"}</strong><small>JPG, PNG or WebP from your device</small></span><input name="image" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => { const file = event.target.files?.[0]; if (file) setPreview(URL.createObjectURL(file)); }} /></label><label>Pet name<input name="name" required /></label><div className={styles.formRow}><label>Species or breed<input name="breed" required /></label><label>Sex<select name="sex"><option>Male</option><option>Female</option></select></label></div><label>Age<input name="age" placeholder="e.g. 2 years, 3 months" required /></label><button className={styles.primaryButton}>Add Pet</button></form>}{kind === "appointment" && <form onSubmit={onAppointmentSubmit}><label>Pet<select name="pet" required>{pets.map((pet) => <option key={pet.id}>{pet.name}</option>)}</select></label><label>Appointment type<input name="type" required /></label><label>Clinician<input name="clinician" defaultValue="Dr. Emily Carter" required /></label><div className={styles.formRow}><label>Date<input name="date" type="date" required /></label><label>Time<input name="time" type="time" required /></label></div><button className={styles.primaryButton}>Book Appointment</button></form>}{kind === "record" && <form onSubmit={onRecordSubmit}><label>Pet<select name="pet" required>{pets.map((pet) => <option key={pet.id}>{pet.name}</option>)}</select></label><label>Record type<input name="type" required /></label><label>Document<input name="file" type="file" accept=".pdf,.jpg,.jpeg,.png" required /></label><button className={styles.primaryButton}>Upload Record</button></form>}</section></div>;
}
function createCalendarDays(date: Date) { const year = date.getFullYear(), month = date.getMonth(), firstDay = new Date(year, month, 1).getDay(), daysInMonth = new Date(year, month + 1, 0).getDate(), previousMonthDays = new Date(year, month, 0).getDate(); return Array.from({ length: 35 }, (_, index) => index < firstDay ? { day: previousMonthDays - firstDay + index + 1, current: false } : index - firstDay < daysInMonth ? { day: index - firstDay + 1, current: true } : { day: index - firstDay - daysInMonth + 1, current: false }); }
function formatDate(value: string) { return new Date(`${value}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }); }
