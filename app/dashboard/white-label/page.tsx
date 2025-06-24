"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Plus, Edit, Trash2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BrandSettings, BrandSettingsCreate, BrandSettingsUpdate } from "@/lib/api"
import api from "@/lib/api"
import { toast } from "sonner"

export default function WhiteLabelPage() {
  const [brands, setBrands] = useState<BrandSettings[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [brandToDelete, setBrandToDelete] = useState<BrandSettings | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedBrand, setSelectedBrand] = useState<BrandSettings | null>(null)
  const [editBrand, setEditBrand] = useState<BrandSettingsUpdate>({})
  const [newBrand, setNewBrand] = useState<BrandSettingsCreate>({
    brand_name: "",
    domain: "",
    primary_color: "#3b82f6",
    secondary_color: "#1e40af",
    logo_url: "",
    favicon_url: "",
    is_active: true,
    storage_limit_gb: 1.0,
    max_accounts: 5,
    subscription_interval: undefined,
    price_amount: undefined,
  })

  useEffect(() => {
    loadBrands()
  }, [])

  const loadBrands = async () => {
    try {
      const data = await api.brandSettings.getAllBrands()
      setBrands(data)
    } catch (error) {
      console.error("Failed to load brands:", error)
      toast.error("Failed to load brands")
    }
  }

  const handleAddBrand = async () => {
    try {
      setIsLoading(true)
      await api.brandSettings.createBrand(newBrand)
      await loadBrands()
      setNewBrand({
        brand_name: "",
        domain: "",
        primary_color: "#3b82f6",
        secondary_color: "#1e40af",
        logo_url: "",
        favicon_url: "",
        is_active: true,
        storage_limit_gb: 1.0,
        max_accounts: 5,
        subscription_interval: undefined,
        price_amount: undefined,
      })
      setIsAddDialogOpen(false)
      toast.success("Brand created successfully")
    } catch (error) {
      console.error("Failed to create brand:", error)
      toast.error("Failed to create brand")
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditClick = (brand: BrandSettings) => {
    setSelectedBrand(brand)
    setEditBrand({
      brand_name: brand.brand_name,
      domain: brand.domain,
      primary_color: brand.primary_color,
      secondary_color: brand.secondary_color,
      logo_url: brand.logo_url,
      favicon_url: brand.favicon_url,
      is_active: brand.is_active,
      storage_limit_gb: brand.storage_limit_gb,
      max_accounts: brand.max_accounts,
      subscription_interval: brand.subscription_interval,
      price_amount: brand.price_amount,
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdateBrand = async () => {
    if (!selectedBrand) return

    try {
      setIsLoading(true)
      await api.brandSettings.updateBrand(selectedBrand.id, editBrand)
      await loadBrands()
      setIsEditDialogOpen(false)
      setSelectedBrand(null)
      setEditBrand({})
      toast.success("Brand updated successfully")
    } catch (error) {
      console.error("Failed to update brand:", error)
      toast.error("Failed to update brand")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteClick = (brand: BrandSettings) => {
    setBrandToDelete(brand)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!brandToDelete) return

    try {
      setIsLoading(true)
      await api.brandSettings.deleteBrand(brandToDelete.id)
      await loadBrands()
      setIsDeleteDialogOpen(false)
      setBrandToDelete(null)
      toast.success("Brand deleted successfully")
    } catch (error) {
      console.error("Failed to delete brand:", error)
      toast.error("Failed to delete brand")
    } finally {
      setIsLoading(false)
    }
  }

  const BrandForm = ({ data, onChange, type }: { data: any; onChange: (data: any) => void; type: "new" | "edit" }) => (
    <Tabs defaultValue="basic" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="basic">Basic Info</TabsTrigger>
        <TabsTrigger value="branding">Branding</TabsTrigger>
        <TabsTrigger value="pricing">Pricing</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>
      <TabsContent value="basic" className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="brand-name">Brand Name</Label>
          <Input
            id="brand-name"
            value={data.brand_name}
            onChange={(e) => onChange({ ...data, brand_name: e.target.value })}
            placeholder="Enter brand name"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="domain">Domain</Label>
          <Input
            id="domain"
            value={data.domain}
            onChange={(e) => onChange({ ...data, domain: e.target.value })}
            placeholder="brand.example.com"
          />
        </div>
      </TabsContent>
      <TabsContent value="branding" className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="primary-color">Primary Color</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="primary-color"
                type="color"
                value={data.primary_color}
                onChange={(e) => onChange({ ...data, primary_color: e.target.value })}
                className="w-16 h-10"
              />
              <Input
                value={data.primary_color}
                onChange={(e) => onChange({ ...data, primary_color: e.target.value })}
                placeholder="#3b82f6"
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="secondary-color">Secondary Color</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="secondary-color"
                type="color"
                value={data.secondary_color}
                onChange={(e) => onChange({ ...data, secondary_color: e.target.value })}
                className="w-16 h-10"
              />
              <Input
                value={data.secondary_color}
                onChange={(e) => onChange({ ...data, secondary_color: e.target.value })}
                placeholder="#1e40af"
              />
            </div>
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="logo">Logo URL</Label>
          <Input
            id="logo"
            value={data.logo_url}
            onChange={(e) => onChange({ ...data, logo_url: e.target.value })}
            placeholder="https://example.com/logo.png"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="favicon">Favicon URL</Label>
          <Input
            id="favicon"
            value={data.favicon_url}
            onChange={(e) => onChange({ ...data, favicon_url: e.target.value })}
            placeholder="https://example.com/favicon.ico"
          />
        </div>
      </TabsContent>
      <TabsContent value="pricing" className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="subscription-interval">Subscription Interval</Label>
          <Select
            value={data.subscription_interval}
            onValueChange={(value) => onChange({ ...data, subscription_interval: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select interval" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="price-amount">Price Amount (USD)</Label>
          <Input
            id="price-amount"
            type="number"
            value={data.price_amount || ""}
            onChange={(e) => onChange({ ...data, price_amount: parseFloat(e.target.value) })}
            placeholder="99.99"
          />
        </div>
      </TabsContent>
      <TabsContent value="settings" className="space-y-4">
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="storage-limit">Storage Limit (GB)</Label>
            <Input
              id="storage-limit"
              type="number"
              value={data.storage_limit_gb}
              onChange={(e) => onChange({ ...data, storage_limit_gb: parseFloat(e.target.value) })}
              placeholder="1.0"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="max-accounts">Maximum Accounts</Label>
            <Input
              id="max-accounts"
              type="number"
              value={data.max_accounts}
              onChange={(e) => onChange({ ...data, max_accounts: parseInt(e.target.value) })}
              placeholder="5"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="active"
              checked={data.is_active}
              onCheckedChange={(checked) => onChange({ ...data, is_active: checked })}
            />
            <Label htmlFor="active">Active</Label>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  )

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">White Label Management</h1>
          <p className="text-gray-600">Manage brand configurations and customizations</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Brand
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Brand</DialogTitle>
              <DialogDescription>Create a new white label brand configuration.</DialogDescription>
            </DialogHeader>
            <BrandForm data={newBrand} onChange={setNewBrand} type="new" />
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddBrand} disabled={isLoading}>
                {isLoading ? "Creating..." : "Add Brand"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Brand</DialogTitle>
            <DialogDescription>Update brand configuration.</DialogDescription>
          </DialogHeader>
          <BrandForm data={editBrand} onChange={setEditBrand} type="edit" />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateBrand} disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Brand"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this brand?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the brand{" "}
              <span className="font-semibold">{brandToDelete?.brand_name}</span> and all of its data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setBrandToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isLoading}
            >
              {isLoading ? "Deleting..." : "Delete Brand"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Card>
        <CardHeader>
          <CardTitle>Brand Configurations</CardTitle>
          <CardDescription>Manage white label brand settings and customizations</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Brand Name</TableHead>
                <TableHead>Domain</TableHead>
                <TableHead>Colors</TableHead>
                <TableHead>Limits</TableHead>
                <TableHead>Pricing</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {brands.map((brand) => (
                <TableRow key={brand.id}>
                  <TableCell className="font-medium">{brand.brand_name}</TableCell>
                  <TableCell>{brand.domain}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: brand.primary_color }} />
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: brand.secondary_color }} />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span>{brand.storage_limit_gb}GB Storage</span>
                      <span>{brand.max_accounts} Accounts</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {brand.price_amount ? (
                      <span>
                        ${brand.price_amount}/{brand.subscription_interval}
                      </span>
                    ) : (
                      <span className="text-gray-500">No pricing</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={brand.is_active ? "default" : "secondary"}>
                      {brand.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(brand.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditClick(brand)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteClick(brand)}
                        className="text-destructive hover:text-destructive"
                      >
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
  )
}
