"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

interface Stat {
  label: string
  value: number
  color: string
}

export function CaseStats() {
  const [stats, setStats] = useState<Stat[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch("/api/case-stats")
        if (!response.ok) {
          throw new Error("Failed to fetch case statistics")
        }
        const data: Stat[] = await response.json()
        setStats(data)
      } catch (err: any) {
        setError(err.message)
        toast({
          title: "Error",
          description: `No se pudieron cargar las estadísticas de casos: ${err.message}`,
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return <div className="text-center py-4">Cargando estadísticas de casos...</div>
  }

  if (error) {
    return <div className="text-center py-4 text-red-500">Error: {error}</div>
  }

  return (
    <div className="grid gap-4 md:grid-cols-5">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="flex flex-col items-center justify-center p-4">
            <div className="text-4xl font-bold">{stat.value}</div>
            <div className={`mt-2 px-3 py-1 rounded-full text-white text-sm ${stat.color}`}>{stat.label}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
