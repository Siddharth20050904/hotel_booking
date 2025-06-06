"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { ChevronLeft, Save } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function SettingsForm() {
  const [formState, setFormState] = useState({
    // Personal details
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",

    // IDs
    idType: "passport",
    idNumber: "AB123456",

    // Preferences
    preferredCurrency: "usd",
    preferredLanguage: "english",
    newsletterSubscription: true,
    specialOffers: true,
    roomPreferences: "I prefer a quiet room away from elevators, with a king-sized bed if possible.",
    dietaryRestrictions: "No nuts, vegetarian options preferred",
  })

  const handleChange = (field: string, value: string | boolean) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      // For demo purposes, we'll use user ID 1
      const response = await fetch("/api/users/1")
      if (response.ok) {
        const userData = await response.json()
        setFormState({
          firstName: userData.first_name || "",
          lastName: userData.last_name || "",
          email: userData.email || "",
          phone: userData.phone || "",
          idType: userData.id_type || "passport",
          idNumber: userData.id_number || "",
          preferredCurrency: userData.preferred_currency || "usd",
          preferredLanguage: userData.preferred_language || "english",
          newsletterSubscription: userData.newsletter_subscription ?? true,
          specialOffers: userData.special_offers ?? true,
          roomPreferences: userData.room_preferences || "",
          dietaryRestrictions: userData.dietary_restrictions || "",
        })
      }
    } catch (error) {
      console.error("Error loading user data:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // For demo purposes, we'll use user ID 1
      // In a real app, this would come from authentication
      const response = await fetch("/api/users/1", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          first_name: formState.firstName,
          last_name: formState.lastName,
          phone: formState.phone,
          id_type: formState.idType,
          id_number: formState.idNumber,
          preferred_currency: formState.preferredCurrency,
          preferred_language: formState.preferredLanguage,
          newsletter_subscription: formState.newsletterSubscription,
          special_offers: formState.specialOffers,
          room_preferences: formState.roomPreferences,
          dietary_restrictions: formState.dietaryRestrictions,
        }),
      })

      if (response.ok) {
        alert("Settings saved successfully!")
      } else {
        alert("Failed to save settings")
      }
    } catch (error) {
      console.error("Error saving settings:", error)
      alert("Failed to save settings")
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/">
          <Button variant="ghost" className="gap-2">
            <ChevronLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid grid-cols-3 mb-8">
          <TabsTrigger value="personal">Personal Details</TabsTrigger>
          <TabsTrigger value="ids">IDs & Documents</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        <form onSubmit={handleSubmit}>
          <TabsContent value="personal">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your personal details used for bookings and communication</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={formState.firstName}
                      onChange={(e) => handleChange("firstName", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={formState.lastName}
                      onChange={(e) => handleChange("lastName", e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formState.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" value={formState.phone} onChange={(e) => handleChange("phone", e.target.value)} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ids">
            <Card>
              <CardHeader>
                <CardTitle>ID Documents</CardTitle>
                <CardDescription>Manage your identification documents for faster check-in</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="idType">ID Type</Label>
                  <Select value={formState.idType} onValueChange={(value) => handleChange("idType", value)}>
                    <SelectTrigger id="idType">
                      <SelectValue placeholder="Select ID type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="passport">Passport</SelectItem>
                      <SelectItem value="driverLicense">Driver's License</SelectItem>
                      <SelectItem value="nationalId">National ID</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="idNumber">ID Number</Label>
                  <Input
                    id="idNumber"
                    value={formState.idNumber}
                    onChange={(e) => handleChange("idNumber", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="idUpload">Upload ID Document (Optional)</Label>
                  <Input id="idUpload" type="file" />
                  <p className="text-xs text-muted-foreground mt-1">Accepted formats: PDF, JPG, PNG (max 5MB)</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences">
            <Card>
              <CardHeader>
                <CardTitle>Your Preferences</CardTitle>
                <CardDescription>Customize your booking experience and preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="preferredCurrency">Preferred Currency</Label>
                    <Select
                      value={formState.preferredCurrency}
                      onValueChange={(value) => handleChange("preferredCurrency", value)}
                    >
                      <SelectTrigger id="preferredCurrency">
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="usd">USD ($)</SelectItem>
                        <SelectItem value="eur">EUR (€)</SelectItem>
                        <SelectItem value="gbp">GBP (£)</SelectItem>
                        <SelectItem value="jpy">JPY (¥)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="preferredLanguage">Preferred Language</Label>
                    <Select
                      value={formState.preferredLanguage}
                      onValueChange={(value) => handleChange("preferredLanguage", value)}
                    >
                      <SelectTrigger id="preferredLanguage">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="english">English</SelectItem>
                        <SelectItem value="spanish">Spanish</SelectItem>
                        <SelectItem value="french">French</SelectItem>
                        <SelectItem value="german">German</SelectItem>
                        <SelectItem value="japanese">Japanese</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="newsletter">Newsletter Subscription</Label>
                      <p className="text-sm text-muted-foreground">Receive updates on special offers and promotions</p>
                    </div>
                    <Switch
                      id="newsletter"
                      checked={formState.newsletterSubscription}
                      onCheckedChange={(checked) => handleChange("newsletterSubscription", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="specialOffers">Special Offers</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive personalized deals based on your preferences
                      </p>
                    </div>
                    <Switch
                      id="specialOffers"
                      checked={formState.specialOffers}
                      onCheckedChange={(checked) => handleChange("specialOffers", checked)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="roomPreferences">Room Preferences</Label>
                  <Textarea
                    id="roomPreferences"
                    placeholder="Describe your room preferences..."
                    value={formState.roomPreferences}
                    onChange={(e) => handleChange("roomPreferences", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dietaryRestrictions">Dietary Restrictions</Label>
                  <Textarea
                    id="dietaryRestrictions"
                    placeholder="Any dietary restrictions or preferences..."
                    value={formState.dietaryRestrictions}
                    onChange={(e) => handleChange("dietaryRestrictions", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <div className="mt-6 flex justify-end">
            <Button type="submit" className="gap-2">
              <Save className="h-4 w-4" />
              Save Settings
            </Button>
          </div>
        </form>
      </Tabs>
    </div>
  )
}
