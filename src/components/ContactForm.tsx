"use client";

import { FormEvent, useState } from "react";
import { CheckCircle } from "@phosphor-icons/react";

export function ContactForm() {
  const [sent, setSent] = useState(false);
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setSent(true); event.currentTarget.reset(); }
  return <form className="contact-form" onSubmit={submit}><div className="contact-form__row"><label>Full name<input name="name" autoComplete="name" required /></label><label>Email address<input name="email" type="email" autoComplete="email" required /></label></div><label>How can we help?<select name="topic" defaultValue=""><option value="" disabled>Select a topic</option><option>Appointments</option><option>Medical records</option><option>Pet adoption</option><option>Account support</option><option>General inquiry</option></select></label><label>Message<textarea name="message" rows={6} required /></label><button className="button" type="submit">Send message</button>{sent && <p className="contact-form__success" role="status"><CheckCircle weight="fill" /> Thank you. Your message has been received.</p>}</form>;
}
