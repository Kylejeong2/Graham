import { SignUp } from "@clerk/nextjs";
 
export default function Page() {
  return (
    <div className="flex min-h-screen items-center justify-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <SignUp afterSignUpUrl="/dashboard" />
        </div>
    </div>
  )
}