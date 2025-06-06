import { SettingsForm } from "@/components/settings-form"

export default function SettingsPage() {
  return (
    <main className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>
      <SettingsForm />
    </main>
  )
}
