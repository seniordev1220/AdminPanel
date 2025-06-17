"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit, Trash2, DollarSign, Check } from "lucide-react"
import { PricePlanCreate, pricePlans } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"

interface Feature {
  description: string
  included: boolean
}

interface PricePlan {
  id: number
  name: string
  monthly_price: string
  annual_price: string
  included_seats: number
  additional_seat_price: string
  features: Feature[]
  is_best_value: boolean
  is_active: boolean
  stripe_price_id_monthly: string
  stripe_price_id_annual: string
  created_at: string
  updated_at: string
}

export default function PricingPage() {
  const [billingInterval, setBillingInterval] = useState<"monthly" | "yearly">("monthly")
  const [plans, setPlans] = useState<PricePlan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchPlans()
  }, [])

  const fetchPlans = async () => {
    try {
      const data = await pricePlans.getAllPlans()
      setPlans(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch price plans')
      toast({
        variant: "destructive",
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to fetch price plans',
      })
    } finally {
      setLoading(false)
    }
  }

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newPlan, setNewPlan] = useState<PricePlanCreate>({
    name: "",
    monthly_price: "",
    annual_price: "",
    included_seats: 0,
    additional_seat_price: "",
    features: [
      { description: "", included: true },
    ],
    is_best_value: false,
    is_active: true,
    stripe_price_id_monthly: "",
    stripe_price_id_annual: "",
  })

  const handleAddPlan = async () => {
    try {
      // Validate required fields
      if (!newPlan.name || !newPlan.monthly_price || !newPlan.annual_price || !newPlan.included_seats) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please fill in all required fields",
        })
        return
      }

      // Format the data
      const planData: PricePlanCreate = {
        ...newPlan,
        monthly_price: newPlan.monthly_price.toString(),
        annual_price: newPlan.annual_price.toString(),
        additional_seat_price: newPlan.additional_seat_price.toString(),
        features: newPlan.features
          .filter(f => f.description.trim() !== '')
          .map(f => ({ description: f.description, included: true }))
      }

      console.log('Sending plan data:', planData);
      const plan = await pricePlans.createPlan(planData)
      setPlans([...plans, plan])
      setNewPlan({
        name: "",
        monthly_price: "",
        annual_price: "",
        included_seats: 0,
        additional_seat_price: "",
        features: [
          { description: "", included: true },
        ],
        is_best_value: false,
        is_active: true,
        stripe_price_id_monthly: "",
        stripe_price_id_annual: "",
      })
      setIsAddDialogOpen(false)
      toast({
        title: "Success",
        description: "Price plan created successfully",
      })
    } catch (err) {
      console.error('Error creating price plan:', err);
      toast({
        variant: "destructive",
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to create price plan',
      })
    }
  }

  const handleDeletePlan = async (id: number) => {
    try {
      await pricePlans.deletePlan(id)
      setPlans(plans.filter((plan) => plan.id !== id))
      toast({
        title: "Success",
        description: "Price plan deleted successfully",
      })
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to delete price plan',
      })
    }
  }

  const togglePlanStatus = async (id: number) => {
    try {
      const plan = plans.find((p) => p.id === id)
      if (!plan) return

      const updatedPlan = await pricePlans.updatePlan(id, {
        is_active: !plan.is_active,
      })

      // Update the plan while maintaining the original order
      setPlans(plans.map(p => p.id === id ? updatedPlan : p))

      toast({
        title: "Success",
        description: `Price plan ${updatedPlan.is_active ? 'activated' : 'deactivated'} successfully`,
      })
    } catch (err) {
      console.error('Error updating price plan:', err)
      toast({
        variant: "destructive",
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to update price plan',
      })
    }
  }

  // Sort plans for display in the cards section
  const sortedActivePlans = plans
    .filter(plan => plan.is_active)
    .sort((a, b) => {
      // Sort by price (monthly) to maintain consistent order
      const priceA = parseFloat(a.monthly_price)
      const priceB = parseFloat(b.monthly_price)
      return priceA - priceB
    })

  const addFeature = () => {
    setNewPlan({
      ...newPlan,
      features: [...newPlan.features, { description: "", included: true }],
    })
  }

  const updateFeature = (index: number, value: string) => {
    const updatedFeatures = [...newPlan.features]
    updatedFeatures[index] = { ...updatedFeatures[index], description: value }
    setNewPlan({ ...newPlan, features: updatedFeatures })
  }

  const removeFeature = (index: number) => {
    // Don't allow removing the last feature
    if (newPlan.features.length <= 1) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must have at least one feature",
      })
      return
    }

    setNewPlan({
      ...newPlan,
      features: newPlan.features.filter((_, i) => i !== index),
    })
  }

  // Function to handle editing an existing plan
  const [editingPlan, setEditingPlan] = useState<PricePlan | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const handleEditPlan = async () => {
    if (!editingPlan) return

    try {
      // Format the data
      const planData = {
        ...editingPlan,
        monthly_price: editingPlan.monthly_price.toString(),
        annual_price: editingPlan.annual_price.toString(),
        additional_seat_price: editingPlan.additional_seat_price.toString(),
        features: editingPlan.features
          .filter(f => f.description.trim() !== '')
          .map(f => ({ description: f.description, included: true }))
      }

      const updatedPlan = await pricePlans.updatePlan(editingPlan.id, planData)
      setPlans(plans.map(p => p.id === updatedPlan.id ? updatedPlan : p))
      setEditingPlan(null)
      setIsEditDialogOpen(false)
      toast({
        title: "Success",
        description: "Price plan updated successfully",
      })
    } catch (err) {
      console.error('Error updating price plan:', err)
      toast({
        variant: "destructive",
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to update price plan',
      })
    }
  }

  const startEditingPlan = (plan: PricePlan) => {
    setEditingPlan(plan)
    setIsEditDialogOpen(true)
  }

  const removeFeatureFromEditingPlan = (index: number) => {
    if (!editingPlan) return

    // Don't allow removing the last feature
    if (editingPlan.features.length <= 1) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must have at least one feature",
      })
      return
    }

    setEditingPlan({
      ...editingPlan,
      features: editingPlan.features.filter((_, i) => i !== index),
    })
  }

  const addFeatureToEditingPlan = () => {
    if (!editingPlan) return

    setEditingPlan({
      ...editingPlan,
      features: [...editingPlan.features, { description: "", included: true }],
    })
  }

  const updateFeatureInEditingPlan = (index: number, value: string) => {
    if (!editingPlan) return

    const updatedFeatures = [...editingPlan.features]
    updatedFeatures[index] = { ...updatedFeatures[index], description: value }
    setEditingPlan({ ...editingPlan, features: updatedFeatures })
  }

  if (loading) {
    return <div className="p-6">Loading price plans...</div>
  }

  if (error) {
    return <div className="p-6 text-red-500">Error: {error}</div>
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Price Plan Management</h1>
          <p className="text-gray-600">Create and manage pricing tiers for your service</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2 bg-muted p-1 rounded-lg">
            <Button
              variant={billingInterval === "monthly" ? "default" : "ghost"}
              size="sm"
              onClick={() => setBillingInterval("monthly")}
            >
              Monthly
            </Button>
            <Button
              variant={billingInterval === "yearly" ? "default" : "ghost"}
              size="sm"
              onClick={() => setBillingInterval("yearly")}
            >
              Pay Annually (SAVE 25%)
            </Button>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Plan
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Price Plan</DialogTitle>
                <DialogDescription>Create a new pricing tier with features and pricing details.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4 max-h-96 overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="plan-name">Plan Name</Label>
                    <Input
                      id="plan-name"
                      value={newPlan.name}
                      onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
                      placeholder="e.g., Basic, Pro, Enterprise"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="monthly-price">Monthly Price</Label>
                    <Input
                      id="monthly-price"
                      type="number"
                      step="0.01"
                      value={newPlan.monthly_price}
                      onChange={(e) => setNewPlan({ ...newPlan, monthly_price: e.target.value })}
                      placeholder="29.99"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="annual-price">Annual Price</Label>
                    <Input
                      id="annual-price"
                      type="number"
                      step="0.01"
                      value={newPlan.annual_price}
                      onChange={(e) => setNewPlan({ ...newPlan, annual_price: e.target.value })}
                      placeholder="299.99"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="included-seats">Included Seats</Label>
                    <Input
                      id="included-seats"
                      type="number"
                      value={newPlan.included_seats}
                      onChange={(e) => setNewPlan({ ...newPlan, included_seats: parseInt(e.target.value) || 0 })}
                      placeholder="1"
                      required
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="additional-seat-price">Additional Seat Price</Label>
                  <Input
                    id="additional-seat-price"
                    type="number"
                    step="0.01"
                    value={newPlan.additional_seat_price}
                    onChange={(e) => setNewPlan({ ...newPlan, additional_seat_price: e.target.value })}
                    placeholder="9.99"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Features</Label>
                  {newPlan.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Input
                        value={feature.description}
                        onChange={(e) => updateFeature(index, e.target.value)}
                        placeholder="Enter feature"
                      />
                      <Button type="button" variant="outline" size="sm" onClick={() => removeFeature(index)}>
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" onClick={addFeature}>
                    Add Feature
                  </Button>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_best_value"
                      checked={newPlan.is_best_value}
                      onCheckedChange={(checked) => setNewPlan({ ...newPlan, is_best_value: checked })}
                    />
                    <Label htmlFor="is_best_value">Best Value</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_active"
                      checked={newPlan.is_active}
                      onCheckedChange={(checked) => setNewPlan({ ...newPlan, is_active: checked })}
                    />
                    <Label htmlFor="is_active">Active</Label>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddPlan}>Add Plan</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Plans Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {sortedActivePlans.map((plan) => (
            <Card key={plan.id} className={`relative ${plan.is_best_value ? "ring-2 ring-primary" : ""}`}>
              {plan.is_best_value && (
                <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-black">
                  Best value
                </Badge>
              )}
              <CardHeader>
                <CardTitle className="capitalize">{plan.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-4">
                  ${billingInterval === "monthly" ? plan.monthly_price : plan.annual_price}
                  <span className="text-sm font-normal text-muted-foreground">
                    /{billingInterval === "monthly" ? "month" : "year"}
                  </span>
                </div>
                <div className="mb-4 text-sm text-muted-foreground">
                  {plan.included_seats} {plan.included_seats === 1 ? "seat" : "seats"} included
                  <br />
                  add more seats at ${plan.additional_seat_price}/user/month
                </div>
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm text-muted-foreground">
                      <Check className="h-4 w-4 mr-2 flex-shrink-0" />
                      {feature.description}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Plans Management Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Plans</CardTitle>
            <CardDescription>Manage all pricing plans including inactive ones</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plan Name</TableHead>
                  <TableHead>Monthly Price</TableHead>
                  <TableHead>Annual Price</TableHead>
                  <TableHead>Included Seats</TableHead>
                  <TableHead>Features</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plans
                  .sort((a, b) => {
                    // First sort by active status (active plans first)
                    if (a.is_active !== b.is_active) {
                      return a.is_active ? -1 : 1
                    }
                    // Then sort by price
                    const priceA = parseFloat(a.monthly_price)
                    const priceB = parseFloat(b.monthly_price)
                    return priceA - priceB
                  })
                  .map((plan) => (
                    <TableRow key={plan.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-2">
                          <span className="capitalize">{plan.name}</span>
                          {plan.is_best_value && (
                            <Badge variant="secondary" className="text-xs">
                              Best value
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>${plan.monthly_price}</TableCell>
                      <TableCell>${plan.annual_price}</TableCell>
                      <TableCell>{plan.included_seats}</TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">{plan.features.length} features</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={plan.is_active ? "default" : "secondary"}>
                          {plan.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(plan.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm" onClick={() => startEditingPlan(plan)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Switch checked={plan.is_active} onCheckedChange={() => togglePlanStatus(plan.id)} />
                          <Button variant="outline" size="sm" onClick={() => handleDeletePlan(plan.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Add the Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Price Plan</DialogTitle>
            <DialogDescription>Update the pricing tier details and features.</DialogDescription>
          </DialogHeader>
          {editingPlan && (
            <div className="grid gap-4 py-4 max-h-96 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-plan-name">Plan Name</Label>
                  <Input
                    id="edit-plan-name"
                    value={editingPlan.name}
                    onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
                    placeholder="e.g., Basic, Pro, Enterprise"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-monthly-price">Monthly Price</Label>
                  <Input
                    id="edit-monthly-price"
                    type="number"
                    step="0.01"
                    value={editingPlan.monthly_price}
                    onChange={(e) => setEditingPlan({ ...editingPlan, monthly_price: e.target.value })}
                    placeholder="29.99"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-annual-price">Annual Price</Label>
                  <Input
                    id="edit-annual-price"
                    type="number"
                    step="0.01"
                    value={editingPlan.annual_price}
                    onChange={(e) => setEditingPlan({ ...editingPlan, annual_price: e.target.value })}
                    placeholder="299.99"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-included-seats">Included Seats</Label>
                  <Input
                    id="edit-included-seats"
                    type="number"
                    value={editingPlan.included_seats}
                    onChange={(e) => setEditingPlan({ ...editingPlan, included_seats: parseInt(e.target.value) || 0 })}
                    placeholder="1"
                    required
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-additional-seat-price">Additional Seat Price</Label>
                <Input
                  id="edit-additional-seat-price"
                  type="number"
                  step="0.01"
                  value={editingPlan.additional_seat_price}
                  onChange={(e) => setEditingPlan({ ...editingPlan, additional_seat_price: e.target.value })}
                  placeholder="9.99"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label>Features</Label>
                {editingPlan.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      value={feature.description}
                      onChange={(e) => updateFeatureInEditingPlan(index, e.target.value)}
                      placeholder="Enter feature"
                    />
                    <Button type="button" variant="outline" size="sm" onClick={() => removeFeatureFromEditingPlan(index)}>
                      Remove
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={addFeatureToEditingPlan}>
                  Add Feature
                </Button>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="edit-is_best_value"
                    checked={editingPlan.is_best_value}
                    onCheckedChange={(checked) => setEditingPlan({ ...editingPlan, is_best_value: checked })}
                  />
                  <Label htmlFor="edit-is_best_value">Best Value</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="edit-is_active"
                    checked={editingPlan.is_active}
                    onCheckedChange={(checked) => setEditingPlan({ ...editingPlan, is_active: checked })}
                  />
                  <Label htmlFor="edit-is_active">Active</Label>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditPlan}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
