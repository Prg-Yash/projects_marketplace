import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { Download, Package, ArrowLeft } from "lucide-react";

export default async function OrdersPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/");
  }

  // Get all completed orders for this user
  const orders = await prisma.order.findMany({
    where: {
      buyerId: session.user.id,
      status: "SUCCESS",
    },
    include: {
      project: {
        include: {
          seller: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Purchases</h1>

        {orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-lg shadow-sm border p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    {order.project.thumbnailUrl && (
                      <img
                        src={order.project.thumbnailUrl}
                        alt={order.project.title}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    )}
                    <div>
                      <h3 className="font-semibold text-lg">
                        {order.project.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        by {order.project.seller.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        Purchased on{" "}
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-indigo-600 font-medium">
                        ₹{order.amount / 100}
                      </p>
                    </div>
                  </div>

                  {/* Download Button */}
                  {order.project.zipFileUrl && (
                    <a
                      href={order.project.zipFileUrl}
                      download={order.project.zipFileName}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-lg">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No purchases yet
            </h3>
            <p className="text-gray-600 mb-4">
              Browse projects and make your first purchase!
            </p>
            <Link
              href="/projects"
              className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Browse Projects
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
