"use client"

import { useState, useEffect } from "react"
import { Calendar, Users, Clock } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Booking {
  id: number
  hotel_name: string
  room_type: string
  check_in_date: string
  check_out_date: string
  guests: number
  total_price: number
  status: string
  special_requests: string
  image_url: string
  created_at: string
}

export function UserBookings() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      // For demo purposes, using user ID 1. In real app, this would come from authentication
      const response = await fetch("/api/bookings?userId=1")

      if (!response.ok) {
        throw new Error("Failed to fetch bookings")
      }

      const data = await response.json()
      setBookings(data)
      setError("")
    } catch (error) {
      console.error("Error fetching bookings:", error)
      setError("Failed to load bookings. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return "bg-green-500"
      case "pending":
        return "bg-yellow-500"
      case "cancelled":
        return "bg-red-500"
      case "completed":
        return "bg-blue-500"
      default:
        return "bg-gray-500"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <p>Loading your bookings...</p>
      </div>
    )
  }

  if (error) {
    return (
      <Alert>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (bookings.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium mb-2">No bookings found</h3>
        <p className="text-muted-foreground mb-4">You haven't made any reservations yet.</p>
        <Link href="/">
          <Button>Browse Hotels</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-muted-foreground">{bookings.length} booking(s) found</p>
        <Link href="/">
          <Button variant="outline">Book Another Stay</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bookings.map((booking) => (
          <Card key={booking.id} className="overflow-hidden">
            <div className="relative h-48">
              <Image
                src={booking.image_url || "/placeholder.svg?height=200&width=400"}
                alt={booking.hotel_name}
                fill
                className="object-cover"
              />
              <Badge className={`absolute top-2 right-2 ${getStatusColor(booking.status)}`}>
                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
              </Badge>
            </div>

            <CardHeader>
              <CardTitle className="text-lg">{booking.hotel_name}</CardTitle>
              <p className="text-sm text-muted-foreground">{booking.room_type}</p>
            </CardHeader>

            <CardContent className="space-y-3">
              <div className="flex items-center text-sm">
                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>
                  {formatDate(booking.check_in_date)} - {formatDate(booking.check_out_date)}
                </span>
              </div>

              <div className="flex items-center text-sm">
                <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>
                  {booking.guests} {booking.guests === 1 ? "Guest" : "Guests"}
                </span>
              </div>

              <div className="flex items-center text-sm">
                <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>Booked on {formatDate(booking.created_at)}</span>
              </div>

              {booking.special_requests && (
                <div className="text-sm">
                  <span className="font-medium">Special Requests:</span>
                  <p className="text-muted-foreground mt-1">{booking.special_requests}</p>
                </div>
              )}

              <div className="pt-2 border-t">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Paid</span>
                  <span className="font-bold text-lg">${booking.total_price}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
