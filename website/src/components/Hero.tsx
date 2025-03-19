export function Hero() {
  return (
    <div className="relative min-h-[600px]">
      <div className="absolute inset-0 bg-gradient-to-b from-white via-white/95 to-[#FF15FB] dark:from-gray-900 dark:via-gray-900 dark:to-[#FF15FB] bg-[length:100%_200%] bg-[position:0%_30%]"></div>
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url('/hero-background.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      ></div>
      <div className="relative container mx-auto px-4 py-16 sm:py-24">
        <div className="text-center">
          {/* Logo */}
          <div className="flex justify-center mb-8 sm:mb-12">
            <img
              src="/nuwa-logo-horizontal-dark.svg"
              className="h-16 sm:h-20 w-auto hidden dark:block"
              alt="Nuwa"
            />
            <img
              src="/nuwa-logo-horizontal.svg"
              className="h-16 sm:h-20 w-auto dark:hidden"
              alt="Nuwa"
            />
          </div>

          {/* Tagline */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 mb-6">
            Own. Interact. Learn. Evolve on-chain
          </h1>

          {/* Description */}
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8">
            Nuwa is an On-Chain AI with its own assets, on-chain operations, and continuous learning.
          </p>

          {/* Talk to Nuwa Button */}
          <button className="px-8 py-3 text-lg font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-full hover:opacity-90 transition-opacity">
            Talk to Nuwa
          </button>
        </div>
      </div>
    </div>
  )
} 