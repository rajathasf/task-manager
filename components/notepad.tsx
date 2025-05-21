"use client"

import { useState } from "react"
import { useSupabase } from "@/lib/supabase-provider"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { FileText, MoreHorizontal, Plus, Trash2, Edit, Calendar } from "lucide-react"
import { format } from "date-fns"

interface Note {
  id: string
  title: string
  content: string | null
  user_id: string
  created_at: string
}

interface NotePadProps {
  initialNotes: Note[]
  userId: string
}

export default function NotePad({ initialNotes, userId }: NotePadProps) {
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const [notes, setNotes] = useState<Note[]>(initialNotes)
  const [isLoading, setIsLoading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentNote, setCurrentNote] = useState<Partial<Note> | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const resetForm = () => {
    setCurrentNote({
      title: "",
      content: "",
      user_id: userId,
    })
    setIsEditing(false)
  }

  const handleCreateOrUpdateNote = async () => {
    if (!currentNote?.title) {
      toast({
        title: "Error",
        description: "Note title is required",
        variant: "destructive",
      })
      return
    }

    if (!supabase) {
      toast({
        title: "Error",
        description: "Database connection not available",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      if (isEditing && currentNote.id) {
        // Update existing note
        const { error } = await supabase
          .from("notes")
          .update({
            title: currentNote.title,
            content: currentNote.content,
          })
          .eq("id", currentNote.id)

        if (error) throw error

        setNotes(notes.map((note) => (note.id === currentNote.id ? { ...note, ...(currentNote as Note) } : note)))

        toast({
          title: "Success",
          description: "Note updated successfully",
        })
      } else {
        // Create new note
        const { data, error } = await supabase
          .from("notes")
          .insert({
            title: currentNote.title,
            content: currentNote.content,
            user_id: userId,
          })
          .select()

        if (error) throw error

        setNotes([data[0], ...notes])

        toast({
          title: "Success",
          description: "Note created successfully",
        })
      }

      setIsDialogOpen(false)
      resetForm()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save note",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteNote = async (id: string) => {
    try {
      const { error } = await supabase.from("notes").delete().eq("id", id)

      if (error) throw error

      setNotes(notes.filter((note) => note.id !== id))

      toast({
        title: "Success",
        description: "Note deleted successfully",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete note",
        variant: "destructive",
      })
    }
  }

  const handleEditNote = (note: Note) => {
    setCurrentNote(note)
    setIsEditing(true)
    setIsDialogOpen(true)
  }

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (note.content && note.content.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Notes</h1>
          <p className="text-muted-foreground">Capture your thoughts and ideas</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              New Note
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>{isEditing ? "Edit Note" : "Create New Note"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={currentNote?.title || ""}
                  onChange={(e) => setCurrentNote({ ...currentNote, title: e.target.value })}
                  placeholder="Note title"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={currentNote?.content || ""}
                  onChange={(e) => setCurrentNote({ ...currentNote, content: e.target.value })}
                  placeholder="Note content"
                  className="min-h-[200px]"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateOrUpdateNote} disabled={isLoading}>
                {isLoading ? "Saving..." : isEditing ? "Update Note" : "Create Note"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-6">
        <Input
          placeholder="Search notes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
      </div>

      {filteredNotes.length === 0 ? (
        <div className="text-center py-12 bg-muted rounded-lg">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">No notes found</h3>
          <p className="text-muted-foreground mt-2">
            {searchQuery ? "Try a different search term" : "Create your first note to get started"}
          </p>
          {!searchQuery && (
            <Button
              className="mt-4"
              onClick={() => {
                resetForm()
                setIsDialogOpen(true)
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Note
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNotes.map((note) => (
            <Card key={note.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="line-clamp-1">{note.title}</CardTitle>
                <CardDescription>
                  <div className="flex items-center text-xs">
                    <Calendar className="h-3 w-3 mr-1" />
                    {format(new Date(note.created_at), "MMM dd, yyyy")}
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground line-clamp-4">{note.content || <em>No content</em>}</div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="ghost" size="sm" onClick={() => handleEditNote(note)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEditNote(note)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDeleteNote(note.id)} className="text-red-600">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
