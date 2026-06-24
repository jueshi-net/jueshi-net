'use client';

import { useState, useEffect } from 'react';
import { Package, Search, X } from 'lucide-react';

interface ProductItem {
  id: string;
  name: string;
  sku?: string;
  description?: string;
  hsCode?: string;
  unit?: string;
  unitPrice?: number;
  currency?: string;
  netWeight?: number;
  grossWeight?: number;
  length?: number;
  width?: number;
  height?: number;
  originCountry?: string;
}

interface ProductSelectorProps {
  onSelect: (product: ProductItem) => void;
  onClose: () => void;
}

export default function ProductSelector({ onSelect, onClose }: ProductSelectorProps) {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, [search]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      params.set('isActive', 'true');
      
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

  const handleSelect = (product: ProductItem) => {
    onSelect(product);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Package className="w-5 h-5" />
            从商品库选择
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索商品名称、SKU、HS Code..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              data-testid="document-product-picker"
              autoFocus
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="text-center py-8 text-gray-500">加载中...</div>
          ) : products.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">
                {search ? '没有找到匹配的商品' : '还没有添加商品'}
              </p>
              <p className="text-sm text-gray-400">
                请先在 <a href="/workspace/products" className="text-blue-600 hover:underline" target="_blank">商品资料库</a> 中添加商品
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {products.map((product) => (
                <button
                  key={product.id}
                  onClick={() => handleSelect(product)}
                  data-testid="document-product-option"
                  className="w-full text-left p-3 border rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{product.name}</div>
                      {product.sku && (
                        <div className="text-xs text-gray-500 mt-1">SKU: {product.sku}</div>
                      )}
                      {product.description && (
                        <div className="text-sm text-gray-600 mt-1 line-clamp-2">{product.description}</div>
                      )}
                      <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                        {product.hsCode && <span>HS: {product.hsCode}</span>}
                        {product.unitPrice && (
                          <span>{product.currency || 'USD'} {product.unitPrice}/{product.unit || 'PCS'}</span>
                        )}
                        {product.netWeight && <span>净重: {product.netWeight} KG</span>}
                        {product.originCountry && <span>产地: {product.originCountry}</span>}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
