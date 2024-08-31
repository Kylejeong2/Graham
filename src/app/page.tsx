import {
  FAQ,
  Featured,
  HeroSection,
} from '@/components/';

export default function Home() {
  return (
    <main>
      <HeroSection />
      <Featured />
      <FAQ />
    </main>
  );
}