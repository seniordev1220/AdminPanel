"use client"

import { useState } from "react"
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
import { Plus, Edit, Trash2, Eye } from "lucide-react"

interface WhiteLabelBrand {
  id: string
  name: string
  domain: string
  primaryColor: string
  secondaryColor: string
  logo: string
  favicon: string
  isActive: boolean
  createdAt: string
}

export default function WhiteLabelPage() {
  const [brands, setBrands] = useState<WhiteLabelBrand[]>([
    {
      id: "1",
      name: "Acme Corp",
      domain: "acme.example.com",
      primaryColor: "#3b82f6",
      secondaryColor: "#1e40af",
      logo: "/placeholder.svg?height=40&width=120",
      favicon: "/placeholder.svg?height=32&width=32",
      isActive: true,
      createdAt: "2024-01-15",
    },
    {
      id: "2",
      name: "TechStart Inc",
      domain: "techstart.example.com",
      primaryColor: "#10b981",
      secondaryColor: "#059669",
      logo: "/placeholder.svg?height=40&width=120",
      favicon: "/placeholder.svg?height=32&width=32",
      isActive: true,
      createdAt: "2024-01-10",
    },
  ])

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newBrand, setNewBrand] = useState({
    name: "",
    domain: "",
    primaryColor: "#3b82f6",
    secondaryColor: "#1e40af",
    logo: "",
    favicon: "",
    isActive: true,
  })

  const handleAddBrand = () => {
    const brand: WhiteLabelBrand = {
      id: Date.now().toString(),
      ...newBrand,
      createdAt: new Date().toISOString().split("T")[0],
    }
    setBrands([...brands, brand])
    setNewBrand({
      name: "",
      domain: "",
      primaryColor: "#3b82f6",
      secondaryColor: "#1e40af",
      logo: "",
      favicon: "",
      isActive: true,
    })
    setIsAddDialogOpen(false)
  }

  const handleDeleteBrand = (id: string) => {
    setBrands(brands.filter((brand) => brand.id !== id))
  }

  const toggleBrandStatus = (id: string) => {
    setBrands(brands.map((brand) => (brand.id === id ? { ...brand, isActive: !brand.isActive } : brand)))
  }

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
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="branding">Branding</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>
              <TabsContent value="basic" className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="brand-name">Brand Name</Label>
                  <Input
                    id="brand-name"
                    value={newBrand.name}
                    onChange={(e) => setNewBrand({ ...newBrand, name: e.target.value })}
                    placeholder="Enter brand name"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="domain">Domain</Label>
                  <Input
                    id="domain"
                    value={newBrand.domain}
                    onChange={(e) => setNewBrand({ ...newBrand, domain: e.target.value })}
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
                        value={newBrand.primaryColor}
                        onChange={(e) => setNewBrand({ ...newBrand, primaryColor: e.target.value })}
                        className="w-16 h-10"
                      />
                      <Input
                        value={newBrand.primaryColor}
                        onChange={(e) => setNewBrand({ ...newBrand, primaryColor: e.target.value })}
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
                        value={newBrand.secondaryColor}
                        onChange={(e) => setNewBrand({ ...newBrand, secondaryColor: e.target.value })}
                        className="w-16 h-10"
                      />
                      <Input
                        value={newBrand.secondaryColor}
                        onChange={(e) => setNewBrand({ ...newBrand, secondaryColor: e.target.value })}
                        placeholder="#1e40af"
                      />
                    </div>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="logo">Logo URL</Label>
                  <Input
                    id="logo"
                    value={newBrand.logo}
                    onChange={(e) => setNewBrand({ ...newBrand, logo: e.target.value })}
                    placeholder="https://example.com/logo.png"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="favicon">Favicon URL</Label>
                  <Input
                    id="favicon"
                    value={newBrand.favicon}
                    onChange={(e) => setNewBrand({ ...newBrand, favicon: e.target.value })}
                    placeholder="https://example.com/favicon.ico"
                  />
                </div>
              </TabsContent>
              <TabsContent value="settings" className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="active"
                    checked={newBrand.isActive}
                    onCheckedChange={(checked) => setNewBrand({ ...newBrand, isActive: checked })}
                  />
                  <Label htmlFor="active">Active</Label>
                </div>
              </TabsContent>
            </Tabs>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddBrand}>Add Brand</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

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
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {brands.map((brand) => (
                <TableRow key={brand.id}>
                  <TableCell className="font-medium">{brand.name}</TableCell>
                  <TableCell>{brand.domain}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: brand.primaryColor }} />
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: brand.secondaryColor }} />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={brand.isActive ? "default" : "secondary"}>
                      {brand.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>{brand.createdAt}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Switch checked={brand.isActive} onCheckedChange={() => toggleBrandStatus(brand.id)} size="sm" />
                      <Button variant="outline" size="sm" onClick={() => handleDeleteBrand(brand.id)}>
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
