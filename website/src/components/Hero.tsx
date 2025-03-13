export function Hero() {
  return (
    <div className="bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16 sm:py-24">
        <div className="text-center">
          {/* Logo */}
          <div className="flex justify-center mb-8 sm:mb-12">
            <img
              src="/nuwa-logo.svg"
              alt="Nuwa"
              className="h-16 sm:h-20 w-auto dark:brightness-[10]"
            />
          </div>
          
          {/* Tagline */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 mb-6">
            Discover and Connect with AI Characters
          </h1>
          
          {/* Description */}
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Nuwa is your gateway to the world of AI characters. Connect with unique AI personalities, 
            explore their capabilities, and start meaningful conversations.
          </p>
        </div>
      </div>
    </div>
  )
} 