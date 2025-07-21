import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface DetailItem {
  icon: React.ReactNode
  label: string
  value: string | number | undefined | null
  link?: string
}

interface CaseDetailSectionProps {
  title: string
  details: DetailItem[]
  className?: string
}

export function CaseDetailSection({ title, details, className }: CaseDetailSectionProps) {
  return (
    <Card className={cn("border-l-4 border-red-500 rounded-lg shadow-sm", className)}>
      <CardHeader className="py-3 px-4 bg-gray-50 dark:bg-gray-700">
        <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-100">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
        {details.map((item, index) => (
          <div key={index} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
            <span className="text-gray-500 dark:text-gray-400 mt-0.5">{item.icon}</span>
            <div className="flex flex-col">
              <span className="font-medium">{item.label}:</span>
              {item.link ? (
                <a href={item.link} className="text-blue-600 hover:underline dark:text-blue-400">
                  {item.value || "N/A"}
                </a>
              ) : (
                <span>{item.value || "N/A"}</span>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
