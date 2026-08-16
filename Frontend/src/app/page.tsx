import { About } from "@/components/About";
import { Adoption } from "@/components/Adoption";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { Navbar } from "@/components/Navbar";
import { Services } from "@/components/Services";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Services />
        <About />
        <HowItWorks />
        <Adoption />
      </main>
      <Footer />
    </>
  );
}
