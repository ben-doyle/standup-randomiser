"use client"

import { useState, useEffect, useRef, KeyboardEvent, ChangeEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shuffle, Plus, RotateCcw, Users, Copy, Trash, CheckCircle, XCircle } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

import { TeamMember, getTeamMembers, saveTeamMembers, parseTeamMembersList, teamMembersToString } from "@/lib/local-storage"

export default function StandupRandomizer() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [currentName, setCurrentName] = useState("")
  const [shuffledNames, setShuffledNames] = useState<string[]>([])
  const [revealedIndex, setRevealedIndex] = useState(-1)
  const [isShuffled, setIsShuffled] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)
  
  // Load team members from localStorage on initial render
  useEffect(() => {
    setTeamMembers(getTeamMembers())
  }, [])

  // Save team members to localStorage whenever they change
  useEffect(() => {
    saveTeamMembers(teamMembers)
  }, [teamMembers])

  const addName = () => {
    const input = currentName.trim()
    
    if (!input) return
    
    // Check if it's a comma-separated list
    if (input.includes(',')) {
      const newNames = parseTeamMembersList(input)
      
      // Preserve existing members' enabled status if they're in the new list
      const mergedMembers = [...teamMembers]
      
      newNames.forEach((newMember: TeamMember) => {
        if (!mergedMembers.some((m: TeamMember) => m.name === newMember.name)) {
          mergedMembers.push(newMember)
        }
      })
      
      setTeamMembers(mergedMembers)
    } else {
      // Single name
      if (!teamMembers.some((member: TeamMember) => member.name === input)) {
        const newMembers = [...teamMembers, { name: input, enabled: true }]
        setTeamMembers(newMembers)
      }
    }
    
    setCurrentName("")
  }

  const removeName = (nameToRemove: string) => {
    setTeamMembers(teamMembers.filter((member: TeamMember) => member.name !== nameToRemove))
    setIsShuffled(false)
    setRevealedIndex(-1)
  }
  
  const toggleMemberStatus = (nameToToggle: string) => {
    setTeamMembers(teamMembers.map((member: TeamMember) => 
      member.name === nameToToggle 
        ? { ...member, enabled: !member.enabled } 
        : member
    ))
    setIsShuffled(false)
    setRevealedIndex(-1)
  }

  const shuffleNames = () => {
    // Only include enabled members in the shuffle
    const enabledMembers = teamMembers
      .filter((member: TeamMember) => member.enabled)
      .map((member: TeamMember) => member.name)
    
    const shuffled = [...enabledMembers].sort(() => Math.random() - 0.5)
    setShuffledNames(shuffled)
    setRevealedIndex(-1)
    setIsShuffled(true)
  }
  
  
  const copyTeamList = () => {
    const text = teamMembersToString(teamMembers)
    navigator.clipboard.writeText(text)
    setCopySuccess(true)
    setTimeout(() => setCopySuccess(false), 2000)
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

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
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
            Stand-up Randomiser
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
                placeholder="Enter name or paste comma-separated list: John, Mary, Scott..."
                value={currentName}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setCurrentName(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <Button onClick={addName} disabled={!currentName.trim()}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {teamMembers.length > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">
                    {teamMembers.length} team member{teamMembers.length !== 1 ? "s" : ""} added
                    {teamMembers.length > 0 && 
                      ` (${teamMembers.filter((m: TeamMember) => m.enabled).length} active)`
                    }
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyTeamList}
                    className="text-xs"
                  >
                    {copySuccess ? (
                      <>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3 mr-1" />
                        Copy List
                      </>
                    )}
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {teamMembers.map((member: TeamMember) => (
                    <div key={member.name} className="flex gap-1 items-center">
                      <Badge
                        key={member.name}
                        variant={member.enabled ? "secondary" : "outline"}
                        className={`cursor-pointer transition-colors ${member.enabled ? "" : "opacity-60"}`}
                        onClick={() => toggleMemberStatus(member.name)}
                      >
                        {member.name}
                        {member.enabled ? (
                          <CheckCircle className="h-3 w-3 ml-1" />
                        ) : (
                          <XCircle className="h-3 w-3 ml-1" />
                        )}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 w-5 p-0 text-muted-foreground hover:text-destructive"
                        onClick={() => removeName(member.name)}
                      >
                        <Trash className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Controls */}
        {teamMembers.length > 0 && (
          <div className="flex gap-2 justify-center">
            <Button
              onClick={shuffleNames}
              disabled={teamMembers.filter((m: TeamMember) => m.enabled).length < 1}
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
                {shuffledNames.map((name: string, index: number) => (
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

        {teamMembers.length === 0 && (
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
