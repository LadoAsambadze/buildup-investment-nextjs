"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Loader2,
  ChevronDown,
  ChevronUp,
  Pencil,
  Trash,
  Plus,
  MapPin,
} from "lucide-react";

const PathInput = ({ paths, onChange, label }) => {
  const handlePathChange = (index, value) => {
    const newPaths = [...paths];
    newPaths[index] = { path: value };
    onChange(newPaths);
  };

  const addPath = () => {
    onChange([...paths, { path: "" }]);
  };

  const removePath = (index) => {
    const newPaths = paths.filter((_, i) => i !== index);
    onChange(newPaths);
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {paths.map((pathItem, index) => (
        <div key={index} className="flex gap-2">
          <Input
            value={pathItem.path}
            onChange={(e) => handlePathChange(index, e.target.value)}
            placeholder="SVG path data (e.g., M0 0 L100 100)"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => removePath(index)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={addPath}
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Path
      </Button>
    </div>
  );
};

const FloorPlanForm = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    floor_range_start: "",
    floor_range_end: "",
    desktop_image: "",
    mobile_image: "",
    desktop_paths: [],
    mobile_paths: [],
    ...initialData,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePathsChange = (type, paths) => {
    setFormData((prev) => ({
      ...prev,
      [`${type}_paths`]: paths,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="floor_range_start">Start Floor</Label>
          <Input
            id="floor_range_start"
            name="floor_range_start"
            type="number"
            value={formData.floor_range_start}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <Label htmlFor="floor_range_end">End Floor</Label>
          <Input
            id="floor_range_end"
            name="floor_range_end"
            type="number"
            value={formData.floor_range_end}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="desktop_image">Desktop Image URL</Label>
        <Input
          id="desktop_image"
          name="desktop_image"
          value={formData.desktop_image}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <Label htmlFor="mobile_image">Mobile Image URL</Label>
        <Input
          id="mobile_image"
          name="mobile_image"
          value={formData.mobile_image}
          onChange={handleChange}
          required
        />
      </div>

      <div className="space-y-4">
        <PathInput
          paths={formData.desktop_paths}
          onChange={(paths) => handlePathsChange("desktop", paths)}
          label="Desktop Paths"
        />

        <PathInput
          paths={formData.mobile_paths}
          onChange={(paths) => handlePathsChange("mobile", paths)}
          label="Mobile Paths"
        />
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{initialData ? "Update" : "Create"}</Button>
      </DialogFooter>
    </form>
  );
};

export default function FloorTypeList({
  floor_number,
  buildingId,
}: {
  buildingId: number;
  floor_number?: number;
}) {
  const [floorPlans, setFloorPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedImages, setExpandedImages] = useState({});
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingFloorPlan, setEditingFloorPlan] = useState(null);

  useEffect(() => {
    fetchFloorPlans();
  }, [buildingId, floor_number]);

  async function fetchFloorPlans() {
    try {
      setLoading(true);
      let url = "http://localhost:3000/api/floor-plans";
      const queryParams = [];

      if (buildingId) {
        queryParams.push(`building_id=${buildingId}`);
      }
      if (floor_number) {
        queryParams.push(`floor_number=${floor_number}`);
      }

      if (queryParams.length > 0) {
        url += `?${queryParams.join("&")}`;
      }

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to fetch floor plans");
      }

      const data = await response.json();
      setFloorPlans(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const handleCreate = async (formData) => {
    try {
      const response = await fetch("http://localhost:3000/api/floor-plans", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to create floor plan");
      }

      setIsCreateDialogOpen(false);
      fetchFloorPlans();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = async (formData) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/floor-plans/${editingFloorPlan.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update floor plan");
      }

      setIsEditDialogOpen(false);
      setEditingFloorPlan(null);
      fetchFloorPlans();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this floor plan?")) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3000/api/floor-plans/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete floor plan");
      }

      fetchFloorPlans();
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleImageExpansion = (id) => {
    setExpandedImages((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mx-4 my-4">
        <AlertDescription>Error: {error}</AlertDescription>
      </Alert>
    );
  }

  if (!buildingId && !floor_number) {
    return (
      <Alert className="mx-4 my-4">
        <AlertDescription>
          Please select a building or specify a floor number to view floor
          plans.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="mx-4 my-4 w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Floor Plans</CardTitle>
            <CardDescription>
              {buildingId &&
                `Showing floor plans for building ${
                  floorPlans[0]?.building_name || buildingId
                }`}
              {floor_number && ` - Floor ${floor_number}`}
            </CardDescription>
          </div>
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Floor Plan
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Floor Plan</DialogTitle>
              </DialogHeader>
              <FloorPlanForm
                onSubmit={handleCreate}
                onCancel={() => setIsCreateDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {floorPlans.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No floor plans found for the selected criteria
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Floor Range</TableHead>
                <TableHead>Building</TableHead>
                <TableHead>Images</TableHead>
                <TableHead>Paths</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {floorPlans.map((floorPlan) => (
                <TableRow key={floorPlan.id}>
                  {/* ... previous cells ... */}
                  <TableCell>
                    <div className="flex gap-2">
                      <div className="text-sm">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          Desktop: {floorPlan.desktop_paths?.length || 0}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          Mobile: {floorPlan.mobile_paths?.length || 0}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  {/* ... rest of the cells ... */}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Floor Plan</DialogTitle>
          </DialogHeader>
          <FloorPlanForm
            initialData={editingFloorPlan}
            onSubmit={handleEdit}
            onCancel={() => {
              setIsEditDialogOpen(false);
              setEditingFloorPlan(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </Card>
  );
}
