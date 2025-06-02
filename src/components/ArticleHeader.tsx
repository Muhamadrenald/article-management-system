import { ReactNode } from "react";

interface ArticleHeaderProps {
  children?: ReactNode;
}

export default function ArticleHeader({ children }: ArticleHeaderProps) {
  return (
    <div className="bg-gradient-to-br from-blue-600 via-blue-500 to-blue-700 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-transparent"></div>
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      ></div>

      <nav className="relative z-10 flex justify-between items-center px-6 py-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-bold text-sm">L</span>
          </div>
          <span className="text-white font-semibold">Logipsum</span>
        </div>
        {children}
      </nav>

      <div className="relative z-10 px-6 py-16 text-center">
        <div className="inline-block bg-white/20 backdrop-blur-sm rounded-full px-4 py-1 mb-6">
          <span className="text-white text-sm">Blog portal</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
          The Journal : Design Resources,
          <br />
          Interviews, and Industry News
        </h1>

        <p className="text-blue-100 text-lg mb-8 max-w-md mx-auto">
          Your daily dose of design insights!
        </p>
      </div>
    </div>
  );
}
