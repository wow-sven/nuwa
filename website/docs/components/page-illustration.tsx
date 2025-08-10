export default function PageIllustration() {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
      {/* Gradient Orbs */}
      <div
        className="absolute -top-40 left-1/2 -translate-x-1/2 ml-[600px] hidden sm:block"
        aria-hidden="true"
      >
        <div className="h-96 w-96 rounded-full bg-gradient-to-tr from-violet-500/20 via-purple-400/20 to-blue-500/20 blur-[100px] animate-pulse" />
      </div>
      
      <div
        className="absolute top-[300px] left-1/2 -translate-x-1/2 ml-[400px] hidden sm:block"
        aria-hidden="true"
      >
        <div className="h-80 w-80 rounded-full bg-gradient-to-tr from-blue-500/15 via-violet-400/15 to-purple-500/15 blur-[120px] animate-pulse [animation-delay:2s]" />
      </div>
      
      <div
        className="absolute top-[500px] left-1/2 -translate-x-1/2 -ml-[400px] hidden sm:block"
        aria-hidden="true"
      >
        <div className="h-72 w-72 rounded-full bg-gradient-to-tr from-purple-500/10 via-violet-400/10 to-blue-500/10 blur-[80px] animate-pulse [animation-delay:4s]" />
      </div>
      
      {/* Additional Floating Elements */}
      <div
        className="absolute top-[150px] left-1/4 hidden lg:block"
        aria-hidden="true"
      >
        <div className="h-32 w-32 rounded-full bg-gradient-to-tr from-violet-600/10 to-purple-600/10 blur-[60px]" />
      </div>
      
      <div
        className="absolute top-[400px] right-1/4 hidden lg:block"
        aria-hidden="true"
      >
        <div className="h-40 w-40 rounded-full bg-gradient-to-tr from-blue-600/10 to-violet-600/10 blur-[70px]" />
      </div>
      
      {/* Subtle Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]">
        <div 
          className="h-full w-full"
          style={{
            backgroundImage: `linear-gradient(rgba(139, 92, 246, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(139, 92, 246, 0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}
        />
      </div>
    </div>
  );
}
