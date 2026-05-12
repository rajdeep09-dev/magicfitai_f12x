import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center text-white">
      <h1 className="text-4xl font-bold mb-4">MagicFit App is Live</h1>
      <Link href="/auth/login" className="text-lime-400 hover:underline">
        Go to Login
      </Link>
    </div>
  );
}
