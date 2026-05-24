import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Upload, X, ImageIcon } from "lucide-react";
import toast from "react-hot-toast";

const scentFamilies = [
  "floral", "woody", "oriental", "fresh", "gourmand",
];

const inputCls =
  "w-full bg-muted rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("be_token");
  const isEdit = Boolean(id);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [form, setForm] = useState<any>({
    name: "",
    brand_id: "",
    brand_name: "",
    category_id: 1,
    price: "",
    discount_price: "",
    scent_family: "",
    size_ml: "",
    stock: "",
    description: "",
    top_notes: "",
    middle_notes: "",
    base_notes: "",
    image_url: "",
    gender: "unisex",
    is_featured: false,
    is_new_arrival: false,
    is_best_seller: false,
  });

  useEffect(() => {
    fetch("http://localhost:5000/api/brands")
      .then(r => r.json())
      .then(data => setBrands(Array.isArray(data) ? data : []));

    if (id) {
      fetch(`http://localhost:5000/api/products/${id}`)
        .then(r => r.json())
        .then(data => {
          if (data) {
            setForm(data);
            if (data.image_url) {
              setImagePreview(
                data.image_url.startsWith("http")
                  ? data.image_url
                  : `http://localhost:5000${data.image_url}`
              );
            }
          }
        });
    }
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type } = target;
    setForm((prev: any) => ({
      ...prev,
      [name]: type === "checkbox" ? target.checked : value,
    }));
  };

  const handleBrandChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const brand = brands.find(b => b.id == e.target.value);
    if (!brand) return;
    setForm((prev: any) => ({ ...prev, brand_id: brand.id, brand_name: brand.name }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      toast.error("Image must be under 5 MB");
      e.target.value = "";
      return;
    }

    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(file.type)) {
      toast.error("Only JPEG, PNG, WebP, or GIF images are allowed");
      e.target.value = "";
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setForm((prev: any) => ({ ...prev, image_url: "" }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return form.image_url || null;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("image", imageFile);

      const res = await fetch("http://localhost:5000/api/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.msg || "Image upload failed");
        return null;
      }
      return data.image_url;
    } catch {
      toast.error("Image upload failed");
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name || !form.brand_id || !form.price || !form.stock) {
      toast.error("Please fill all required fields");
      return;
    }

    setLoading(true);

    // Upload image first if a new file was selected
    let imageUrl = form.image_url;
    if (imageFile) {
      const uploaded = await uploadImage();
      if (uploaded === null) {
        setLoading(false);
        return;
      }
      imageUrl = uploaded;
    }

    const method = isEdit ? "PUT" : "POST";
    const url = isEdit
      ? `http://localhost:5000/api/products/${id}`
      : "http://localhost:5000/api/products";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...form,
          image_url: imageUrl,
          price: Number(form.price),
          discount_price: form.discount_price ? Number(form.discount_price) : null,
          stock: Number(form.stock),
          size_ml: form.size_ml ? Number(form.size_ml) : null,
          category_id: Number(form.category_id) || 1,
          is_featured: Boolean(form.is_featured),
          is_new_arrival: Boolean(form.is_new_arrival),
          is_best_seller: Boolean(form.is_best_seller),
        }),
      });

      if (res.ok) {
        toast.success(isEdit ? "Product updated!" : "Product added!");
        navigate("/admin/products");
      } else {
        const data = await res.json();
        toast.error(data?.msg || "Failed to save product");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={() => navigate("/admin/products")}
        className="mb-6 text-sm text-muted-foreground hover:text-foreground"
      >
        ← Back to Products
      </button>

      <h1 className="font-heading text-2xl font-bold mb-6">
        {isEdit ? "Edit Product" : "Add New Product"}
      </h1>

      <form onSubmit={handleSubmit} className="bg-card rounded-xl border border-border p-6 space-y-5 max-w-2xl">

        {/* Product Image */}
        <div>
          <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2 block">
            Product Image <span className="normal-case text-muted-foreground/70">(max 5 MB · JPEG / PNG / WebP)</span>
          </label>

          {imagePreview ? (
            <div className="relative w-40 h-40 rounded-xl overflow-hidden border border-border group">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-40 h-40 rounded-xl border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ImageIcon className="w-8 h-8" />
              <span className="text-xs">Click to upload</span>
              <span className="text-[10px]">Max 5 MB</span>
            </button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
            onChange={handleImageChange}
            className="hidden"
          />

          {imageFile && (
            <p className="text-xs text-muted-foreground mt-1">
              {imageFile.name} · {(imageFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
          )}
        </div>

        {/* Name */}
        <div>
          <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1 block">
            Product Name *
          </label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="e.g. Mysore Sandalwood"
            className={inputCls}
            required
          />
        </div>

        {/* Brand */}
        <div>
          <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1 block">
            Brand *
          </label>
          <select onChange={handleBrandChange} value={form.brand_id} className={inputCls} required>
            <option value="">Select Brand</option>
            {brands.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>

        {/* Scent Family + Gender */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1 block">
              Scent Family
            </label>
            <select name="scent_family" onChange={handleChange} value={form.scent_family} className={inputCls}>
              <option value="">Select Scent Family</option>
              {scentFamilies.map(s => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1 block">
              Gender
            </label>
            <select name="gender" onChange={handleChange} value={form.gender} className={inputCls}>
              <option value="unisex">Unisex</option>
              <option value="men">Men</option>
              <option value="women">Women</option>
            </select>
          </div>
        </div>

        {/* Price & Discount */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1 block">
              Price (₹) *
            </label>
            <input
              type="number"
              name="price"
              value={form.price}
              onChange={handleChange}
              placeholder="e.g. 4500"
              className={inputCls}
              required
              min={0}
            />
          </div>
          <div>
            <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1 block">
              Discount Price (₹)
            </label>
            <input
              type="number"
              name="discount_price"
              value={form.discount_price || ""}
              onChange={handleChange}
              placeholder="Leave blank if no discount"
              className={inputCls}
              min={0}
            />
          </div>
        </div>

        {/* Stock & Size */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1 block">
              Stock *
            </label>
            <input
              type="number"
              name="stock"
              value={form.stock}
              onChange={handleChange}
              placeholder="e.g. 25"
              className={inputCls}
              required
              min={0}
            />
          </div>
          <div>
            <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1 block">
              Size (ml)
            </label>
            <input
              type="number"
              name="size_ml"
              value={form.size_ml || ""}
              onChange={handleChange}
              placeholder="e.g. 50"
              className={inputCls}
              min={0}
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1 block">
            Description
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
            placeholder="Product description..."
            className={inputCls}
          />
        </div>

        {/* Notes */}
        <div>
          <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1 block">
            Top Notes
          </label>
          <input
            name="top_notes"
            value={form.top_notes}
            onChange={handleChange}
            placeholder="e.g. Bergamot, Cardamom"
            className={inputCls}
          />
        </div>
        <div>
          <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1 block">
            Heart Notes
          </label>
          <input
            name="middle_notes"
            value={form.middle_notes}
            onChange={handleChange}
            placeholder="e.g. Rose, Sandalwood"
            className={inputCls}
          />
        </div>
        <div>
          <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1 block">
            Base Notes
          </label>
          <input
            name="base_notes"
            value={form.base_notes}
            onChange={handleChange}
            placeholder="e.g. Musk, Amber"
            className={inputCls}
          />
        </div>

        {/* Checkboxes */}
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="is_new_arrival"
              checked={Boolean(form.is_new_arrival)}
              onChange={handleChange}
              className="w-4 h-4 accent-primary rounded"
            />
            <span className="text-sm">New Arrival</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="is_best_seller"
              checked={Boolean(form.is_best_seller)}
              onChange={handleChange}
              className="w-4 h-4 accent-primary rounded"
            />
            <span className="text-sm">Best Seller</span>
          </label>
        </div>

        {/* Submit */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading || uploadingImage}
            className="btn-gold disabled:opacity-60 flex items-center gap-2"
          >
            {uploadingImage ? (
              <>
                <Upload className="w-4 h-4 animate-bounce" /> Uploading image...
              </>
            ) : loading ? (
              "Saving..."
            ) : (
              isEdit ? "Update Product" : "Add Product"
            )}
          </button>
          <button
            type="button"
            onClick={() => navigate("/admin/products")}
            className="btn-outline-gold text-sm"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
