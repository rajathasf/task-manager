"use client"

import { useState, useEffect } from "react"
import { useSupabase } from "@/lib/supabase-provider"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { CheckCircle, Circle, MoreHorizontal, Plus, Trash2, Edit, Calendar } from "lucide-react"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface Task {
  id: string
  title: string
  description: string | null
  status: string
  priority: string
  due_date: string | null
  task_type: string | null
  effort_level: string | null
  assignee: string | null
  user_id: string
  created_at: string
}

interface TaskManagerProps {
  initialTasks: Task[]
  userId: string
}

export default function TaskManager({ initialTasks, userId }: TaskManagerProps) {
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [isLoading, setIsLoading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentTask, setCurrentTask] = useState<Partial<Task> | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  const statusOptions = ["Not started", "In progress", "Completed"]
  const priorityOptions = ["Low", "Medium", "High"]
  const taskTypeOptions = ["Feature", "Bug", "Documentation", "Research", "Meeting", "Brain storm"]
  const effortLevelOptions = ["Small", "Medium", "Large"]

  const resetForm = () => {
    setCurrentTask({
      title: "",
      description: "",
      status: "Not started",
      priority: "Medium",
      due_date: null,
      task_type: null,
      effort_level: null,
      assignee: null,
      user_id: userId,
    })
    setIsEditing(false)
  }

  useEffect(() => {
    resetForm()
  }, [userId])

  const handleCreateOrUpdateTask = async () => {
    if (!currentTask?.title) {
      toast({
        title: "Error",
        description: "Task title is required",
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
      if (isEditing && currentTask.id) {
        // Update existing task
        const { error } = await supabase
          .from("tasks")
          .update({
            title: currentTask.title,
            description: currentTask.description,
            status: currentTask.status,
            priority: currentTask.priority,
            due_date: currentTask.due_date,
            task_type: currentTask.task_type,
            effort_level: currentTask.effort_level,
            assignee: currentTask.assignee,
          })
          .eq("id", currentTask.id)

        if (error) throw error

        setTasks(tasks.map((task) => (task.id === currentTask.id ? { ...task, ...(currentTask as Task) } : task)))

        toast({
          title: "Success",
          description: "Task updated successfully",
        })
      } else {
        // Create new task
        const { data, error } = await supabase
          .from("tasks")
          .insert({
            title: currentTask.title,
            description: currentTask.description,
            status: currentTask.status || "Not started",
            priority: currentTask.priority || "Medium",
            due_date: currentTask.due_date,
            task_type: currentTask.task_type,
            effort_level: currentTask.effort_level,
            assignee: currentTask.assignee,
            user_id: userId,
          })
          .select()

        if (error) throw error

        setTasks([data[0], ...tasks])

        toast({
          title: "Success",
          description: "Task created successfully",
        })
      }

      setIsDialogOpen(false)
      resetForm()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save task",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteTask = async (id: string) => {
    try {
      const { error } = await supabase.from("tasks").delete().eq("id", id)

      if (error) throw error

      setTasks(tasks.filter((task) => task.id !== id))

      toast({
        title: "Success",
        description: "Task deleted successfully",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete task",
        variant: "destructive",
      })
    }
  }

  const handleEditTask = (task: Task) => {
    setCurrentTask(task)
    setIsEditing(true)
    setIsDialogOpen(true)
  }

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      const { error } = await supabase.from("tasks").update({ status: newStatus }).eq("id", taskId)

      if (error) throw error

      setTasks(tasks.map((task) => (task.id === taskId ? { ...task, status: newStatus } : task)))
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update task status",
        variant: "destructive",
      })
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "In progress":
        return <Circle className="h-5 w-5 text-blue-500 fill-blue-500 stroke-white" />
      default:
        return <Circle className="h-5 w-5 text-gray-400" />
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "High":
        return <Badge variant="destructive">{priority}</Badge>
      case "Medium":
        return (
          <Badge variant="default" className="bg-amber-500">
            {priority}
          </Badge>
        )
      default:
        return <Badge variant="outline">{priority}</Badge>
    }
  }

  const getTasksByStatus = (status: string) => {
    return tasks.filter((task) => task.status === status)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Task Manager</h1>
          <p className="text-muted-foreground">Stay organized with tasks, your way.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              New Task
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>{isEditing ? "Edit Task" : "Create New Task"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={currentTask?.title || ""}
                  onChange={(e) => setCurrentTask({ ...currentTask, title: e.target.value })}
                  placeholder="Task title"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={currentTask?.description || ""}
                  onChange={(e) => setCurrentTask({ ...currentTask, description: e.target.value })}
                  placeholder="Task description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={currentTask?.status || "Not started"}
                    onValueChange={(value) => setCurrentTask({ ...currentTask, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={currentTask?.priority || "Medium"}
                    onValueChange={(value) => setCurrentTask({ ...currentTask, priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      {priorityOptions.map((priority) => (
                        <SelectItem key={priority} value={priority}>
                          {priority}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="due_date">Due Date</Label>
                  <div className="flex">
                    <Input
                      id="due_date"
                      type="date"
                      value={currentTask?.due_date || ""}
                      onChange={(e) => setCurrentTask({ ...currentTask, due_date: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="assignee">Assignee</Label>
                  <Input
                    id="assignee"
                    value={currentTask?.assignee || ""}
                    onChange={(e) => setCurrentTask({ ...currentTask, assignee: e.target.value })}
                    placeholder="Assignee name"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="task_type">Task Type</Label>
                  <Select
                    value={currentTask?.task_type || ""}
                    onValueChange={(value) => setCurrentTask({ ...currentTask, task_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {taskTypeOptions.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="effort_level">Effort Level</Label>
                  <Select
                    value={currentTask?.effort_level || ""}
                    onValueChange={(value) => setCurrentTask({ ...currentTask, effort_level: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select effort" />
                    </SelectTrigger>
                    <SelectContent>
                      {effortLevelOptions.map((level) => (
                        <SelectItem key={level} value={level}>
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateOrUpdateTask} disabled={isLoading}>
                {isLoading ? "Saving..." : isEditing ? "Update Task" : "Create Task"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="all">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Tasks</TabsTrigger>
          <TabsTrigger value="not-started">Not Started</TabsTrigger>
          <TabsTrigger value="in-progress">In Progress</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="kanban">Kanban View</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">Status</TableHead>
                  <TableHead>Task</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Effort</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No tasks found. Create your first task to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  tasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell>
                        <button
                          onClick={() =>
                            handleStatusChange(
                              task.id,
                              task.status === "Completed"
                                ? "Not started"
                                : task.status === "Not started"
                                  ? "In progress"
                                  : "Completed",
                            )
                          }
                          className="cursor-pointer"
                        >
                          {getStatusIcon(task.status)}
                        </button>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{task.title}</div>
                          {task.description && (
                            <div className="text-sm text-muted-foreground line-clamp-1">{task.description}</div>
                          )}
                          {task.assignee && (
                            <div className="text-xs text-muted-foreground mt-1">Assigned to: {task.assignee}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getPriorityBadge(task.priority)}</TableCell>
                      <TableCell>
                        {task.due_date ? (
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                            <span>{format(new Date(task.due_date), "MMM dd, yyyy")}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">No date</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {task.task_type ? (
                          <Badge variant="secondary">{task.task_type}</Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>{task.effort_level || <span className="text-muted-foreground">-</span>}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditTask(task)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteTask(task.id)} className="text-red-600">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="not-started">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">Status</TableHead>
                  <TableHead>Task</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {getTasksByStatus("Not started").length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No tasks found with "Not started" status.
                    </TableCell>
                  </TableRow>
                ) : (
                  getTasksByStatus("Not started").map((task) => (
                    <TableRow key={task.id}>
                      <TableCell>
                        <button onClick={() => handleStatusChange(task.id, "In progress")} className="cursor-pointer">
                          {getStatusIcon(task.status)}
                        </button>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{task.title}</div>
                          {task.description && (
                            <div className="text-sm text-muted-foreground line-clamp-1">{task.description}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getPriorityBadge(task.priority)}</TableCell>
                      <TableCell>
                        {task.due_date ? (
                          format(new Date(task.due_date), "MMM dd, yyyy")
                        ) : (
                          <span className="text-muted-foreground">No date</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditTask(task)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteTask(task.id)} className="text-red-600">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="in-progress">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">Status</TableHead>
                  <TableHead>Task</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {getTasksByStatus("In progress").length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No tasks found with "In progress" status.
                    </TableCell>
                  </TableRow>
                ) : (
                  getTasksByStatus("In progress").map((task) => (
                    <TableRow key={task.id}>
                      <TableCell>
                        <button onClick={() => handleStatusChange(task.id, "Completed")} className="cursor-pointer">
                          {getStatusIcon(task.status)}
                        </button>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{task.title}</div>
                          {task.description && (
                            <div className="text-sm text-muted-foreground line-clamp-1">{task.description}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getPriorityBadge(task.priority)}</TableCell>
                      <TableCell>
                        {task.due_date ? (
                          format(new Date(task.due_date), "MMM dd, yyyy")
                        ) : (
                          <span className="text-muted-foreground">No date</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditTask(task)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteTask(task.id)} className="text-red-600">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="completed">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">Status</TableHead>
                  <TableHead>Task</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {getTasksByStatus("Completed").length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No tasks found with "Completed" status.
                    </TableCell>
                  </TableRow>
                ) : (
                  getTasksByStatus("Completed").map((task) => (
                    <TableRow key={task.id}>
                      <TableCell>
                        <button onClick={() => handleStatusChange(task.id, "Not started")} className="cursor-pointer">
                          {getStatusIcon(task.status)}
                        </button>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{task.title}</div>
                          {task.description && (
                            <div className="text-sm text-muted-foreground line-clamp-1">{task.description}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getPriorityBadge(task.priority)}</TableCell>
                      <TableCell>
                        {task.due_date ? (
                          format(new Date(task.due_date), "MMM dd, yyyy")
                        ) : (
                          <span className="text-muted-foreground">No date</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditTask(task)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteTask(task.id)} className="text-red-600">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="kanban">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {statusOptions.map((status) => (
              <Card key={status} className="h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    {getStatusIcon(status)}
                    <span className="ml-2">{status}</span>
                    <Badge className="ml-2" variant="outline">
                      {getTasksByStatus(status).length}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    {status === "Not started" && "Tasks that need to be started"}
                    {status === "In progress" && "Tasks currently being worked on"}
                    {status === "Completed" && "Tasks that have been completed"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {getTasksByStatus(status).length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">No tasks in this column</div>
                  ) : (
                    getTasksByStatus(status).map((task) => (
                      <div
                        key={task.id}
                        className="p-3 bg-muted rounded-md border cursor-pointer hover:border-primary"
                        onClick={() => handleEditTask(task)}
                      >
                        <div className="font-medium">{task.title}</div>
                        {task.description && (
                          <div className="text-sm text-muted-foreground line-clamp-2 mt-1">{task.description}</div>
                        )}
                        <div className="flex items-center justify-between mt-2">
                          {getPriorityBadge(task.priority)}
                          {task.due_date && (
                            <div className="text-xs text-muted-foreground flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {format(new Date(task.due_date), "MMM dd")}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
