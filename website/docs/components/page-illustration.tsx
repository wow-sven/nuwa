export default function PageIllustration() {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none">
      {/* Circles */}
      <div
        className="pointer-events-none absolute -top-32 left-1/2 hidden sm:block sm:ml-[580px] sm:-translate-x-1/2"
        aria-hidden="true"
      >
        <div className="h-40 w-40 sm:h-80 sm:w-80 rounded-full bg-gradient-to-tr from-purple-500 via-fuchsia-400 to-purple-500 dark:from-purple-900 dark:via-fuchsia-800 dark:to-purple-900 opacity-50 blur-[80px] sm:blur-[160px]" />
      </div>
      <div
        className="pointer-events-none absolute left-1/2 top-[420px] hidden sm:block sm:ml-[380px] sm:-translate-x-1/2"
        aria-hidden="true"
      >
        <div className="h-40 w-40 sm:h-80 sm:w-80 rounded-full bg-gradient-to-tr from-purple-500 via-fuchsia-400 to-purple-500 dark:from-purple-900 dark:via-fuchsia-800 dark:to-purple-900 opacity-50 blur-[80px] sm:blur-[160px]" />
      </div>
      <div
        className="pointer-events-none absolute left-1/2 top-[640px] hidden sm:block sm:-ml-[300px] sm:-translate-x-1/2"
        aria-hidden="true"
      >
        <div className="h-40 w-40 sm:h-80 sm:w-80 rounded-full bg-gradient-to-tr from-purple-500 via-fuchsia-400 to-purple-500 dark:from-purple-900 dark:via-fuchsia-800 dark:to-purple-900 opacity-50 blur-[80px] sm:blur-[160px]" />
      </div>
    </div>
  );
}
