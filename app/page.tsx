"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import ObjectDetection from "@/components/object-detection"
import { ThemeToggle } from "./theme-toggle"

export default function Home() {
  const [isDetecting, setIsDetecting] = useState(false)

  return (
    <main className="flex min-h-screen flex-col p-4 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto max-w-5xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold tracking-tighter sm:text-3xl md:text-4xl">Real-time Object Detection</h1>
          <ThemeToggle />
        </div>

        <div className="lg:col-span-2">
          <Card className="overflow-hidden">
            <ObjectDetection isDetecting={isDetecting} />
          </Card>

          <div className="flex justify-center mt-4">
            <Button
              size="lg"
              onClick={() => setIsDetecting(!isDetecting)}
              className="w-full sm:w-auto sm:min-w-[160px]"
            >
              {isDetecting ? "Stop Detection" : "Start Detection"}
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}
