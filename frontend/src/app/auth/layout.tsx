export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-base bg-radial-dark dark:bg-radial-dark relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-crimson/5 blur-3xl" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-cyan-neon/5 blur-3xl" />
      </div>
      <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
        {children}
      </div>
    </div>
  );
}
