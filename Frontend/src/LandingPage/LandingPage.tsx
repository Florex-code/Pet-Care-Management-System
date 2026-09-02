import { Footer } from "@/shared/components/Footer";
import { Navbar } from "@/shared/components/Navbar";
import { About } from "./components/About";
import { Adoption } from "./components/Adoption";
import { Hero } from "./components/Hero";
import { HowItWorks } from "./components/HowItWorks";
import { Services } from "./components/Services";
import { ScrollReveal } from "./components/ScrollReveal";

export function LandingPage() {
  return <><ScrollReveal /><Navbar /><main><Hero /><Services /><About /><HowItWorks /><Adoption /></main><Footer /></>;
}
