import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  X,
  Check,
  Package,
} from 'lucide-react';
import { ensureAdminAuthToken } from '../utils/api';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const INITIAL_FORM = {
  name: '',
  fit_title: 'Regular Fit',
  category: 'Apparel',
  price: '',
  old_price: '',
  stock: 50,
  image: '/images/product-1.png',
  description: '',
};

export default function AdminProducts({ onProductsChanged }) {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [isSaving, setIsSaving] = useState(false);

  const fetchAdminProducts = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      await ensureAdminAuthToken();

      console.log('Fetching to:', API_BASE_URL);
      const response = await fetch(`${API_BASE_URL}/admin/products`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(
          result.message ||
            `Gagal memuat katalog produk (HTTP ${response.status})`
        );
      }
      setProducts(Array.isArray(result.data) ? result.data : []);
    } catch (error) {
      console.error('AdminProducts fetch error:', error);
      setErrorMessage(
        error.message ||
          `Gagal terhubung ke server API (${API_BASE_URL}). Pastikan server Laravel aktif.`
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdminProducts();
  }, [fetchAdminProducts]);

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData(INITIAL_FORM);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name || '',
      fit_title: product.fit_title || product.fitTitle || 'Regular Fit',
      category: product.category || 'Apparel',
      price: product.price ?? '',
      old_price: product.old_price ?? product.oldPrice ?? '',
      stock: product.stock ?? 50,
      image: product.image || '/images/product-1.png',
      description: product.description || '',
    });
    setIsFormOpen(true);
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage('');

    const payload = {
      name: formData.name.trim(),
      fit_title: formData.fit_title.trim() || 'Regular Fit',
      category: formData.category.trim() || 'Apparel',
      price: Number(formData.price),
      old_price: formData.old_price !== '' ? Number(formData.old_price) : null,
      stock: Number(formData.stock || 0),
      image: formData.image.trim() || '/images/product-1.png',
      description: formData.description.trim(),
    };

    try {
      await ensureAdminAuthToken();

      const url = editingId
        ? `${API_BASE_URL}/admin/products/${editingId}`
        : `${API_BASE_URL}/admin/products`;
      const method = editingId ? 'PUT' : 'POST';

      console.log('Fetching to:', API_BASE_URL);
      const response = await fetch(url, {
        method,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.message || 'Gagal menyimpan produk.');
      }

      if (editingId) {
        setProducts((prev) =>
          prev.map((item) => (item.id === editingId ? result.data : item))
        );
      } else {
        setProducts((prev) => [result.data, ...prev]);
      }

      setIsFormOpen(false);
      setEditingId(null);
      onProductsChanged?.();
    } catch (error) {
      console.error('AdminProducts save error:', error);
      setErrorMessage(error.message || 'Gagal menyimpan produk.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    setErrorMessage('');

    try {
      await ensureAdminAuthToken();

      console.log('Fetching to:', API_BASE_URL);
      const response = await fetch(
        `${API_BASE_URL}/admin/products/${productId}`,
        {
          method: 'DELETE',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.message || 'Gagal menghapus produk.');
      }
      setProducts((prev) => prev.filter((item) => item.id !== productId));
      onProductsChanged?.();
    } catch (error) {
      console.error('AdminProducts delete error:', error);
      setErrorMessage(error.message || 'Gagal menghapus produk.');
    }
  };

  return (
    <div className="space-y-6 pb-6 font-sans">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-red-600 block">
            Inventory & Merchandising
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900 flex items-center gap-2.5 mt-1">
            <Package className="w-6 h-6 text-red-600" />
            <span>Product Catalog ({products.length})</span>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleOpenCreate}
            className="px-4 py-2.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm shadow-red-600/20 flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>

          <button
            type="button"
            onClick={fetchAdminProducts}
            className="px-4 py-2.5 rounded-2xl bg-white hover:bg-red-50 text-gray-700 hover:text-red-600 shadow-sm text-xs font-bold flex items-center gap-2 transition-all"
          >
            <RefreshCw
              className={`w-4 h-4 text-red-600 ${isLoading ? 'animate-spin' : ''}`}
            />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-100 text-red-700 text-sm font-medium flex items-center justify-between shadow-sm">
          <span>{errorMessage}</span>
          <button
            type="button"
            onClick={() => setErrorMessage('')}
            className="text-red-500 hover:text-red-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {isFormOpen && (
        <form
          onSubmit={handleSubmitForm}
          className="bg-white rounded-2xl p-6 space-y-5 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <h2 className="text-base font-extrabold text-gray-900">
              {editingId
                ? `Edit Streetwear Product (#${editingId})`
                : 'Create New Streetwear Product'}
            </h2>
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="text-gray-400 hover:text-gray-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                Product Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Cyber Y2K Zip Hoodie"
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-gray-200 focus:border-red-500 focus:bg-white text-sm text-gray-900 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    category: e.target.value,
                  }))
                }
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-gray-200 focus:border-red-500 focus:bg-white text-sm text-gray-900 outline-none transition-all"
              >
                <option value="Apparel">Apparel</option>
                <option value="Gent's">Gent&apos;s</option>
                <option value="Ladies">Ladies</option>
                <option value="Footwear">Footwear</option>
                <option value="Accessories">Accessories</option>
                <option value="Kids">Kids</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                Fit / Subtitle
              </label>
              <input
                type="text"
                value={formData.fit_title}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    fit_title: e.target.value,
                  }))
                }
                placeholder="Oversized Fit"
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-gray-200 focus:border-red-500 focus:bg-white text-sm text-gray-900 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                Price ($)
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.price}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, price: e.target.value }))
                }
                placeholder="29.99"
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-gray-200 focus:border-red-500 focus:bg-white text-sm text-gray-900 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                Stock Quantity
              </label>
              <input
                type="number"
                required
                value={formData.stock}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, stock: e.target.value }))
                }
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-gray-200 focus:border-red-500 focus:bg-white text-sm text-gray-900 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                Image Path / URL
              </label>
              <input
                type="text"
                required
                value={formData.image}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, image: e.target.value }))
                }
                placeholder="/images/product-1.png"
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-gray-200 focus:border-red-500 focus:bg-white text-sm text-gray-900 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
              Product Description
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Heavyweight combed cotton Y2K streetwear..."
              className="w-full p-3.5 rounded-xl bg-slate-50 border border-gray-200 focus:border-red-500 focus:bg-white text-sm text-gray-900 outline-none transition-all"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm shadow-red-600/20 flex items-center gap-2 transition-colors"
            >
              <Check className="w-4 h-4" />
              <span>
                {isSaving
                  ? 'Saving...'
                  : editingId
                  ? 'Update Product'
                  : 'Create Product'}
              </span>
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-gray-100 text-slate-700 uppercase text-xs font-semibold tracking-wider">
                <th className="py-4 px-6">ID</th>
                <th className="py-4 px-6">Product</th>
                <th className="py-4 px-6">Category</th>
                <th className="py-4 px-6">Price</th>
                <th className="py-4 px-6">Stock</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr className="bg-white">
                  <td
                    colSpan={6}
                    className="py-12 px-6 text-center bg-white text-gray-500 text-sm"
                  >
                    Loading product catalog...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr className="bg-white">
                  <td
                    colSpan={6}
                    className="py-12 px-6 text-center bg-white text-gray-500 text-sm"
                  >
                    No products available.
                  </td>
                </tr>
              ) : (
                products.map((item) => (
                  <tr
                    key={item.id}
                    className="bg-white border-b border-gray-100 hover:bg-slate-50/70 transition-colors"
                  >
                    <td className="py-4 px-6 text-sm text-gray-500 font-medium">
                      #{item.id}
                    </td>
                    <td className="py-4 px-6 text-sm">
                      <div className="flex items-center gap-3.5">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-12 h-12 rounded-xl object-cover bg-slate-100 border border-gray-100 flex-shrink-0"
                        />
                        <div>
                          <p className="font-semibold text-gray-900">
                            {item.name}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {item.fit_title || 'Regular Fit'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-500">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-slate-100 text-gray-600 text-xs font-medium">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm font-bold text-gray-900">
                      ${Number(item.price).toFixed(2)}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-500">
                      {item.stock ?? 50} pcs
                    </td>
                    <td className="py-4 px-6 text-sm text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(item)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-red-50 text-gray-700 hover:text-red-600 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteProduct(item.id)}
                          className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-600 text-red-600 hover:text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
