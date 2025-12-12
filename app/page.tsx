import { signIn } from "@/auth";
import { ArrowRight, ShoppingBag, Sparkles, Shield } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-50 via-white to-purple-50">
      {/* Navigation */}

      <nav className="border-b bg-white/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-8 w-8 text-indigo-600" />
              <span className="text-xl font-bold bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                ProjectsHub
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/projects"
                className="text-gray-700 hover:text-indigo-600 transition-colors"
              >
                Browse Projects
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 text-indigo-700 text-sm font-medium">
            <Sparkles className="h-4 w-4" />
            Your Gateway to Premium Projects
          </div>

          {/* Heading */}
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            <span className="bg-linear-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Discover & Sell
            </span>
            <br />
            <span className="text-gray-900">Amazing Projects</span>
          </h1>

          {/* Description */}
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join thousands of developers buying and selling high-quality
            projects. From starter templates to full applications, find
            everything you need.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <form
              action={async () => {
                "use server";
                await signIn("google", { redirectTo: "/projects" });
              }}
            >
              <button
                type="submit"
                className="group px-8 py-4 bg-linear-to-r from-indigo-600 to-purple-600 text-white rounded-full font-semibold hover:shadow-xl hover:scale-105 transition-all duration-200 flex items-center gap-2"
              >
                Sign in with Google
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
            <Link
              href="/projects"
              className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-full font-semibold hover:border-indigo-600 hover:text-indigo-600 transition-all duration-200"
            >
              Browse Projects
            </Link>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 pt-20">
            <div className="p-6 rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow">
              <div className="h-12 w-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <ShoppingBag className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Quality Projects</h3>
              <p className="text-gray-600">
                Curated collection of high-quality, production-ready projects
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow">
              <div className="h-12 w-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                Secure Transactions
              </h3>
              <p className="text-gray-600">
                Safe and secure payment processing for all transactions
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow">
              <div className="h-12 w-12 bg-pink-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <Sparkles className="h-6 w-6 text-pink-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Active Community</h3>
              <p className="text-gray-600">
                Join a thriving community of developers and creators
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-20 py-8 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600">
          <p>© 2025 ProjectsHub. Built with Next.js & Prisma.</p>
        </div>
      </footer>
    </div>
  );
}
