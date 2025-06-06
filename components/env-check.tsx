"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export function EnvCheck() {
  const [envStatus, setEnvStatus] = useState<any>(null)
  const [authStatus, setAuthStatus] = useState<any>(null)

  useEffect(() => {
    checkEnvironment()
    checkAuthHealth()
  }, [])

  const checkEnvironment = async () => {
    try {
      const response = await fetch("/api/health")
      const result = await response.text()

      try {
        const data = JSON.parse(result)
        setEnvStatus(data)
      } catch {
        setEnvStatus({ error: "Failed to parse health check", raw: result })
      }
    } catch (error) {
      setEnvStatus({ error: error.message })
    }
  }

  const checkAuthHealth = async () => {
    try {
      const response = await fetch("/api/auth/health")
      const result = await response.text()

      try {
        const data = JSON.parse(result)
        setAuthStatus(data)
      } catch {
        setAuthStatus({ error: "Failed to parse auth health check", raw: result })
      }
    } catch (error) {
      setAuthStatus({ error: error.message })
    }
  }

  if (process.env.NODE_ENV !== "development") {
    return null
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Environment Status
          <Button
            onClick={() => {
              checkEnvironment()
              checkAuthHealth()
            }}
            size="sm"
          >
            Refresh
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Database Status */}
        {envStatus && (
          <div className="space-y-2">
            <h4 className="font-medium">Database</h4>
            <div className="flex items-center gap-2">
              <span>Status:</span>
              <Badge variant={envStatus.database === "connected" ? "default" : "destructive"}>
                {envStatus.database || "unknown"}
              </Badge>
            </div>
            {envStatus.error && (
              <Alert variant="destructive">
                <AlertDescription>{envStatus.error}</AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Auth Status */}
        {authStatus && (
          <div className="space-y-2">
            <h4 className="font-medium">Authentication</h4>
            <div className="flex items-center gap-2">
              <span>Status:</span>
              <Badge variant={authStatus.status === "healthy" ? "default" : "destructive"}>
                {authStatus.status || "unknown"}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span>Demo User:</span>
              <Badge variant={authStatus.demoUser === "exists" ? "default" : "destructive"}>
                {authStatus.demoUser || "unknown"}
              </Badge>
            </div>
            {authStatus.error && (
              <Alert variant="destructive">
                <AlertDescription>{authStatus.error}</AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
