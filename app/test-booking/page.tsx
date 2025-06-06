"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TestBookingPage() {
  const [result, setResult] = useState("")
  const [loading, setLoading] = useState(false)

  const initializeDatabase = async () => {
    setLoading(true)
    setResult("")

    try {
      const response = await fetch("/api/init-db", {
        method: "POST",
      })

      const data = await response.json()

      if (response.ok) {
        setResult(`✅ Database initialized successfully! ${data.message}`)
      } else {
        setResult(`❌ Database initialization failed: ${data.error}`)
      }
    } catch (error) {
      setResult(`❌ Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const testBooking = async () => {
    setLoading(true)
    setResult("")

    try {
      const bookingData = {
        user_id: 1,
        hotel_id: 2, // Seaside Resort
        room_id: 3, // Ocean View Room
        check_in_date: "2024-12-07",
        check_out_date: "2024-12-08",
        guests: 2,
        total_price: 200.0,
        special_requests: "Test booking from test page",
      }

      console.log("Testing booking with data:", bookingData)

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingData),
      })

      const data = await response.json()

      if (response.ok) {
        setResult(`✅ Booking successful! 
        Booking ID: ${data.id}
        Status: ${data.status}
        Total: $${data.total_price}`)
      } else {
        setResult(`❌ Booking failed: ${data.error}
        ${data.details ? `Details: ${data.details}` : ""}`)
      }
    } catch (error) {
      setResult(`❌ Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const checkUser = async () => {
    setLoading(true)
    setResult("")

    try {
      const response = await fetch("/api/users/1")
      const data = await response.json()

      if (response.ok) {
        setResult(`✅ User found! 
        Name: ${data.first_name} ${data.last_name}
        Email: ${data.email}`)
      } else {
        setResult(`❌ User not found: ${data.error}`)
      }
    } catch (error) {
      setResult(`❌ Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Booking System Diagnostics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={initializeDatabase} disabled={loading} className="w-full">
            1. Initialize Database
          </Button>

          <Button onClick={checkUser} disabled={loading} className="w-full">
            2. Check Demo User
          </Button>

          <Button onClick={testBooking} disabled={loading} className="w-full">
            3. Test Booking API
          </Button>

          {result && (
            <div className="p-3 bg-muted rounded-md">
              <pre className="text-sm whitespace-pre-wrap">{result}</pre>
            </div>
          )}

          {loading && (
            <div className="text-center">
              <p>Processing...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
