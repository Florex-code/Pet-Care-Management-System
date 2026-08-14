"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Bell, CalendarBlank, CaretDown, CaretLeft, CaretRight, ChatCircle, CreditCard,
  FileText, Gear, House, List, MagnifyingGlass, PawPrint, Plus, SignOut,
  Syringe, X, Heart, Prescription, EnvelopeSimple, DotsThreeVertical,
} from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import styles from "./Dashboard.module.css";

const navigation = [
  { label: "Dashboard", icon: House, active: true }, { label: "My Pets", icon: PawPrint },
  { label: "Appointments", icon: CalendarBlank }, { label: "Medical Records", icon: FileText },
  { label: "Vaccinations", icon: Syringe }, { label: "Prescriptions", icon: Prescription },
  { label: "Adoption", icon: Heart }, { label: "Messages", icon: ChatCircle },
  { label: "Payments", icon: CreditCard }, { label: "Notifications", icon: Bell },
  { label: "Settings", icon: Gear },
];

const stats = [
  { label: "My Pets", value: "3", icon: PawPrint, tone: "purple", link: "View all pets" },
  { label: "Appointments", value: "2", icon: CalendarBlank, tone: "green", link: "View all" },
  { label: "Vaccines Due", value: "1", icon: Syringe, tone: "blue", link: "View details" },
  { label: "Medical Records", value: "12", icon: FileText, tone: "orange", link: "View all" },
];

const pets = [
  { name: "Max", sex: "♂", breed: "Golden Retriever", age: "3 Years, 2 Months", image: "/images/hero-pets.png", position: "78% center" },
  { name: "Luna", sex: "♀", breed: "British Shorthair", age: "2 Years, 5 Months", image: "/images/hero-pets.png", position: "49% center" },
  { name: "Coco", sex: "♀", breed: "Holland Lop", age: "1 Year, 3 Months", emoji: "🐇" },
];

const activities = [
  { icon: Syringe, tone: "green", title: "Vaccination record added for Max", detail: "Rabies Vaccine", time: "2 hours ago" },
  { icon: CalendarBlank, tone: "blue", title: "Appointment booked for Luna", detail: "General Checkup • Aug 28, 2026", time: "5 hours ago" },
  { icon: FileText, tone: "orange", title: "Medical record updated for Coco", detail: "Ear Infection Treatment", time: "1 day ago" },
  { icon: PawPrint, tone: "purple", title: "Adoption application submitted", detail: "Your application is under review", time: "2 days ago" },
];

const quickActions = [
  { icon: PawPrint, label: "Add New Pet" }, { icon: CalendarBlank, label: "Book Appointment" },
  { icon: FileText, label: "Upload Medical Record" }, { icon: Prescription, label: "Purchase Medication" },
];

export function Dashboard() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.body.classList.toggle("menu-open", menuOpen);
    return () => document.body.classList.remove("menu-open");
  }, [menuOpen]);

  return (
    <div className={styles.shell}>
      <aside className={`${styles.sidebar} ${menuOpen ? styles.sidebarOpen : ""}`}>
        <Link href="/" className={styles.brand} aria-label="Return to PawCare homepage"><span><PawPrint weight="fill" /></span><div><strong>Paw<span>Care</span></strong><small>Management System</small></div></Link>
        <button className={styles.sidebarClose} onClick={() => setMenuOpen(false)} aria-label="Close navigation"><X /></button>
        <nav aria-label="Dashboard navigation" className={styles.nav}>
          {navigation.map(({ label, icon: Icon, active }) => <a className={active ? styles.active : ""} href={`#${label.toLowerCase().replaceAll(" ", "-")}`} key={label} onClick={() => setMenuOpen(false)}><Icon weight={active ? "fill" : "regular"} /><span>{label}</span></a>)}
        </nav>
        <div className={styles.promo}><strong>We care for<br />your best friend</strong><p>Book a checkup today!</p><button>Book Now</button><span aria-hidden="true">🐶</span></div>
        <a className={styles.signOut} href="#sign-out"><SignOut /> Sign out</a>
      </aside>

      {menuOpen && <button className={styles.scrim} aria-label="Close navigation" onClick={() => setMenuOpen(false)} />}

      <main className={styles.main}>
        <header className={styles.topbar}>
          <button className={styles.menuButton} onClick={() => setMenuOpen(true)} aria-label="Open navigation"><List /></button>
          <Link className={styles.backHome} href="/">← Public website</Link>
          <label className={styles.search}><MagnifyingGlass /><input type="search" placeholder="Search anything..." aria-label="Search dashboard" /></label>
          <div className={styles.headerActions}>
            <button aria-label="Notifications"><Bell /><i>3</i></button><button aria-label="Messages"><EnvelopeSimple /><i>2</i></button>
            <button className={styles.profileMenu}><span className={styles.avatar}>SJ</span><span>Sarah Johnson</span><CaretDown /></button>
          </div>
        </header>

        <div className={styles.content}>
          <section className={styles.workspace}>
            <div className={styles.welcome}><div><p className={styles.kicker}>Friday, 14 August</p><h1>Welcome back, Sarah! <span>👋</span></h1><p>Here&apos;s what&apos;s happening with your pets today.</p></div><button className={styles.mobileAvatar}>SJ</button></div>

            <div className={styles.stats}>
              {stats.map(({ label, value, icon: Icon, tone, link }) => <article className={`${styles.stat} ${styles[tone]}`} key={label}><span className={styles.statIcon}><Icon weight="duotone" /></span><div><p>{label}</p><strong>{value}</strong><a href={`#${label.toLowerCase().replaceAll(" ", "-")}`}>{link} <span>→</span></a></div></article>)}
            </div>

            <div className={styles.primaryGrid}>
              <div className={styles.leftColumn}>
                <section className={styles.panel} id="my-pets">
                  <div className={styles.panelHead}><h2>My Pets</h2><a href="#all-pets">View all pets →</a></div>
                  <div className={styles.petGrid}>{pets.map((pet) => <article className={styles.pet} key={pet.name}><div className={styles.petPhoto}>{pet.image ? <Image src={pet.image} alt={pet.name} fill sizes="180px" style={{ objectPosition: pet.position }} /> : <span>{pet.emoji}</span>}<button aria-label={`More options for ${pet.name}`}><DotsThreeVertical /></button></div><div className={styles.petInfo}><h3>{pet.name} <i>{pet.sex}</i></h3><p>{pet.breed}</p><p>{pet.age}</p><span>Healthy</span></div></article>)}</div>
                </section>

                <section className={`${styles.panel} ${styles.activity}`}>
                  <div className={styles.panelHead}><h2>Recent Activity</h2></div>
                  <div>{activities.map(({ icon: Icon, tone, title, detail, time }) => <article key={title}><span className={`${styles.activityIcon} ${styles[tone]}`}><Icon weight="duotone" /></span><div><h3>{title}</h3><p>{detail}</p></div><time>{time}</time></article>)}</div>
                  <a className={styles.panelFooterLink} href="#activity">View all activity →</a>
                </section>
              </div>

              <section className={`${styles.panel} ${styles.calendarPanel}`} id="appointments">
                <div className={styles.panelHead}><h2>Upcoming Appointments</h2></div>
                <div className={styles.calendarHeader}><button aria-label="Previous month"><CaretLeft /></button><strong>August 2026</strong><button aria-label="Next month"><CaretRight /></button></div>
                <div className={styles.calendar}><span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>{[26,27,28,29,30,31,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29].map((day, index) => <button className={`${index < 6 ? styles.otherMonth : ""} ${day === 14 && index > 6 ? styles.today : ""}`} key={`${day}-${index}`}>{day}</button>)}</div>
                <div className={styles.appointments}>
                  <Appointment emoji="🐶" pet="Max" type="General Checkup" date="Aug 21, 2026" time="10:00 AM" />
                  <Appointment emoji="🐱" pet="Luna" type="Vaccination" date="Aug 28, 2026" time="11:30 AM" />
                </div>
                <button className={styles.primaryButton}><Plus /> Book New Appointment</button>
              </section>
            </div>
          </section>

          <aside className={styles.rightRail}>
            <section className={styles.ownerCard}><span className={styles.ownerAvatar}>SJ</span><strong>Sarah Johnson</strong><p>Pet Owner</p></section>
            <section className={`${styles.panel} ${styles.reminder}`}><div><Bell /><strong>Health Reminder</strong></div><p>Max&apos;s Rabies vaccine is due<br />in 5 days</p><button>View Details</button></section>
            <section className={`${styles.panel} ${styles.adoption}`}><div className={styles.panelHead}><h2>Adoption</h2><a href="#adoption">View all →</a></div><div><span className={styles.adoptionPet}>🐶</span><div><h3>Buddy</h3><p>2 Years • Male</p><p>Looking for a<br />loving home</p><button>View Profile</button></div></div></section>
            <section className={`${styles.panel} ${styles.quick}`}><div className={styles.panelHead}><h2>Quick Actions</h2></div>{quickActions.map(({ icon: Icon, label }) => <button key={label}><span><Icon /></span>{label}<CaretRight /></button>)}</section>
          </aside>
        </div>
      </main>
    </div>
  );
}

function Appointment({ emoji, pet, type, date, time }: { emoji: string; pet: string; type: string; date: string; time: string }) {
  return <article><span>{emoji}</span><div><strong>{pet}</strong><p>{type}</p><small>Dr. Emily Carter</small></div><div><p>{date}</p><time>{time}</time></div></article>;
}
