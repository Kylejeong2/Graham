import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex flex-col min-h-screen bg-[#F5E6D3]">
      <main className="flex-1 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md border border-[#8B4513]">
          <SignIn afterSignInUrl="/dashboard" />
        </div>
      </main>
      <footer className="py-6 w-full shrink-0 px-4 md:px-6 border-t border-[#8B4513]">
        <p className="text-xs text-center text-[#795548]">
          © {new Date().getFullYear()} Graham AI. All rights reserved.
        </p>
      </footer>
    </div>
  );
}