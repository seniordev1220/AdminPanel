"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Palette, CreditCard, Activity } from "lucide-react"
import { activities, users, pricePlans, brandSettings } from "@/lib/api"
import { useEffect, useState } from "react"
import { ActivityLog, UserProfile, PricePlan } from "@/lib/api"

// Helper function to format relative time
function formatRelativeTime(date: string) {
  const now = new Date()
  const then = new Date(date)
  const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return 'just now'
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `${minutes} minute${minutes === 1 ? '' : 's'} ago`
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `${hours} hour${hours === 1 ? '' : 's'} ago`
  } else {
    const days = Math.floor(diffInSeconds / 86400)
    return `${days} day${days === 1 ? '' : 's'} ago`
  }
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<{
    totalUsers: number
    whiteLabelBrands: number
    pricePlans: number
    dailyActions: number
  }>({
    totalUsers: 0,
    whiteLabelBrands: 0,
    pricePlans: 0,
    dailyActions: 0
  })
  const [recentActivities, setRecentActivities] = useState<ActivityLog[]>([])
  const [systemStatus, setSystemStatus] = useState({
    database: { status: "Healthy", color: "text-green-600" },
    api: { status: "Online", color: "text-green-600" },
    jobs: { status: "Running", color: "text-green-600" },
    storage: { status: "75% Used", color: "text-yellow-600" }
  })

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch all required data in parallel
        const [allUsers, allPlans, recentLogs, brandCount] = await Promise.all([
          users.getAllUsers(),
          pricePlans.getAllPlans(),
          activities.getRecentActivities({ limit: 3 }),
          brandSettings.getBrandCount()
        ])

        // Update stats
        setStats({
          totalUsers: allUsers.length,
          whiteLabelBrands: brandCount,
          pricePlans: allPlans.length,
          dailyActions: recentLogs.length
        })

        // Update recent activities
        setRecentActivities(recentLogs)

      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred while fetching dashboard data')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const statsConfig = [
    {
      title: "Total Users",
      value: stats.totalUsers.toLocaleString(),
      description: "Active users in the system",
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "White Label Brands",
      value: stats.whiteLabelBrands.toString(),
      description: "Active brand configurations",
      icon: Palette,
      color: "text-green-600",
    },
    {
      title: "Price Plans",
      value: stats.pricePlans.toString(),
      description: "Available pricing tiers",
      icon: CreditCard,
      color: "text-purple-600",
    },
    {
      title: "Daily Actions",
      value: stats.dailyActions.toLocaleString(),
      description: "User actions logged today",
      icon: Activity,
      color: "text-orange-600",
    },
  ]

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome to the admin dashboard</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsConfig.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? (
                  <div className="h-8 bg-gray-200 rounded animate-pulse" />
                ) : (
                  stat.value
                )}
              </div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest user actions in the system</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-gray-200 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
                      <div className="h-3 bg-gray-200 rounded w-1/4 animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatRelativeTime(activity.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>Current system health and status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(systemStatus).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm font-medium capitalize">{key}</span>
                  <span className={`text-sm ${value.color} font-medium`}>
                    {value.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
