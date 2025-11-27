import React from "react";
import { Plus, Edit } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const CategoryModal = ({
  isCategoryModalOpen,
  handleCategoryModalClose,
  editingCategory,
  categoryForm,
  setCategoryForm,
  handleSubmitCategory,
  createCategoryMutation,
  updateCategoryMutation,
}) => {
  return (
    <Dialog open={isCategoryModalOpen} onOpenChange={handleCategoryModalClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {editingCategory ? (
              <>
                <Edit className="w-5 h-5 text-blue-600" />
                Edit Kategori
              </>
            ) : (
              <>
                <Plus className="w-5 h-5 text-green-600" />
                Tambah Kategori Baru
              </>
            )}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmitCategory}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="categoryName" className="text-sm font-medium">
                Nama Kategori *
              </Label>
              <Input
                id="categoryName"
                value={categoryForm.name}
                onChange={(e) =>
                  setCategoryForm((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
                placeholder="Masukkan nama kategori"
                className="focus:border-blue-500"
                required
              />
            </div>

            {/* HAPUS BAGIAN DESCRIPTION */}
          </div>

          <DialogFooter className="mt-6 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCategoryModalClose}
              className="flex-1"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={
                createCategoryMutation.isPending ||
                updateCategoryMutation.isPending
              }
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {createCategoryMutation.isPending ||
              updateCategoryMutation.isPending
                ? "Menyimpan..."
                : editingCategory
                ? "Update Kategori"
                : "Tambah Kategori"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CategoryModal;
