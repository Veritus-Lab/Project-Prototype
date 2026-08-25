import { Audiences } from "../components/marketing/audiences";
import { Features } from "../components/marketing/features";
import { Footer } from "../components/marketing/footer";
import { Header } from "../components/marketing/header";
import { Hero } from "../components/marketing/hero";

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Features />
        <Audiences />
      </main>
      <Footer />
    </>
  );
}
