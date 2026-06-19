'use client';

import { useState, useEffect } from 'react';
import { Package, Plus, Search, Edit2, Trash2, Copy, X, Save, ChevronDown } from 'lucide-react';
import PageHeader from '@/components/workspace/PageHeader';

interface ProductItem {
  id: string;
  name: string;
  sku?: string;
  description?: string;
  hsCode?: string;
  unit: string;
  unitPrice?: number;
  currency: string;
  netWeight?: number;
  grossWeight?: number;
  length?: number;
  width?: number;
  height?: number;
  originCountry?: string;
  material?: string;
  usage?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const emptyProduct: Partial<ProductItem> = {
  name: '',
  sku: '',
  description: '',
  hsCode: '',
  unit: 'PCS',
  unitPrice: undefined,
  currency: 'USD',
  netWeight: undefined,
  grossWeight: undefined,
  length: undefined,
  width: undefined,
  height: undefined,
  originCountry: '',
  material: '',
  usage: '',
};

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<ProductItem>>(emptyProduct);
  const [saving, setSaving] = useState(false);
  const [showInactive, setShowInactive] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [search, showInactive]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (!showInactive) params.set('isActive', 'true');
      
      const res = await fetch(`/api/workspace/products?${params}`);
      const data = await res.json();
      if (data.success) {
        setProducts(data.products);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name?.trim()) {
      alert('请输入商品名称');
      return;
    }

    setSaving(true);
    try {
      const url = editingId 
        ? `/api/workspace/products/${editingId}`
        : '/api/workspace/products';
      const method = editingId ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        setShowForm(false);
        setEditingId(null);
        setFormData(emptyProduct);
        fetchProducts();
      } else {
        alert(data.error || '保存失败');
      }
    } catch (error) {
      console.error('Failed to save product:', error);
      alert('保存失败');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (product: ProductItem) => {
    setFormData(product);
    setEditingId(product.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除此商品吗？')) return;
    
    try {
      const res = await fetch(`/api/workspace/products/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchProducts();
      }
    } catch (error) {
      console.error('Failed to delete product:', error);
    }
  };

  const handleDuplicate = (product: ProductItem) => {
    const { id, createdAt, updatedAt, ...rest } = product;
    setFormData({ ...rest, name: `${product.name} (副本)` });
    setEditingId(null);
    setShowForm(true);
  };

  const handleNew = () => {
    setFormData(emptyProduct);
    setEditingId(null);
    setShowForm(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="商品资料"
        description="管理常用商品信息，在报价单、发票、装箱单中一键引用"
        icon={<Package className="w-5 h-5 text-blue-600" />}
        backHref="/workspace"
      />

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索商品名称、SKU、HS Code..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => setShowInactive(!showInactive)}
            className={`px-4 py-2 text-sm rounded-lg border ${showInactive ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-white text-gray-600 border-gray-200'}`}
          >
            {showInactive ? '显示已启用' : '显示已停用'}
          </button>
          <button
            onClick={handleNew}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" /> 新增商品
          </button>
        </div>

        {/* Product Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
                <h3 className="font-semibold text-lg">{editingId ? '编辑商品' : '新增商品'}</h3>
                <button onClick={() => { setShowForm(false); setEditingId(null); }} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                {/* Basic Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">商品名称 *</label>
                    <input
                      type="text"
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="例如：不锈钢保温杯"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                    <input
                      type="text"
                      value={formData.sku || ''}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="例如：BT-500ML"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">商品描述</label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                    placeholder="详细描述商品特性..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">HS Code</label>
                    <input
                      type="text"
                      value={formData.hsCode || ''}
                      onChange={(e) => setFormData({ ...formData, hsCode: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="例如：9617000000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">单位</label>
                    <input
                      type="text"
                      value={formData.unit || ''}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="PCS/SET/KG"
                    />
                  </div>
                </div>

                {/* Price */}
                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-900 mb-3">价格信息</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">单价</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.unitPrice || ''}
                        onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) || undefined })}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">币种</label>
                      <select
                        value={formData.currency || 'USD'}
                        onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="USD">USD</option>
                        <option value="CNY">CNY</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Weight & Dimensions */}
                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-900 mb-3">重量与尺寸</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">净重 (KG)</label>
                      <input
                        type="number"
                        step="0.001"
                        value={formData.netWeight || ''}
                        onChange={(e) => setFormData({ ...formData, netWeight: parseFloat(e.target.value) || undefined })}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">毛重 (KG)</label>
                      <input
                        type="number"
                        step="0.001"
                        value={formData.grossWeight || ''}
                        onChange={(e) => setFormData({ ...formData, grossWeight: parseFloat(e.target.value) || undefined })}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">产地</label>
                      <input
                        type="text"
                        value={formData.originCountry || ''}
                        onChange={(e) => setFormData({ ...formData, originCountry: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="例如：China"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">长 (CM)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.length || ''}
                        onChange={(e) => setFormData({ ...formData, length: parseFloat(e.target.value) || undefined })}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">宽 (CM)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.width || ''}
                        onChange={(e) => setFormData({ ...formData, width: parseFloat(e.target.value) || undefined })}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">高 (CM)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.height || ''}
                        onChange={(e) => setFormData({ ...formData, height: parseFloat(e.target.value) || undefined })}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Material & Usage */}
                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-900 mb-3">其他信息</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">材质</label>
                      <input
                        type="text"
                        value={formData.material || ''}
                        onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="例如：304 Stainless Steel"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">用途</label>
                      <input
                        type="text"
                        value={formData.usage || ''}
                        onChange={(e) => setFormData({ ...formData, usage: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="例如：Drinkware"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-end gap-3">
                <button
                  onClick={() => { setShowForm(false); setEditingId(null); }}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  取消
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" /> {saving ? '保存中...' : '保存'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Product List */}
        {loading ? (
          <div className="text-center py-12 text-gray-500">加载中...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">
              {search ? '没有找到匹配的商品' : '还没有添加商品'}
            </p>
            {!search && (
              <button
                onClick={handleNew}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" /> 添加第一个商品
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-4">
            {products.map((product) => (
              <div
                key={product.id}
                className={`bg-white rounded-xl border p-4 ${!product.isActive ? 'opacity-60' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{product.name}</h3>
                      {product.sku && (
                        <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">{product.sku}</span>
                      )}
                      {!product.isActive && (
                        <span className="text-xs px-2 py-0.5 bg-red-50 text-red-600 rounded">已停用</span>
                      )}
                    </div>
                    {product.description && (
                      <p className="text-sm text-gray-600 mb-2">{product.description}</p>
                    )}
                    <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                      {product.hsCode && <span>HS: {product.hsCode}</span>}
                      {product.unitPrice && <span>{product.currency} {product.unitPrice}/{product.unit}</span>}
                      {product.netWeight && <span>净重: {product.netWeight} KG</span>}
                      {product.originCountry && <span>产地: {product.originCountry}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-4">
                    <button
                      onClick={() => handleEdit(product)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                      title="编辑"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDuplicate(product)}
                      className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg"
                      title="复制"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                      title="删除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
