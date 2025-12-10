import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  // Allow all requests - we handle auth in individual routes/layouts
  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
