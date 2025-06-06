"use client"

import { useState, useEffect } from "react"
import { Search, MapPin, SlidersHorizontal, Star, Database, RefreshCw } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { UserMenu } from "@/components/user-menu"
import { DebugPanel } from "@/components/debug-panel"
import { safeParseResponse } from "@/lib/api-utils"
import { EnvCheck } from "@/components/env-check"

// Helper component for hotel card images with fallback
function HotelCardImage({ src, alt, hotelName }: { src: string; alt: string; hotelName: string }) {
  const [imgSrc, setImgSrc] = useState(src)
  const [hasError, setHasError] = useState(false)

  const handleError = () => {
    setHasError(true)
  }

  return (
    <div className="relative h-48">
      {hasError ? (
        <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
          <div className="text-center text-blue-600">
            <div className="text-4xl mb-2">🏨</div>
            <div className="text-sm font-medium">{hotelName}</div>
          </div>
        </div>
      ) : (
        <Image
          src={imgSrc || "/placeholder.svg"}
          alt={alt}
          fill
          className="object-cover"
          onError={handleError}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      )}
    </div>
  )
}

export function HotelDashboard() {
  const [searchQuery, setSearchQuery] = useState("")
  const [priceRange, setPriceRange] = useState([0, 300])
  const [location, setLocation] = useState("all")
  const [coupleFriendly, setCoupleFriendly] = useState(false)
  const [hotels, setHotels] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [dbInitialized, setDbInitialized] = useState(false)

  useEffect(() => {
    fetchHotels()
  }, [searchQuery, priceRange, location, coupleFriendly])

  const initializeDatabase = async () => {
    try {
      setLoading(true)
      setError("")

      console.log("🚀 Initializing database...")

      const response = await fetch("/api/init-db", {
        method: "POST",
      })

      const result = await safeParseResponse(response)
      console.log("📊 Init DB result:", result)

      if (result.ok && result.success && result.data?.success) {
        setDbInitialized(true)
        setError("")
        console.log("✅ Database initialized, fetching hotels...")
        await fetchHotels()
      } else {
        let errorMessage = "Failed to initialize database"

        if (result.data?.details) {
          errorMessage = `Database error: ${result.data.details}`
        } else if (result.data?.error) {
          errorMessage = result.data.error
        } else if (result.text) {
          errorMessage = `Server error: ${result.text.substring(0, 100)}`
        }

        console.error("❌ Database initialization failed:", errorMessage)
        setError(errorMessage)
      }
    } catch (error) {
      console.error("❌ Error initializing database:", error)
      setError(`Failed to initialize database: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const fetchHotels = async () => {
    setLoading(true)
    setError("")

    try {
      const params = new URLSearchParams({
        search: searchQuery,
        location: location,
        minPrice: priceRange[0].toString(),
        maxPrice: priceRange[1].toString(),
        coupleFriendly: coupleFriendly.toString(),
      })

      console.log("🔍 Fetching hotels with params:", params.toString())

      const response = await fetch(`/api/hotels?${params}`)
      console.log("📡 Response status:", response.status, response.statusText)

      const result = await safeParseResponse(response)
      console.log("📊 API Response result:", {
        ok: result.ok,
        success: result.success,
        status: result.status,
        dataType: typeof result.data,
        dataLength: Array.isArray(result.data) ? result.data.length : "not array",
        textPreview: result.text?.substring(0, 100) + "...",
        parseError: result.parseError,
      })

      if (!result.ok) {
        let errorMessage = "Failed to fetch hotels"

        if (result.success && result.data?.error) {
          errorMessage = result.data.error
          if (result.data.code === "TABLES_NOT_FOUND") {
            setError("Database tables not found. Please initialize the database first.")
            setDbInitialized(false)
            setHotels([])
            return
          }
        } else if (result.text) {
          // Handle non-JSON responses
          errorMessage = `Server error (${result.status}): Please try initializing the database.`
        }

        console.error("❌ API Error:", errorMessage)
        setError(errorMessage)
        setHotels([])
        return
      }

      if (result.success && Array.isArray(result.data)) {
        console.log(`✅ Successfully fetched ${result.data.length} hotels`)
        setHotels(result.data)
        setError("")
        setDbInitialized(true)
      } else {
        console.error("❌ Invalid response format:", result)
        setError("Invalid response from server. Please try again.")
        setHotels([])
      }
    } catch (error) {
      console.error("❌ Network error fetching hotels:", error)
      setError(`Network error: ${error.message}. Please check your connection and try again.`)
      setDbInitialized(false)
      setHotels([])
    } finally {
      setLoading(false)
    }
  }

  const handleRetry = () => {
    console.log("🔄 Retrying fetch hotels...")
    fetchHotels()
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Find Your Stay</h1>
          <p className="text-muted-foreground">Discover and book the perfect hotel</p>
        </div>
        <div className="flex items-center gap-4">
          {error && (
            <div className="flex gap-2">
              <Button onClick={handleRetry} disabled={loading} variant="outline" className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Retry
              </Button>
              <Button onClick={initializeDatabase} disabled={loading} className="gap-2">
                <Database className="h-4 w-4" />
                {loading ? "Initializing..." : "Initialize Database"}
              </Button>
            </div>
          )}
          <UserMenu />
        </div>
      </header>

      {error && (
        <Alert className="mb-6" variant="destructive">
          <AlertDescription>
            <div className="space-y-2">
              <p>{error}</p>
              {error.includes("Internal server error") && (
                <p className="text-sm">
                  This usually means the database needs to be initialized. Try clicking "Initialize Database" above.
                </p>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search hotels by name..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={loading}
          />
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="gap-2" disabled={loading}>
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Filter Options</SheetTitle>
              <SheetDescription>Refine your hotel search results</SheetDescription>
            </SheetHeader>
            <div className="grid gap-6 py-6">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Price Range</h3>
                <Slider defaultValue={[0, 300]} max={500} step={10} value={priceRange} onValueChange={setPriceRange} />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">${priceRange[0]}</span>
                  <span className="text-sm text-muted-foreground">${priceRange[1]}</span>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Location</h3>
                <Select value={location} onValueChange={setLocation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    <SelectItem value="Downtown">Downtown</SelectItem>
                    <SelectItem value="Beachfront">Beachfront</SelectItem>
                    <SelectItem value="Midtown">Midtown</SelectItem>
                    <SelectItem value="Highlands">Highlands</SelectItem>
                    <SelectItem value="Arts District">Arts District</SelectItem>
                    <SelectItem value="Suburb">Suburb</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="couple-friendly" checked={coupleFriendly} onCheckedChange={setCoupleFriendly} />
                <Label htmlFor="couple-friendly">Couple Friendly</Label>
              </div>
            </div>

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => {
                  setPriceRange([0, 300])
                  setLocation("all")
                  setCoupleFriendly(false)
                }}
              >
                Reset
              </Button>
              <Button>Apply Filters</Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Active filters display */}
      <div className="flex flex-wrap gap-2 mb-6">
        {location !== "all" && (
          <Badge variant="outline" className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {location}
          </Badge>
        )}
        {priceRange[0] > 0 || priceRange[1] < 300 ? (
          <Badge variant="outline">
            ${priceRange[0]} - ${priceRange[1]}
          </Badge>
        ) : null}
        {coupleFriendly && <Badge variant="outline">Couple Friendly</Badge>}
      </div>

      {/* Hotel listings */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-12">
            <p>Loading hotels...</p>
          </div>
        ) : hotels.length > 0 ? (
          hotels.map((hotel) => (
            <Card key={hotel.id} className="overflow-hidden">
              <Link href={`/hotels/${hotel.id}`}>
                <HotelCardImage src={hotel.image_url || ""} alt={hotel.name} hotelName={hotel.name} />
                {hotel.couple_friendly && <Badge className="absolute top-2 right-2 bg-rose-500">Couple Friendly</Badge>}
              </Link>
              <CardContent className="pt-4">
                <div className="flex justify-between items-start">
                  <div>
                    <Link href={`/hotels/${hotel.id}`} className="hover:underline">
                      <h3 className="font-semibold text-lg">{hotel.name}</h3>
                    </Link>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3 mr-1" />
                      {hotel.location}
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 fill-yellow-400 stroke-yellow-400" />
                    <span className="ml-1 font-medium">{hotel.rating}</span>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {hotel.amenities?.map((amenity) => (
                    <Badge key={amenity} variant="secondary" className="text-xs">
                      {amenity}
                    </Badge>
                  ))}
                </div>
              </CardContent>
              <Separator />
              <CardFooter className="flex justify-between pt-4">
                <div className="font-semibold">
                  ${hotel.min_price}
                  <span className="text-sm text-muted-foreground font-normal"> / night</span>
                </div>
                <Link href={`/hotels/${hotel.id}`}>
                  <Button size="sm">View Details</Button>
                </Link>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <h3 className="text-lg font-medium">No hotels found</h3>
            <p className="text-muted-foreground mb-4">
              {error ? "Please initialize the database or try again" : "Try adjusting your filters"}
            </p>
            {error && (
              <Button onClick={initializeDatabase} disabled={loading} className="gap-2">
                <Database className="h-4 w-4" />
                Initialize Database
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Debug panel for development */}
      <DebugPanel />
      <EnvCheck />
    </div>
  )
}
