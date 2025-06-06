"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { ChevronLeft, Save } from "lucide-react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function SettingsForm() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [formState, setFormState] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    idType: "passport",
    idNumber: "",
    preferredCurrency: "USD",
    preferredLanguage: "english",
    newsletterSubscription: true,
    specialOffers: true,
    roomPreferences: "",
    dietaryRestrictions: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (status === "loading") return

    if (!session) {
      router.push("/auth/signin")
      return
    }

    loadUserData()
  }, [session, status, router])

  const handleChange = (field: string, value: string | boolean) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const loadUserData = async () => {
    if (!session?.user?.id) return

    try {
      const response = await fetch(`/api/users/${session.user.id}`)
      if (response.ok) {
        const userData = await response.json()
        setFormState({
          firstName: userData.first_name || "",
          lastName: userData.last_name || "",
          email: userData.email || "",
          phone: userData.phone || "",
          idType: userData.id_type || "passport",
          idNumber: userData.id_number || "",
          preferredCurrency: userData.preferred_currency || "USD",
          preferredLanguage: userData.preferred_language || "english",
          newsletterSubscription: userData.newsletter_subscription ?? true,
          specialOffers: userData.special_offers ?? true,
          roomPreferences: userData.room_preferences || "",
          dietaryRestrictions: userData.dietary_restrictions || "",
        })
      }
    } catch (error) {
      console.error("Error loading user data:", error)
      setError("Failed to load user data")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!session?.user?.id) return

    setLoading(true)
    setError("")
    setSuccess(false)

    try {
      const response = await fetch(`/api/users/${session.user.id}`, {
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
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
      } else {
        setError("Failed to save settings")
      }
    } catch (error) {
      console.error("Error saving settings:", error)
      setError("Failed to save settings")
    } finally {
      setLoading(false)
    }
  }

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <p>Loading...</p>
      </div>
    )
  }

  if (!session) {
    return null // Will redirect to sign in
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

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-6">
          <AlertDescription>Settings saved successfully!</AlertDescription>
        </Alert>
      )}

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
                  <Input id="email" type="email" value={formState.email} disabled className="bg-muted" />
                  <p className="text-xs text-muted-foreground">Email cannot be changed</p>
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
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="GBP">GBP (£)</SelectItem>
                        <SelectItem value="JPY">JPY (¥)</SelectItem>
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
            <Button type="submit" className="gap-2" disabled={loading}>
              <Save className="h-4 w-4" />
              {loading ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </form>
      </Tabs>
    </div>
  )
}
