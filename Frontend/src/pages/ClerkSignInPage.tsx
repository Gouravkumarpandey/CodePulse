import { SignIn } from '@clerk/react';

export default function ClerkSignInPage() {
  return (
    <div className="min-h-screen w-full bg-white dark:bg-black flex items-center justify-center">
      <SignIn signUpUrl="/signup" routing="path" path="/login" />
    </div>
  );
}
