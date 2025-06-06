import { UserBookings } from "@/components/user-bookings"

export default function BookingsPage() {
  return (
    <main className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-8">My Bookings</h1>
      <UserBookings />
    </main>
  )
}
