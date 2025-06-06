"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function DebugPanel() {
  const [testResult, setTestResult] = useState("")
  const [loading, setLoading] = useState(false)

  const checkDatabaseStatus = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/db-status")
      const text = await response.text()

      try {
        const data = JSON.parse(text)
        setTestResult(`Database Status:\n${JSON.stringify(data, null, 2)}`)
      } catch (parseError) {
        setTestResult(`Database Status Raw Response:\n${text}`)
      }
    } catch (error) {
      setTestResult(`Database Status Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const initializeDatabase = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/init-db", { method: "POST" })
      const text = await response.text()

      try {
        const data = JSON.parse(text)
        setTestResult(`Database Initialization:\n${JSON.stringify(data, null, 2)}`)
      } catch (parseError) {
        setTestResult(`Database Initialization Raw Response:\n${text}`)
      }
    } catch (error) {
      setTestResult(`Database Initialization Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const repairSequences = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/repair-sequences", { method: "POST" })
      const text = await response.text()

      try {
        const data = JSON.parse(text)
        setTestResult(`Sequence Repair:\n${JSON.stringify(data, null, 2)}`)
      } catch (parseError) {
        setTestResult(`Sequence Repair Raw Response:\n${text}`)
      }
    } catch (error) {
      setTestResult(`Sequence Repair Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const testHotelsAPI = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/hotels")
      const text = await response.text()

      try {
        const data = JSON.parse(text)
        if (Array.isArray(data)) {
          setTestResult(
            `Hotels API Success:\nFound ${data.length} hotels\n${JSON.stringify(data.slice(0, 2), null, 2)}`,
          )
        } else {
          setTestResult(`Hotels API Response:\n${JSON.stringify(data, null, 2)}`)
        }
      } catch (parseError) {
        setTestResult(`Hotels API Raw Response (${response.status}):\n${text}`)
      }
    } catch (error) {
      setTestResult(`Hotels API Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  if (process.env.NODE_ENV !== "development") {
    return null
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Debug Panel (Development Only)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2 flex-wrap">
          <Button onClick={checkDatabaseStatus} disabled={loading} size="sm">
            Check Database Status
          </Button>
          <Button onClick={initializeDatabase} disabled={loading} size="sm">
            Initialize Database
          </Button>
          <Button onClick={repairSequences} disabled={loading} size="sm">
            Repair Sequences
          </Button>
          <Button onClick={testHotelsAPI} disabled={loading} size="sm">
            Test Hotels API
          </Button>
        </div>

        {testResult && (
          <Alert>
            <AlertDescription>
              <pre className="text-xs overflow-auto max-h-60 whitespace-pre-wrap">{testResult}</pre>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
