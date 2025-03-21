import React, { useState } from "react";
import { PlusCircle, Edit, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Provider {
  id: string;
  name: string;
  email: string;
  phone?: string;
  color: string;
  status: "active" | "inactive";
}

interface ProviderManagementProps {
  providers?: Provider[];
}

const ProviderManagement = ({
  providers: initialProviders = [],
}: ProviderManagementProps) => {
  // Default providers if none are provided
  const defaultProviders: Provider[] = [
    {
      id: "1",
      name: "Dr. Jane Smith",
      email: "jane.smith@example.com",
      phone: "(555) 123-4567",
      color: "#4CAF50",
      status: "active",
    },
    {
      id: "2",
      name: "Dr. John Doe",
      email: "john.doe@example.com",
      phone: "(555) 987-6543",
      color: "#2196F3",
      status: "active",
    },
    {
      id: "3",
      name: "Dr. Emily Johnson",
      email: "emily.johnson@example.com",
      phone: "(555) 456-7890",
      color: "#9C27B0",
      status: "inactive",
    },
  ];

  const [providers, setProviders] = useState<Provider[]>(
    initialProviders.length > 0 ? initialProviders : defaultProviders,
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentProvider, setCurrentProvider] = useState<Provider | null>(null);
  const [newProvider, setNewProvider] = useState<Partial<Provider>>({
    name: "",
    email: "",
    phone: "",
    color: "#4CAF50",
    status: "active",
  });

  // Filter providers based on search term
  const filteredProviders = providers.filter(
    (provider) =>
      provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleAddProvider = () => {
    if (newProvider.name && newProvider.email && newProvider.color) {
      const provider: Provider = {
        id: Date.now().toString(),
        name: newProvider.name,
        email: newProvider.email,
        phone: newProvider.phone || "",
        color: newProvider.color,
        status: (newProvider.status as "active" | "inactive") || "active",
      };
      setProviders([...providers, provider]);
      setNewProvider({
        name: "",
        email: "",
        phone: "",
        color: "#4CAF50",
        status: "active",
      });
      setIsAddDialogOpen(false);
    }
  };

  const handleEditProvider = () => {
    if (currentProvider && currentProvider.name && currentProvider.email) {
      const updatedProviders = providers.map((provider) =>
        provider.id === currentProvider.id ? currentProvider : provider,
      );
      setProviders(updatedProviders);
      setIsEditDialogOpen(false);
    }
  };

  const handleDeleteProvider = () => {
    if (currentProvider) {
      const updatedProviders = providers.filter(
        (provider) => provider.id !== currentProvider.id,
      );
      setProviders(updatedProviders);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleStatusChange = (id: string, checked: boolean) => {
    const updatedProviders = providers.map((provider) =>
      provider.id === id
        ? { ...provider, status: checked ? "active" : "inactive" }
        : provider,
    );
    setProviders(updatedProviders);
  };

  const colorOptions = [
    { value: "#4CAF50", label: "Green" },
    { value: "#2196F3", label: "Blue" },
    { value: "#9C27B0", label: "Purple" },
    { value: "#F44336", label: "Red" },
    { value: "#FF9800", label: "Orange" },
    { value: "#FFEB3B", label: "Yellow" },
    { value: "#795548", label: "Brown" },
    { value: "#607D8B", label: "Gray" },
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm w-full h-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Provider Management</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              Add Provider
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Provider</DialogTitle>
              <DialogDescription>
                Enter the details for the new healthcare provider.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="name" className="text-right font-medium">
                  Name
                </label>
                <Input
                  id="name"
                  value={newProvider.name}
                  onChange={(e) =>
                    setNewProvider({ ...newProvider, name: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="email" className="text-right font-medium">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={newProvider.email}
                  onChange={(e) =>
                    setNewProvider({ ...newProvider, email: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="phone" className="text-right font-medium">
                  Phone
                </label>
                <Input
                  id="phone"
                  value={newProvider.phone}
                  onChange={(e) =>
                    setNewProvider({ ...newProvider, phone: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="color" className="text-right font-medium">
                  Color
                </label>
                <Select
                  value={newProvider.color}
                  onValueChange={(value) =>
                    setNewProvider({ ...newProvider, color: value })
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a color" />
                  </SelectTrigger>
                  <SelectContent>
                    {colorOptions.map((color) => (
                      <SelectItem key={color.value} value={color.value}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: color.value }}
                          />
                          <span>{color.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="status" className="text-right font-medium">
                  Active
                </label>
                <div className="col-span-3">
                  <Switch
                    id="status"
                    checked={newProvider.status === "active"}
                    onCheckedChange={(checked) =>
                      setNewProvider({
                        ...newProvider,
                        status: checked ? "active" : "inactive",
                      })
                    }
                  />
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
              <Button onClick={handleAddProvider}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search providers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Color</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProviders.length > 0 ? (
              filteredProviders.map((provider) => (
                <TableRow key={provider.id}>
                  <TableCell className="font-medium">{provider.name}</TableCell>
                  <TableCell>{provider.email}</TableCell>
                  <TableCell>{provider.phone}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: provider.color }}
                      />
                      {
                        colorOptions.find((c) => c.value === provider.color)
                          ?.label
                      }
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={provider.status === "active"}
                        onCheckedChange={(checked) =>
                          handleStatusChange(provider.id, checked)
                        }
                      />
                      <span
                        className={`text-xs ${provider.status === "active" ? "text-green-600" : "text-red-600"}`}
                      >
                        {provider.status === "active" ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Dialog
                        open={
                          isEditDialogOpen &&
                          currentProvider?.id === provider.id
                        }
                        onOpenChange={(open) => {
                          setIsEditDialogOpen(open);
                          if (!open) setCurrentProvider(null);
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setCurrentProvider(provider)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit Provider</DialogTitle>
                            <DialogDescription>
                              Update the provider's information.
                            </DialogDescription>
                          </DialogHeader>
                          {currentProvider && (
                            <div className="grid gap-4 py-4">
                              <div className="grid grid-cols-4 items-center gap-4">
                                <label
                                  htmlFor="edit-name"
                                  className="text-right font-medium"
                                >
                                  Name
                                </label>
                                <Input
                                  id="edit-name"
                                  value={currentProvider.name}
                                  onChange={(e) =>
                                    setCurrentProvider({
                                      ...currentProvider,
                                      name: e.target.value,
                                    })
                                  }
                                  className="col-span-3"
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <label
                                  htmlFor="edit-email"
                                  className="text-right font-medium"
                                >
                                  Email
                                </label>
                                <Input
                                  id="edit-email"
                                  type="email"
                                  value={currentProvider.email}
                                  onChange={(e) =>
                                    setCurrentProvider({
                                      ...currentProvider,
                                      email: e.target.value,
                                    })
                                  }
                                  className="col-span-3"
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <label
                                  htmlFor="edit-phone"
                                  className="text-right font-medium"
                                >
                                  Phone
                                </label>
                                <Input
                                  id="edit-phone"
                                  value={currentProvider.phone}
                                  onChange={(e) =>
                                    setCurrentProvider({
                                      ...currentProvider,
                                      phone: e.target.value,
                                    })
                                  }
                                  className="col-span-3"
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <label
                                  htmlFor="edit-color"
                                  className="text-right font-medium"
                                >
                                  Color
                                </label>
                                <Select
                                  value={currentProvider.color}
                                  onValueChange={(value) =>
                                    setCurrentProvider({
                                      ...currentProvider,
                                      color: value,
                                    })
                                  }
                                >
                                  <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select a color" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {colorOptions.map((color) => (
                                      <SelectItem
                                        key={color.value}
                                        value={color.value}
                                      >
                                        <div className="flex items-center gap-2">
                                          <div
                                            className="w-4 h-4 rounded-full"
                                            style={{
                                              backgroundColor: color.value,
                                            }}
                                          />
                                          <span>{color.label}</span>
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <label
                                  htmlFor="edit-status"
                                  className="text-right font-medium"
                                >
                                  Active
                                </label>
                                <div className="col-span-3">
                                  <Switch
                                    id="edit-status"
                                    checked={
                                      currentProvider.status === "active"
                                    }
                                    onCheckedChange={(checked) =>
                                      setCurrentProvider({
                                        ...currentProvider,
                                        status: checked ? "active" : "inactive",
                                      })
                                    }
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => setIsEditDialogOpen(false)}
                            >
                              Cancel
                            </Button>
                            <Button onClick={handleEditProvider}>
                              Save Changes
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      <Dialog
                        open={
                          isDeleteDialogOpen &&
                          currentProvider?.id === provider.id
                        }
                        onOpenChange={(open) => {
                          setIsDeleteDialogOpen(open);
                          if (!open) setCurrentProvider(null);
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setCurrentProvider(provider)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Delete Provider</DialogTitle>
                            <DialogDescription>
                              Are you sure you want to delete this provider?
                              This action cannot be undone.
                            </DialogDescription>
                          </DialogHeader>
                          {currentProvider && (
                            <div className="py-4">
                              <p className="font-medium">
                                {currentProvider.name}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {currentProvider.email}
                              </p>
                            </div>
                          )}
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => setIsDeleteDialogOpen(false)}
                            >
                              Cancel
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={handleDeleteProvider}
                            >
                              Delete
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-6 text-muted-foreground"
                >
                  No providers found. Add a new provider to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ProviderManagement;
