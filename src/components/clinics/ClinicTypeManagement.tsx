import React, { useState } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";

interface ClinicType {
  id: string;
  name: string;
  color: string;
  isActive: boolean;
}

interface ClinicTypeManagementProps {
  clinicTypes?: ClinicType[];
  onAddClinicType?: (clinicType: Omit<ClinicType, "id">) => void;
  onUpdateClinicType?: (clinicType: ClinicType) => void;
  onDeleteClinicType?: (id: string) => void;
}

const ClinicTypeManagement: React.FC<ClinicTypeManagementProps> = ({
  clinicTypes = [
    { id: "1", name: "Primary Care", color: "#4CAF50", isActive: true },
    { id: "2", name: "Specialty Care", color: "#2196F3", isActive: true },
    { id: "3", name: "Urgent Care", color: "#FF9800", isActive: true },
    { id: "4", name: "Telehealth", color: "#9C27B0", isActive: false },
  ],
  onAddClinicType = () => {},
  onUpdateClinicType = () => {},
  onDeleteClinicType = () => {},
}) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(true);
  const [selectedClinicType, setSelectedClinicType] =
    useState<ClinicType | null>(null);

  const [newClinicType, setNewClinicType] = useState<Omit<ClinicType, "id">>({
    name: "",
    color: "#000000",
    isActive: true,
  });

  const handleAddClinicType = () => {
    onAddClinicType(newClinicType);
    setNewClinicType({ name: "", color: "#000000", isActive: true });
    setIsAddDialogOpen(false);
  };

  const handleUpdateClinicType = () => {
    if (selectedClinicType) {
      onUpdateClinicType(selectedClinicType);
      setSelectedClinicType(null);
      setIsEditDialogOpen(false);
    }
  };

  const handleDeleteClinicType = () => {
    if (selectedClinicType) {
      onDeleteClinicType(selectedClinicType.id);
      setSelectedClinicType(null);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleStatusChange = (id: string, isActive: boolean) => {
    const clinicType = clinicTypes.find((ct) => ct.id === id);
    if (clinicType) {
      onUpdateClinicType({ ...clinicType, isActive });
    }
  };

  return (
    <div className="w-full h-full p-6 bg-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Clinic Type Management</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus size={16} />
              Add Clinic Type
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Clinic Type</DialogTitle>
              <DialogDescription>
                Create a new clinic type with a name and color code.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="name" className="text-right">
                  Name
                </label>
                <Input
                  id="name"
                  value={newClinicType.name}
                  onChange={(e) =>
                    setNewClinicType({ ...newClinicType, name: e.target.value })
                  }
                  className="col-span-3"
                  placeholder="Enter clinic type name"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="color" className="text-right">
                  Color
                </label>
                <div className="col-span-3 flex items-center gap-2">
                  <Input
                    id="color"
                    type="color"
                    value={newClinicType.color}
                    onChange={(e) =>
                      setNewClinicType({
                        ...newClinicType,
                        color: e.target.value,
                      })
                    }
                    className="w-12 h-9 p-1"
                  />
                  <Input
                    value={newClinicType.color}
                    onChange={(e) =>
                      setNewClinicType({
                        ...newClinicType,
                        color: e.target.value,
                      })
                    }
                    className="flex-1"
                    placeholder="#000000"
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="status" className="text-right">
                  Status
                </label>
                <div className="flex items-center gap-2 col-span-3">
                  <Switch
                    id="status"
                    checked={newClinicType.isActive}
                    onCheckedChange={(checked) =>
                      setNewClinicType({ ...newClinicType, isActive: checked })
                    }
                  />
                  <span>{newClinicType.isActive ? "Active" : "Inactive"}</span>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleAddClinicType}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Color</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clinicTypes.map((clinicType) => (
              <TableRow key={clinicType.id}>
                <TableCell className="font-medium">{clinicType.name}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded-full"
                      style={{ backgroundColor: clinicType.color }}
                    />
                    <span>{clinicType.color}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={clinicType.isActive}
                      onCheckedChange={(checked) =>
                        handleStatusChange(clinicType.id, checked)
                      }
                    />
                    <span>{clinicType.isActive ? "Active" : "Inactive"}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Dialog
                      open={
                        isEditDialogOpen &&
                        selectedClinicType?.id === clinicType.id
                      }
                      onOpenChange={(open) => {
                        setIsEditDialogOpen(open);
                        if (!open) setSelectedClinicType(null);
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedClinicType(clinicType)}
                        >
                          <Edit size={16} />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Clinic Type</DialogTitle>
                          <DialogDescription>
                            Update the clinic type details.
                          </DialogDescription>
                        </DialogHeader>
                        {selectedClinicType && (
                          <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                              <label htmlFor="edit-name" className="text-right">
                                Name
                              </label>
                              <Input
                                id="edit-name"
                                value={selectedClinicType.name}
                                onChange={(e) =>
                                  setSelectedClinicType({
                                    ...selectedClinicType,
                                    name: e.target.value,
                                  })
                                }
                                className="col-span-3"
                              />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <label
                                htmlFor="edit-color"
                                className="text-right"
                              >
                                Color
                              </label>
                              <div className="col-span-3 flex items-center gap-2">
                                <Input
                                  id="edit-color"
                                  type="color"
                                  value={selectedClinicType.color}
                                  onChange={(e) =>
                                    setSelectedClinicType({
                                      ...selectedClinicType,
                                      color: e.target.value,
                                    })
                                  }
                                  className="w-12 h-9 p-1"
                                />
                                <Input
                                  value={selectedClinicType.color}
                                  onChange={(e) =>
                                    setSelectedClinicType({
                                      ...selectedClinicType,
                                      color: e.target.value,
                                    })
                                  }
                                  className="flex-1"
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <label
                                htmlFor="edit-status"
                                className="text-right"
                              >
                                Status
                              </label>
                              <div className="flex items-center gap-2 col-span-3">
                                <Switch
                                  id="edit-status"
                                  checked={selectedClinicType.isActive}
                                  onCheckedChange={(checked) =>
                                    setSelectedClinicType({
                                      ...selectedClinicType,
                                      isActive: checked,
                                    })
                                  }
                                />
                                <span>
                                  {selectedClinicType.isActive
                                    ? "Active"
                                    : "Inactive"}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setIsEditDialogOpen(false);
                              setSelectedClinicType(null);
                            }}
                          >
                            Cancel
                          </Button>
                          <Button onClick={handleUpdateClinicType}>
                            Save Changes
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    <Dialog
                      open={
                        isDeleteDialogOpen &&
                        selectedClinicType?.id === clinicType.id
                      }
                      onOpenChange={(open) => {
                        setIsDeleteDialogOpen(open);
                        if (!open) setSelectedClinicType(null);
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                          onClick={() => setSelectedClinicType(clinicType)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Delete Clinic Type</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to delete this clinic type?
                            This action cannot be undone.
                          </DialogDescription>
                        </DialogHeader>
                        {selectedClinicType && (
                          <div className="py-4">
                            <p className="mb-2">You are about to delete:</p>
                            <div className="flex items-center gap-2 p-3 border rounded-md">
                              <div
                                className="w-6 h-6 rounded-full"
                                style={{
                                  backgroundColor: selectedClinicType.color,
                                }}
                              />
                              <span className="font-medium">
                                {selectedClinicType.name}
                              </span>
                            </div>
                          </div>
                        )}
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setIsDeleteDialogOpen(false);
                              setSelectedClinicType(null);
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={handleDeleteClinicType}
                          >
                            Delete
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ClinicTypeManagement;
