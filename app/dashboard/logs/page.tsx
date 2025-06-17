"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, Download, RefreshCw } from "lucide-react"
import { activities, type ActivityLog } from "@/lib/api"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function LogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [activityTypeFilter, setActivityTypeFilter] = useState("all")
  const [page, setPage] = useState(0)
  const limit = 100

  const fetchLogs = async () => {
    setLoading(true)
    setError("")
    try {
      const params = {
        skip: page * limit,
        limit,
        activity_type: activityTypeFilter !== "all" ? activityTypeFilter : undefined,
      }
      const data = await activities.getRecentActivities(params)
      setLogs(data)
    } catch (err) {
      console.error('Error fetching logs:', err)
      setError(err instanceof Error ? err.message : "Failed to fetch activity logs")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [page, activityTypeFilter])

  const filteredLogs = logs.filter((log) =>
    log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.activity_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.ip_address.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusBadge = (type: string) => {
    const variants = {
      LOGIN: "default",
      CREATE: "default",
      UPDATE: "secondary",
      DELETE: "destructive",
    } as const

    const baseType = Object.keys(variants).find(key => type.includes(key)) || "default"
    return <Badge variant={variants[baseType as keyof typeof variants]}>{type}</Badge>
  }

  const exportLogs = () => {
    const csvContent = [
      ["Timestamp", "Activity Type", "Description", "IP Address", "User Agent", "Metadata"].join(","),
      ...filteredLogs.map((log) => [
        log.created_at,
        log.activity_type,
        `"${log.description}"`,
        log.ip_address,
        `"${log.user_agent}"`,
        `"${JSON.stringify(log.metadata)}"`,
      ].join(",")),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `activity-logs-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Activity Logs</CardTitle>
              <CardDescription>Detailed log of all user actions and system events</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={fetchLogs}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" onClick={exportLogs}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <div className="flex items-center space-x-2 flex-1">
              <Search className="h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <Select value={activityTypeFilter} onValueChange={setActivityTypeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="LOGIN">Login</SelectItem>
                  <SelectItem value="CREATE">Create</SelectItem>
                  <SelectItem value="UPDATE">Update</SelectItem>
                  <SelectItem value="DELETE">Delete</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="relative">
            {loading && (
              <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            )}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Activity Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>User Agent</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell>{getStatusBadge(log.activity_type)}</TableCell>
                    <TableCell>{log.description}</TableCell>
                    <TableCell className="whitespace-nowrap">{log.ip_address}</TableCell>
                    <TableCell className="truncate max-w-xs" title={log.user_agent}>
                      {log.user_agent}
                    </TableCell>
                  </TableRow>
                ))}
                {filteredLogs.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      No activity logs found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="mt-4 flex justify-between items-center">
            <Button
              variant="outline"
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              Previous
            </Button>
            <span className="text-sm text-gray-500">
              Page {page + 1}
            </span>
            <Button
              variant="outline"
              onClick={() => setPage(p => p + 1)}
              disabled={filteredLogs.length < limit}
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
