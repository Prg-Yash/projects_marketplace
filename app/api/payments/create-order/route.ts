import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { razorpay } from "@/lib/razorpay";

export async function POST(req: NextRequest) {
  try {
    // Debug: Log the keys (first 10 chars only for security)
    console.log("RAZORPAY_KEY_ID:", process.env.RAZORPAY_KEY_ID?.substring(0, 15) + "...");
    console.log("RAZORPAY_KEY_SECRET exists:", !!process.env.RAZORPAY_KEY_SECRET);

    // 1. Check if user is logged in
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Get project ID from request
    const { projectId } = await req.json();

    // 3. Find the project
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Validate price - Razorpay minimum is ₹1 (100 paise)
    if (project.price < 1) {
      return NextResponse.json(
        { error: "Price must be at least ₹1" },
        { status: 400 }
      );
    }

    // 4. Check if user already owns this project
    const existingOrder = await prisma.order.findFirst({
      where: {
        buyerId: session.user.id,
        projectId: projectId,
        status: "SUCCESS",
      },
    });

    if (existingOrder) {
      return NextResponse.json(
        { error: "You already own this project" },
        { status: 400 }
      );
    }

    // 5. Create Razorpay Order
    // IMPORTANT: Amount must be in PAISE (₹100 = 10000 paise)
    console.log("Creating Razorpay order for amount:", project.price * 100, "paise");
    
    const razorpayOrder = await razorpay.orders.create({
      amount: project.price * 100, // Convert rupees to paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });

    console.log("Razorpay order created:", razorpayOrder.id);

    // 6. Save order to YOUR database
    const order = await prisma.order.create({
      data: {
        buyerId: session.user.id,
        projectId: project.id,
        amount: project.price * 100, // Store in paise
        status: "PENDING",
        razorpayOrderId: razorpayOrder.id,
      },
    });

    // 7. Return order details to frontend
    return NextResponse.json({
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      dbOrderId: order.id,
    });
  } catch (error: any) {
    console.error("Error creating order:", error);
    console.error("Error details:", error?.error || error?.message || error);
    return NextResponse.json(
      { error: "Failed to create order", details: error?.error?.description || error?.message },
      { status: 500 }
    );
  }
}