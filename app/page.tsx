"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shuffle, Plus, RotateCcw, Users } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

export default function StandupRandomizer() {
  const [names, setNames] = useState<string[]>([])
  const [currentName, setCurrentName] = useState("")
  const [shuffledNames, setShuffledNames] = useState<string[]>([])
  const [revealedIndex, setRevealedIndex] = useState(-1)
  const [isShuffled, setIsShuffled] = useState(false)

  const addName = () => {
    if (currentName.trim() && !names.includes(currentName.trim())) {
      setNames([...names, currentName.trim()])
      setCurrentName("")
    }
  }

  const removeName = (nameToRemove: string) => {
    setNames(names.filter((name) => name !== nameToRemove))
    setIsShuffled(false)
    setRevealedIndex(-1)
  }

  const shuffleNames = () => {
    const shuffled = [...names].sort(() => Math.random() - 0.5)
    setShuffledNames(shuffled)
    setRevealedIndex(-1)
    setIsShuffled(true)
  }

  const revealNext = () => {
    if (revealedIndex < shuffledNames.length - 1) {
      setRevealedIndex(revealedIndex + 1)
    }
  }

  const reset = () => {
    setIsShuffled(false)
    setRevealedIndex(-1)
    setShuffledNames([])
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addName()
    }
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-balance bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Stand-up Name Randomizer
          </h1>
          <p className="text-muted-foreground text-pretty">
            Add team members, shuffle, and reveal them one by one for your daily standup
          </p>
        </div>

        {/* Add Names Section */}
        <Card className="border-primary/20 shadow-custom">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Team Members
            </CardTitle>
            <CardDescription>Add your team members to the list</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter team member name..."
                value={currentName}
                onChange={(e) => setCurrentName(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <Button onClick={addName} disabled={!currentName.trim()}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {names.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {names.length} team member{names.length !== 1 ? "s" : ""} added
                </p>
                <div className="flex flex-wrap gap-2">
                  {names.map((name) => (
                    <Badge
                      key={name}
                      variant="secondary"
                      className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors"
                      onClick={() => removeName(name)}
                    >
                      {name} ×
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Controls */}
        {names.length > 0 && (
          <div className="flex gap-2 justify-center">
            <Button
              onClick={shuffleNames}
              disabled={names.length < 2}
              className="flex items-center gap-2 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
            >
              <Shuffle className="h-4 w-4" />
              Shuffle & Start
            </Button>
            {isShuffled && (
              <Button
                onClick={reset}
                variant="outline"
                className="flex items-center gap-2 bg-transparent border-primary/30 hover:bg-primary/10"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
            )}
          </div>
        )}

        {/* Randomized List */}
        {isShuffled && (
          <Card className="border-primary/20 shadow-custom">
            <CardHeader>
              <CardTitle>Standup Order</CardTitle>
              <CardDescription>Click "Next Person" to reveal who speaks next</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {shuffledNames.map((name, index) => (
                  <div
                    key={`${name}-${index}`}
                    className={`p-3 rounded-lg border transition-all duration-300 ${
                      index <= revealedIndex
                        ? index === revealedIndex
                          ? "bg-primary text-primary-foreground border-primary shadow-custom"
                          : "bg-muted text-muted-foreground border-muted"
                        : "bg-card border-dashed border-muted-foreground/30"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{index <= revealedIndex ? name : "???"}</span>
                      <Badge variant={index <= revealedIndex ? "default" : "outline"}>#{index + 1}</Badge>
                    </div>
                  </div>
                ))}
              </div>

              {revealedIndex < shuffledNames.length - 1 ? (
                <Button
                  onClick={revealNext}
                  className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                >
                  Next Person ({shuffledNames.length - revealedIndex - 1} remaining)
                </Button>
              ) : (
                <div className="text-center space-y-2">
                  <p className="text-lg font-semibold text-primary">🎉 Standup Complete!</p>
                  <p className="text-sm text-muted-foreground">Everyone has had their turn</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {names.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="pt-6">
              <div className="text-center text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Add team members to get started</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
