# 💳 Razorpay Payment Integration Guide

A complete step-by-step guide to integrate Razorpay payment gateway in your Projects Marketplace.

---

## 📚 Table of Contents

1. [Understanding Payment Gateways](#understanding-payment-gateways)
2. [How Razorpay Works](#how-razorpay-works)
3. [Setting Up Razorpay Account](#setting-up-razorpay-account)
4. [Environment Configuration](#environment-configuration)
5. [Installing Dependencies](#installing-dependencies)
6. [Database Schema (Already Done)](#database-schema)
7. [Backend Implementation](#backend-implementation)
8. [Frontend Implementation](#frontend-implementation)
9. [Orders Dashboard](#orders-dashboard)
10. [Testing Payments](#testing-payments)
11. [Going Live](#going-live)

---

## 🎓 Understanding Payment Gateways

### What is a Payment Gateway?

A **payment gateway** is a service that processes online payments. Think of it as a digital cashier that:

1. **Collects** payment information from the customer
2. **Validates** the card/UPI details
3. **Transfers** money from buyer to seller
4. **Confirms** the transaction to your application

### Why Use Razorpay?

- 🇮🇳 **Made for India** - Supports UPI, Cards, Netbanking, Wallets
- 🆓 **Easy Setup** - No lengthy verification for testing
- 💰 **Low Fees** - 2% per transaction (no setup fee)
- 📱 **Great UX** - Smooth checkout experience
- 🔒 **Secure** - PCI DSS compliant

---

## 🔄 How Razorpay Works

### The Payment Flow (Step by Step)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         RAZORPAY PAYMENT FLOW                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  STEP 1: User clicks "Buy Now"                                          │
│     │                                                                    │
│     ▼                                                                    │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  YOUR BACKEND: Creates a Razorpay Order                          │   │
│  │  - Generates unique order_id                                      │   │
│  │  - Amount in paise (₹100 = 10000 paise)                          │   │
│  │  - Saves order to YOUR database with status: PENDING              │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│     │                                                                    │
│     ▼                                                                    │
│  STEP 2: Frontend receives order_id                                     │
│     │                                                                    │
│     ▼                                                                    │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  RAZORPAY CHECKOUT POPUP OPENS                                    │   │
│  │  - User enters card/UPI details                                   │   │
│  │  - Razorpay handles all sensitive data                            │   │
│  │  - You NEVER see card numbers!                                    │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│     │                                                                    │
│     ▼                                                                    │
│  STEP 3: Payment Success/Failure                                        │
│     │                                                                    │
│     ├─── SUCCESS ───▶ Razorpay returns: payment_id, order_id, signature │
│     │                                                                    │
│     ▼                                                                    │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  YOUR BACKEND: Verify Payment                                     │   │
│  │  - Verify signature (prevents fraud)                              │   │
│  │  - Update order status: COMPLETED                                 │   │
│  │  - Grant access to ZIP file                                       │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│     │                                                                    │
│     ▼                                                                    │
│  STEP 4: User can download project from /dashboard/orders              │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Key Concepts

| Term           | Meaning                                                             |
| -------------- | ------------------------------------------------------------------- |
| **Order**      | A purchase request created BEFORE payment                           |
| **Payment**    | The actual money transaction                                        |
| **order_id**   | Razorpay's unique ID for the order (starts with `order_`)           |
| **payment_id** | Razorpay's unique ID for the payment (starts with `pay_`)           |
| **Signature**  | A hash to verify the payment is genuine (not tampered)              |
| **Paise**      | Indian currency unit. ₹1 = 100 paise. Always send amounts in paise! |

---

## 🔧 Setting Up Razorpay Account

### Step 1: Create Razorpay Account

1. Go to: https://razorpay.com/
2. Click **"Sign Up"**
3. Choose **"I want to accept payments"**
4. Enter your email and create password
5. Verify your email

### Step 2: Complete Basic Details

1. **Business Type**: Individual / Sole Proprietor (for testing)
2. **Business Name**: Your marketplace name
3. **Business Category**: E-commerce / Digital Goods

> ⚠️ **Note**: For testing, you don't need full KYC. You can use Test Mode immediately!

### Step 3: Get API Keys

1. Log in to Razorpay Dashboard: https://dashboard.razorpay.com/
2. Go to **Settings** → **API Keys**
3. Click **Generate Test Key**
4. You'll see:
   - **Key ID**: `rzp_test_xxxxxxxxx`
   - **Key Secret**: `xxxxxxxxxxxxxxxx` (shown only once!)

> 🔐 **IMPORTANT**: Save the Key Secret immediately! It's shown only once.

### Test vs Live Mode

| Mode     | Key Prefix  | Real Money? | Use For              |
| -------- | ----------- | ----------- | -------------------- |
| **Test** | `rzp_test_` | ❌ No       | Development, Testing |
| **Live** | `rzp_live_` | ✅ Yes      | Production           |

---

## ⚙️ Environment Configuration

Add these to your `.env` file:

```env
# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx

# This one needs to be public (accessible in browser)
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
```

### Why Two Keys?

- `RAZORPAY_KEY_ID` & `RAZORPAY_KEY_SECRET` → Used on **server** (secret, never exposed)
- `NEXT_PUBLIC_RAZORPAY_KEY_ID` → Used on **client** (public, safe to expose)

> ⚠️ **NEVER expose RAZORPAY_KEY_SECRET to the frontend!**

---

## 📦 Installing Dependencies

Run this command:

```bash
npm install razorpay
```

This installs the official Razorpay Node.js SDK.

---

## 🗄️ Database Schema

Your schema already has the Order and Payment models! Here's what they look like:

```prisma
enum OrderStatus {
  PENDING     // Order created, payment not done
  COMPLETED   // Payment successful
  FAILED      // Payment failed
  REFUNDED    // Money returned
}

model Order {
  id               String      @id @default(cuid())
  buyerId          String                        // Who's buying
  projectId        String                        // What they're buying
  amount           Int                           // Price in paise
  status           OrderStatus @default(PENDING)
  razorpayOrderId  String?     @unique          // Razorpay's order ID

  buyer   User    @relation(...)
  project Project @relation(...)
  payment Payment?
}

model Payment {
  id                  String        @id @default(cuid())
  orderId             String        @unique
  razorpayPaymentId   String?       // pay_xxxxxxxxx
  razorpayOrderId     String?       // order_xxxxxxxxx
  razorpaySignature   String?       // Verification hash
  status              PaymentStatus @default(PENDING)

  order Order @relation(...)
}
```

---

## 🖥️ Backend Implementation

### File Structure to Create

```
app/
├── api/
│   └── payments/
│       ├── create-order/
│       │   └── route.ts      ← Creates Razorpay order
│       └── verify/
│           └── route.ts      ← Verifies payment after success
└── dashboard/
    └── orders/
        └── page.tsx          ← Shows purchased projects
```

---

### Step 1: Create Razorpay Instance

Create file: `lib/razorpay.ts`

```typescript
import Razorpay from "razorpay";

// Initialize Razorpay with your credentials
export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});
```

---

### Step 2: Create Order API

Create file: `app/api/payments/create-order/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { razorpay } from "@/lib/razorpay";

export async function POST(req: NextRequest) {
  try {
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

    // 4. Check if user already owns this project
    const existingOrder = await prisma.order.findFirst({
      where: {
        buyerId: session.user.id,
        projectId: projectId,
        status: "COMPLETED",
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
    const razorpayOrder = await razorpay.orders.create({
      amount: project.price * 100, // Convert rupees to paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: {
        projectId: project.id,
        projectTitle: project.title,
        buyerId: session.user.id,
      },
    });

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
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
```

**What this does:**
s

1. Verifies user is logged in
2. Finds the project they want to buy
3. Checks they don't already own it
4. Creates a Razorpay order (this registers the payment intent with Razorpay)
5. Saves the order to your databae with PENDING status
6. Returns the order ID to the frontend

---

### Step 3: Verify Payment API

Create file: `app/api/payments/verify/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      dbOrderId,
    } = await req.json();

    // 1. Verify the signature
    // This ensures the payment response is genuinely from Razorpay
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      // Someone tried to fake the payment!
      await prisma.order.update({
        where: { id: dbOrderId },
        data: { status: "FAILED" },
      });

      return NextResponse.json(
        { error: "Payment verification failed" },
        { status: 400 }
      );
    }

    // 2. Payment is verified! Update order status
    const order = await prisma.order.update({
      where: { id: dbOrderId },
      data: { status: "COMPLETED" },
    });

    // 3. Create payment record
    await prisma.payment.create({
      data: {
        orderId: order.id,
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        status: "PAID",
      },
    });

    // 4. Return success
    return NextResponse.json({
      success: true,
      message: "Payment verified successfully",
      orderId: order.id,
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    return NextResponse.json(
      { error: "Payment verification failed" },
      { status: 500 }
    );
  }
}
```

**What this does:**

1. Receives payment details from Razorpay (via frontend)
2. **Verifies the signature** - This is CRITICAL for security!
3. If verified, updates order status to COMPLETED
4. Creates a payment record
5. Returns success

### ⚠️ Why Signature Verification is Important

Without verification, anyone could send a fake request saying "I paid!" and get the project for free. The signature is created using your secret key, so only Razorpay can generate a valid one.

---

## 🎨 Frontend Implementation

### Step 1: Load Razorpay Script

In your layout or the page where you need payments:

```typescript
// Add this script to your page
<Script src="https://checkout.razorpay.com/v1/checkout.js" />
```

Or dynamically load it:

```typescript
const loadRazorpay = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};
```

---

### Step 2: Create Buy Button Component

Create file: `components/BuyButton.tsx`

```typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface BuyButtonProps {
  projectId: string;
  price: number; // in rupees
  projectTitle: string;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function BuyButton({
  projectId,
  price,
  projectTitle,
}: BuyButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);

    try {
      // 1. Create order on your backend
      const res = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to create order");
        return;
      }

      // 2. Configure Razorpay options
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: data.currency,
        name: "ProjectsHub",
        description: projectTitle,
        order_id: data.orderId,
        handler: async function (response: any) {
          // 3. Payment successful! Verify on backend
          const verifyRes = await fetch("/api/payments/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              dbOrderId: data.dbOrderId,
            }),
          });

          const verifyData = await verifyRes.json();

          if (verifyData.success) {
            alert("Payment successful! Redirecting to your orders...");
            router.push("/dashboard/orders");
          } else {
            alert("Payment verification failed. Please contact support.");
          }
        },
        prefill: {
          // You can prefill user details here
          // email: userEmail,
          // contact: userPhone,
        },
        theme: {
          color: "#4F46E5", // Indigo color to match your theme
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      // 4. Open Razorpay checkout
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Payment error:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className="w-full py-4 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
    >
      {loading ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin" />
          Processing...
        </>
      ) : (
        `Buy Now - ₹${price}`
      )}
    </button>
  );
}
```

---

### Step 3: Use in Project Detail Page

In your `/app/projects/[id]/page.tsx`, add the BuyButton:

```typescript
import BuyButton from "@/components/BuyButton";
import Script from "next/script";

export default async function ProjectDetailPage({ params }) {
  // ... fetch project

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />

      {/* Your existing UI */}

      {/* Buy Button */}
      <BuyButton
        projectId={project.id}
        price={project.price}
        projectTitle={project.title}
      />
    </>
  );
}
```

---

## 📦 Orders Dashboard

### Create Orders Page

Create file: `app/dashboard/orders/page.tsx`

```typescript
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
      status: "COMPLETED",
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
```

---

## 🧪 Testing Payments

### Test Card Details

Use these test cards in TEST MODE:

| Card Type            | Number              | Expiry          | CVV          |
| -------------------- | ------------------- | --------------- | ------------ |
| Mastercard (Success) | 5267 3181 8797 5449 | Any future date | Any 3 digits |
| Visa (Success)       | 4111 1111 1111 1111 | Any future date | Any 3 digits |
| Card Declined        | 4000 0000 0000 0002 | Any future date | Any 3 digits |

### Test UPI

- Use any UPI ID ending with `@razorpay`
- Example: `success@razorpay` (always succeeds)
- Example: `failure@razorpay` (always fails)

### Test Netbanking

- Select any bank
- Use OTP: `1234` for success

---

## 🚀 Going Live

### Checklist Before Going Live

1. **Complete KYC** on Razorpay Dashboard

   - PAN Card
   - Bank Account Details
   - Business Proof (if applicable)

2. **Generate Live API Keys**

   - Settings → API Keys → Generate Live Key

3. **Update Environment Variables**

   ```env
   RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxx
   RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
   NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxx
   ```

4. **Test with Real Payment**

   - Make a ₹1 test transaction
   - Refund it from Dashboard

5. **Set Up Webhooks (Optional but Recommended)**
   - Dashboard → Settings → Webhooks
   - Add endpoint: `https://yourdomain.com/api/webhooks/razorpay`
   - Select events: `payment.captured`, `payment.failed`

---

## 🔐 Security Best Practices

1. **Never log sensitive data**

   - Don't log full card numbers, CVV, etc.

2. **Always verify signature**

   - Never trust frontend-only verification

3. **Use HTTPS in production**

   - Razorpay requires HTTPS for live mode

4. **Keep secrets secret**

   - Never commit `.env` to Git
   - Use environment variables in production

5. **Validate amounts**
   - Always fetch price from database, never from frontend

---

## 🐛 Common Issues & Solutions

### Issue: "Order creation failed"

**Solution**: Check if Razorpay credentials are correct in `.env`

### Issue: "Payment verification failed"

**Solution**: Ensure `RAZORPAY_KEY_SECRET` is correct

### Issue: Checkout popup not opening

**Solution**: Check if Script is loaded before calling `new Razorpay()`

### Issue: "You already own this project"

**Solution**: Check the existing order query in create-order API

---

## 📁 Final File Structure

```
app/
├── api/
│   └── payments/
│       ├── create-order/
│       │   └── route.ts
│       └── verify/
│           └── route.ts
├── dashboard/
│   └── orders/
│       └── page.tsx
└── projects/
    └── [id]/
        └── page.tsx (add BuyButton here)

components/
└── BuyButton.tsx

lib/
├── prisma.ts
├── s3.ts
└── razorpay.ts

.env (add Razorpay keys)
```

---

## ✅ Summary

1. **Create Razorpay account** and get API keys
2. **Add keys to `.env`**
3. **Install `razorpay` package**
4. **Create API routes** for order creation and verification
5. **Create BuyButton component** for frontend
6. **Create Orders page** for downloads
7. **Test with test cards**
8. **Go live** after KYC approval

---

## 📚 Official Resources

- [Razorpay Documentation](https://razorpay.com/docs/)
- [Razorpay Node.js SDK](https://github.com/razorpay/razorpay-node)
- [Test Cards & UPI IDs](https://razorpay.com/docs/payments/payments/test-card-upi-details/)
- [Webhooks Guide](https://razorpay.com/docs/webhooks/)

---

**Good luck with your payment integration! 🚀💳**
