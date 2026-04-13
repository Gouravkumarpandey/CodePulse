import { SignUp } from '@clerk/react';

export default function ClerkSignUpPage() {
  return (
    <div className="min-h-screen w-full bg-white dark:bg-black flex items-center justify-center">
      <SignUp signInUrl="/login" routing="path" path="/signup" />
    </div>
  );
}
