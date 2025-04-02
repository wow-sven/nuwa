interface AgentLoadMoreProps {
  callBack :() => void
}

export function AgentLoadMore({ callBack }: AgentLoadMoreProps) {

  return (
    <div
      className="rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer group border border-gray-100 dark:border-gray-700"
      onClick={callBack}
    >
      {/* Profile Section */}
      <div className="px-4 pb-4 flex flex-col items-center h-[280px] justify-between">
        {/* Avatar and Name Section */}
        <div className="w-full">
          <div className="relative -mt-12 flex flex-col items-center">
            {/* <img
              src={agent.avatar}
              alt={agent.name}
              className="w-16 h-16 mb-2"
            />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 text-center">
              {agent.name}
            </h3>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              @{agent.username}
            </div> */}
          </div>

          {/* Bio with max height and scroll */}
          <p className="mt-3 text-sm text-gray-600 dark:text-gray-300 text-center max-w-sm mx-auto max-h-[60px] overflow-y-auto">
            {/* {agent.description} */}
          </p>
        </div>

        {/* Stats and Button Contagentner */}
        <div className="w-full space-y-4">
          {/* Action Button */}
          <button
            onClick={callBack}
            className="group relative w-full px-8 py-3 text-sm font-semibold rounded-lg border-2 border-purple-600 bg-white dark:bg-gray-900 transition-all duration-500 ease-in-out overflow-hidden"
          >
            <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 dark:text-white group-hover:text-white transition-colors duration-500">Load More</span>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-in-out origin-left"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-in-out origin-right delay-100"></div>
          </button>
        </div>
      </div>
    </div>
  )
} 
