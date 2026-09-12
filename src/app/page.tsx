import { Beginning } from "../components/marketing/beginning";
import { Classes } from "../components/marketing/classes";
import { Contact } from "../components/marketing/contact";
import { Faq } from "../components/marketing/faq";
import { Features } from "../components/marketing/features";
import { Footer } from "../components/marketing/footer";
import { Header } from "../components/marketing/header";
import { Hero } from "../components/marketing/hero";
import { HowItWorks } from "../components/marketing/how-it-works";

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Beginning />
        <Features />
        <HowItWorks />
        <Classes />
        <Faq />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
