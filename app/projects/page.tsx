import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { ShoppingBag, User } from "lucide-react";

export default async function ProjectsPage() {
  const session = await auth();
  const projects = await prisma.project.findMany({
    include: {
      seller: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="border-b bg-white sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <ShoppingBag className="h-8 w-8 text-indigo-600" />
              <span className="text-xl font-bold bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                ProjectsHub
              </span>
            </Link>
            <div className="flex items-center gap-4">
              {session?.user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="px-4 py-2 text-gray-700 hover:text-indigo-600 transition-colors"
                  >
                    Dashboard
                  </Link>
                  <div className="flex items-center gap-2">
                    {session.user.image ? (
                      <img
                        src={session.user.image}
                        alt={session.user.name || "User"}
                        className="h-8 w-8 rounded-full"
                      />
                    ) : (
                      <User className="h-8 w-8 text-gray-400" />
                    )}
                    <span className="text-sm text-gray-700">
                      {session.user.name}
                    </span>
                  </div>
                </>
              ) : (
                <Link
                  href="/"
                  className="px-6 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Browse Projects
          </h1>
          <p className="text-lg text-gray-600">
            Discover amazing projects from our community
          </p>
        </div>

        {/* Projects Grid */}
        {projects.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100"
              >
                <div className="mb-4">
                  <span className="inline-block px-3 py-1 text-xs font-medium bg-indigo-100 text-indigo-700 rounded-full">
                    {project.category}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {project.title}
                </h3>
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {project.description || "No description available"}
                </p>
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-2">
                    {project.seller.image ? (
                      <img
                        src={project.seller.image}
                        alt={project.seller.name || "Seller"}
                        className="h-6 w-6 rounded-full"
                      />
                    ) : (
                      <User className="h-6 w-6 text-gray-400" />
                    )}
                    <span className="text-sm text-gray-600">
                      {project.seller.name}
                    </span>
                  </div>
                  <span className="text-lg font-bold text-indigo-600">
                    ₹{project.price}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No projects yet
            </h3>
            <p className="text-gray-600">
              Be the first to list a project on the marketplace!
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
