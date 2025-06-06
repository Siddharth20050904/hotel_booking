"use client"

import { useState } from "react"
import { CalendarIcon } from "lucide-react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface BookingModalProps {
  hotelId: number
  roomId: number
  roomType: string
  pricePerNight: number
  maxOccupancy: number
  hotelName: string
  onBookingSuccess?: () => void
}

// Helper function to format dates without external dependency
const formatDate = (date: Date) => {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

const formatDateForAPI = (date: Date) => {
  return date.toISOString().split("T")[0] // YYYY-MM-DD format
}

export function BookingModal({
  hotelId,
  roomId,
  roomType,
  pricePerNight,
  maxOccupancy,
  hotelName,
  onBookingSuccess,
}: BookingModalProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [checkInDate, setCheckInDate] = useState<Date | undefined>(new Date())
  const [checkOutDate, setCheckOutDate] = useState<Date | undefined>(
    new Date(new Date().setDate(new Date().getDate() + 1)),
  )
  const [guests, setGuests] = useState(1)
  const [specialRequests, setSpecialRequests] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const calculateNights = () => {
    if (!checkInDate || !checkOutDate) return 0
    return Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))
  }

  const calculateTotal = () => {
    const nights = calculateNights()
    return nights * pricePerNight
  }

  const handleBooking = async () => {
    if (!session) {
      router.push("/auth/signin")
      return
    }

    console.log("Booking button clicked!")

    if (!checkInDate || !checkOutDate) {
      setError("Please select check-in and check-out dates")
      return
    }

    if (calculateNights() < 1) {
      setError("Check-out date must be after check-in date")
      return
    }

    setLoading(true)
    setError("")

    try {
      console.log("Sending booking request...")

      const bookingData = {
        user_id: Number.parseInt(session.user.id),
        hotel_id: hotelId,
        room_id: roomId,
        check_in_date: formatDateForAPI(checkInDate),
        check_out_date: formatDateForAPI(checkOutDate),
        guests,
        total_price: calculateTotal(),
        special_requests: specialRequests,
      }

      console.log("Booking data:", bookingData)

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingData),
      })

      console.log("Response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json()
        console.error("Booking error:", errorData)
        throw new Error(errorData.error || "Failed to create booking")
      }

      const booking = await response.json()
      console.log("Booking created:", booking)

      setSuccess(true)

      // Call success callback if provided
      if (onBookingSuccess) {
        onBookingSuccess()
      }

      // Close modal after 3 seconds
      setTimeout(() => {
        setOpen(false)
        setSuccess(false)
        // Reset form
        setCheckInDate(new Date())
        setCheckOutDate(new Date(new Date().setDate(new Date().getDate() + 1)))
        setGuests(1)
        setSpecialRequests("")
      }, 3000)
    } catch (error) {
      console.error("Error creating booking:", error)
      setError(error.message || "Failed to create booking. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="gap-2">
            <CalendarIcon className="h-4 w-4" />
            Book Now
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Booking Confirmed! 🎉</DialogTitle>
            <DialogDescription>Your reservation has been successfully created.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-medium text-green-800 mb-2">Booking Details</h3>
              <div className="text-sm text-green-700 space-y-1">
                <p>
                  <strong>Hotel:</strong> {hotelName}
                </p>
                <p>
                  <strong>Room:</strong> {roomType}
                </p>
                <p>
                  <strong>Dates:</strong> {checkInDate && formatDate(checkInDate)} -{" "}
                  {checkOutDate && formatDate(checkOutDate)}
                </p>
                <p>
                  <strong>Guests:</strong> {guests}
                </p>
                <p>
                  <strong>Total:</strong> ${calculateTotal()}
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="gap-2"
          onClick={() => {
            if (!session) {
              router.push("/auth/signin")
              return
            }
            console.log("Book Now button clicked!")
            setOpen(true)
          }}
        >
          <CalendarIcon className="h-4 w-4" />
          {session ? "Book Now" : "Sign In to Book"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Book Your Stay</DialogTitle>
          <DialogDescription>
            {roomType} at {hotelName} - ${pricePerNight} per night
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="checkin">Check-in Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn("w-full justify-start text-left font-normal", !checkInDate && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {checkInDate ? formatDate(checkInDate) : <span>Pick check-in date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={checkInDate}
                  onSelect={setCheckInDate}
                  disabled={(date) => date < new Date()}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="checkout">Check-out Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn("w-full justify-start text-left font-normal", !checkOutDate && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {checkOutDate ? formatDate(checkOutDate) : <span>Pick check-out date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={checkOutDate}
                  onSelect={setCheckOutDate}
                  disabled={(date) => date <= (checkInDate || new Date())}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="guests">Number of Guests</Label>
            <Select value={guests.toString()} onValueChange={(value) => setGuests(Number.parseInt(value))}>
              <SelectTrigger id="guests">
                <SelectValue placeholder="Select number of guests" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: maxOccupancy }, (_, i) => i + 1).map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num} {num === 1 ? "Guest" : "Guests"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="special-requests">Special Requests (Optional)</Label>
            <Input
              id="special-requests"
              placeholder="Any special requests or preferences?"
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
            />
          </div>

          <div className="bg-muted p-3 rounded-md">
            <div className="flex justify-between text-sm mb-1">
              <span>Price per night</span>
              <span>${pricePerNight}</span>
            </div>
            <div className="flex justify-between text-sm mb-1">
              <span>Number of nights</span>
              <span>{calculateNights()}</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between font-medium">
              <span>Total</span>
              <span>${calculateTotal()}</span>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleBooking} disabled={loading || calculateNights() < 1}>
            {loading ? "Processing..." : "Confirm Booking"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
