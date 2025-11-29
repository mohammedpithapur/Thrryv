export default function ReflectionsFeed() {
  return (
    <div className="max-w-md mx-auto bg-white min-h-screen font-sans">
      
      {/* Header */}
      <header className="p-4 flex items-center justify-between border-b bg-white sticky top-0 z-20">
        <h1 className="text-xl font-semibold">Reflections</h1>
        <button className="text-gray-500">
          <i className="ri-notification-3-line text-2xl"></i>
        </button>
      </header>

      {/* Filters */}
      <div className="flex gap-2 p-4 overflow-x-auto no-scrollbar">
        {["All", "Connections", "Trending", "Nearby"].map((item) => (
          <button
            key={item}
            className="px-4 py-1 border rounded-full text-sm bg-gray-100 text-gray-600"
          >
            {item}
          </button>
        ))}
      </div>

      <hr className="mb-3" />

      {/* Feed Item */}
      <div className="p-4 space-y-3">
        
        {/* User row */}
        <div className="flex items-center gap-3">
          <img
            src="https://i.pravatar.cc/150?img=12"
            className="w-14 h-14 rounded-full object-cover"
          />
          <div>
            <p className="font-medium text-gray-800">Charlie Spencer</p>
            <p className="text-xs text-gray-400">537</p>
          </div>
        </div>

        {/* Text */}
        <p className="text-gray-800 leading-relaxed">
          Starting a new project today, excited to see where it leads us!
        </p>

        {/* Image */}
        <img
          src="https://images.unsplash.com/photo-1587620962725-abab7fe55159"
          className="rounded-xl w-full"
        />

      </div>
    </div>
  );
}
