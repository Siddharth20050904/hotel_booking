"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, MapPin, Star, Wifi, Check } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { BookingModal } from "./booking-modal"

interface Room {
  id: number
  room_type: string
  description: string
  price_per_night: number
  max_occupancy: number
  amenities: string[]
  image_url: string
  available_rooms: number
}

interface Review {
  id: number
  rating: number
  title: string
  comment: string
  first_name: string
  last_name: string
  created_at: string
}

interface Hotel {
  id: number
  name: string
  description: string
  location: string
  address: string
  city: string
  country: string
  rating: number
  total_reviews: number
  amenities: string[]
  couple_friendly: boolean
  image_url: string
  rooms: Room[]
  reviews: Review[]
}

export function HotelDetails({ hotelId }: { hotelId: string }) {
  const [hotel, setHotel] = useState<Hotel | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchHotelDetails()
  }, [hotelId])

  const fetchHotelDetails = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/hotels/${hotelId}`)

      if (!response.ok) {
        throw new Error("Failed to fetch hotel details")
      }

      const data = await response.json()
      setHotel(data)
      setError("")
    } catch (error) {
      console.error("Error fetching hotel details:", error)
      setError("Failed to load hotel details. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  const handleBookingSuccess = () => {
    // Refresh hotel details to update room availability
    fetchHotelDetails()
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[50vh]">
          <p>Loading hotel details...</p>
        </div>
      </div>
    )
  }

  if (error || !hotel) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertDescription>{error || "Hotel not found"}</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Link href="/">
            <Button variant="outline" className="gap-2">
              <ChevronLeft className="h-4 w-4" />
              Back to Hotels
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/">
          <Button variant="outline" className="gap-2">
            <ChevronLeft className="h-4 w-4" />
            Back to Hotels
          </Button>
        </Link>
      </div>

      {/* Hotel Header */}
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <div className="relative w-full md:w-2/3 h-[300px] md:h-[400px] rounded-lg overflow-hidden">
          <Image
            src={hotel.image_url || "/placeholder.svg?height=400&width=600"}
            alt={hotel.name}
            fill
            className="object-cover"
          />
          {hotel.couple_friendly && <Badge className="absolute top-4 right-4 bg-rose-500">Couple Friendly</Badge>}
        </div>

        <div className="w-full md:w-1/3">
          <h1 className="text-3xl font-bold mb-2">{hotel.name}</h1>

          <div className="flex items-center mb-2">
            <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
            <span className="text-muted-foreground">
              {hotel.address}, {hotel.city}, {hotel.country}
            </span>
          </div>

          <div className="flex items-center mb-4">
            <Star className="h-5 w-5 fill-yellow-400 stroke-yellow-400 mr-1" />
            <span className="font-medium mr-2">{hotel.rating}</span>
            <span className="text-muted-foreground">({hotel.total_reviews} reviews)</span>
          </div>

          <div className="mb-6">
            <h3 className="font-medium mb-2">Hotel Amenities</h3>
            <div className="flex flex-wrap gap-2">
              {hotel.amenities.map((amenity) => (
                <Badge key={amenity} variant="outline" className="text-xs">
                  {amenity}
                </Badge>
              ))}
            </div>
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <h3 className="font-medium mb-2">Location</h3>
            <p className="text-sm text-muted-foreground mb-2">{hotel.location}</p>
            <div className="h-[150px] bg-gray-200 rounded-md flex items-center justify-center">
              <p className="text-sm text-muted-foreground">Map placeholder</p>
            </div>
          </div>
        </div>
      </div>

      {/* Hotel Description */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">About This Hotel</h2>
        <p className="text-muted-foreground">{hotel.description}</p>
      </div>

      <Separator className="my-8" />

      {/* Rooms and Reviews Tabs */}
      <Tabs defaultValue="rooms" className="w-full">
        <TabsList className="grid w-full md:w-[400px] grid-cols-2">
          <TabsTrigger value="rooms">Available Rooms</TabsTrigger>
          <TabsTrigger value="reviews">Guest Reviews</TabsTrigger>
        </TabsList>

        {/* Rooms Tab */}
        <TabsContent value="rooms" className="mt-6">
          <h2 className="text-2xl font-bold mb-6">Select Your Room</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {hotel.rooms && hotel.rooms.length > 0 ? (
              hotel.rooms.map((room) => (
                <Card key={room.id} className="overflow-hidden">
                  <div className="relative h-48">
                    <Image
                      src={room.image_url || "/placeholder.svg?height=200&width=400"}
                      alt={room.room_type}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <CardContent className="pt-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg">{room.room_type}</h3>
                      <Badge variant={room.available_rooms > 0 ? "outline" : "destructive"}>
                        {room.available_rooms > 0 ? `${room.available_rooms} available` : "Sold out"}
                      </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground mb-4">{room.description}</p>

                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <div className="flex items-center text-sm">
                        <Check className="h-4 w-4 mr-2 text-green-500" />
                        <span>Max {room.max_occupancy} guests</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Wifi className="h-4 w-4 mr-2" />
                        <span>Free WiFi</span>
                      </div>
                    </div>

                    <div className="mt-2">
                      <h4 className="text-sm font-medium mb-2">Room Amenities</h4>
                      <div className="flex flex-wrap gap-2">
                        {room.amenities.map((amenity) => (
                          <Badge key={amenity} variant="secondary" className="text-xs">
                            {amenity}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>

                  <Separator />

                  <CardFooter className="flex justify-between pt-4">
                    <div className="font-semibold">
                      ${room.price_per_night}
                      <span className="text-sm text-muted-foreground font-normal"> / night</span>
                    </div>
                    {room.available_rooms > 0 ? (
                      <BookingModal
                        hotelId={hotel.id}
                        roomId={room.id}
                        roomType={room.room_type}
                        pricePerNight={room.price_per_night}
                        maxOccupancy={room.max_occupancy}
                        hotelName={hotel.name}
                        onBookingSuccess={handleBookingSuccess}
                      />
                    ) : (
                      <Button disabled>Sold Out</Button>
                    )}
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">No rooms available at this time</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Reviews Tab */}
        <TabsContent value="reviews" className="mt-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Guest Reviews</h2>
            <div className="flex items-center">
              <Star className="h-5 w-5 fill-yellow-400 stroke-yellow-400 mr-1" />
              <span className="font-medium mr-1">{hotel.rating}</span>
              <span className="text-muted-foreground">({hotel.total_reviews} reviews)</span>
            </div>
          </div>

          {hotel.reviews && hotel.reviews.length > 0 ? (
            <div className="space-y-6">
              {hotel.reviews.map((review) => (
                <div key={review.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold">{review.title}</h3>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 fill-yellow-400 stroke-yellow-400 mr-1" />
                      <span>{review.rating}/5</span>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4">{review.comment}</p>

                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>
                      {review.first_name} {review.last_name.charAt(0)}.
                    </span>
                    <span>{new Date(review.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No reviews yet</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
