'use client';

import React, { useState, useMemo } from 'react';
import TopNav from '@/components/ui/TopNav'



/* ================= TYPES ================= */

type Product = {
  id: number;
  brand: string;
  model: string;
  variants: string[];
  engine: string;
  type: string;
  fuel: string;
  price: number;
};

/* ================= DATA ================= */

const PRODUCTS: Product[] = [
  {
    id: 1,
    brand: 'Hero MotoCorp',
    model: 'Splendor+',
    variants: ['Standard', 'XTEC', 'Black Edition'],
    engine: '97.2',
    type: 'Commuter',
    fuel: 'ICE',
    price: 75000,
  },
  {
    id: 2,
    brand: 'Hero MotoCorp',
    model: 'HF Deluxe',
    variants: ['Kick Start', 'Self Start', 'Drum', 'Disc'],
    engine: '97.2',
    type: 'Budget commuter',
    fuel: 'ICE',
    price: 72000,
  },
  {
    id: 3,
    brand: 'Honda',
    model: 'Activa 6G / 7G',
    variants: ['Standard', 'Deluxe', 'H-Smart'],
    engine: '109.5',
    type: 'Scooter',
    fuel: 'ICE',
    price: 82000,
  },
  {
    id: 4,
    brand: 'TVS Motor',
    model: 'Ntorq 125',
    variants: ['Drum', 'Disc', 'Race Edition', 'XT'],
    engine: '124.8',
    type: 'Sporty scooter',
    fuel: 'ICE',
    price: 95000,
  },
  {
    id: 5,
    brand: 'Royal Enfield',
    model: 'Classic 350',
    variants: ['Redditch', 'Halcyon', 'Chrome', 'Stealth'],
    engine: '349',
    type: 'Cruiser',
    fuel: 'ICE',
    price: 190000,
  },
  {
    id: 6,
    brand: 'Yamaha',
    model: 'R15 V4',
    variants: ['Standard', 'M', 'MotoGP Edition'],
    engine: '155',
    type: 'Supersport',
    fuel: 'ICE',
    price: 180000,
  },
  {
    id: 7,
    brand: 'Suzuki',
    model: 'Access 125',
    variants: ['Drum', 'Disc', 'Special Edition'],
    engine: '124',
    type: 'Scooter',
    fuel: 'ICE',
    price: 83000,
  },
];

/* ================= PAGE ================= */

export default function BuyersDashboard() {
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [variant, setVariant] = useState('');
  const [budget, setBudget] = useState('');
  const [fuelType, setFuelType] = useState('');
  const [sortPrice, setSortPrice] = useState('');



  /* ================= FILTER OPTIONS ================= */

  const brands = useMemo(
    () => [...new Set(PRODUCTS.map((p: Product) => p.brand))],
    []
  );

  const models = useMemo(
    () => PRODUCTS.filter((p: Product) => !brand || p.brand === brand),
    [brand]
  );

  const modelOptions = useMemo(
    () => [...new Set(models.map((p: Product) => p.model))],
    [models]
  );

  const variantOptions = useMemo(() => {
    const found = PRODUCTS.find(
      (p: Product) => p.brand === brand && p.model === model
    );
    return found ? found.variants : [];
  }, [brand, model]);

  /* ================= FILTERED PRODUCTS ================= */

  const filteredProducts = useMemo(() => {
    return PRODUCTS
      .filter(
        (p: Product) =>
          (!brand || p.brand === brand) &&
          (!model || p.model === model) &&
          (!variant || p.variants.includes(variant)) &&
          (!fuelType || p.fuel === fuelType) &&
          (!budget ||
            (budget === 'Below 1L'
              ? p.price < 100000
              : budget === '1L - 1.5L'
                ? p.price >= 100000 && p.price <= 150000
                : p.price > 150000))
      )
      .sort((a: Product, b: Product) => {
        if (sortPrice === 'Low-High') return a.price - b.price;
        if (sortPrice === 'High-Low') return b.price - a.price;
        return 0;
      });
  }, [brand, model, variant, fuelType, budget, sortPrice]);
  const estimateFuelCost = (model: Product, yearlyKm: number) => {
    if (model.fuel === 'ICE') {
      return yearlyKm * 0.04 * 100; // rough logic
    } else {
      return yearlyKm * 0.01 * 20;
    }
  };

  const generateInsights = (models: Product[]) => {
    const insights: string[] = [];

    if (models.length < 2) return insights;

    const lowestPrice = Math.min(...models.map(m => m.price));
    const cheapest = models.find(m => m.price === lowestPrice);

    insights.push(
      `${cheapest?.model} is the most cost-effective option at ₹${lowestPrice.toLocaleString()}.`
    );

    const highestEngine = Math.max(...models.map(m => Number(m.engine)));
    const powerful = models.find(m => Number(m.engine) === highestEngine);

    insights.push(
      `${powerful?.model} offers the highest engine capacity (${highestEngine} cc), suitable for performance-oriented usage.`
    );

    return insights;
  };

  /* ================= RFQ BASKET ================= */

  const [rfqBasket, setRfqBasket] = useState<Product[]>([]);
  const [compareList, setCompareList] = useState<Product[]>([]);
  const addToRFQ = (product: Product) => {
    setRfqBasket(prev =>
      prev.find(p => p.id === product.id) ? prev : [...prev, product]
    );
  };

  const removeFromRFQ = (id: number) => {
    setRfqBasket(prev => prev.filter(p => p.id !== id));
  };




  /* ================= UI ================= */

  return (
  <div className="min-h-screen bg-gray-50">
    <TopNav />

    <div className="p-8">

      {/* PAGE HEADING */}
      <h1 className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
        Explore OEM Products & Catalogue
      </h1>
      <p className="text-gray-500 mt-2 text-sm">
        Filter, compare and create RFQs seamlessly.
      </p>

      {/* AI INSIGHTS (ONLY IF 2+ SELECTED) */}
      {compareList.length >= 2 && (
        <div className="bg-indigo-50 p-4 rounded-lg mt-6">
          <h3 className="font-semibold mb-2">AI Procurement Insights</h3>
          {generateInsights(compareList).map((insight, i) => (
            <div key={i} className="text-sm text-gray-700 mb-1">
              • {insight}
            </div>
          ))}
        </div>
      )}

      {/* FILTERS */}
      <section className="mt-6">
        <div className="bg-white p-4 rounded shadow grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
          <select
            className="border p-2 rounded"
            value={brand}
            onChange={e => {
              setBrand(e.target.value);
              setModel('');
              setVariant('');
            }}
          >
            <option value="">Brand</option>
            {brands.map(b => (
              <option key={b}>{b}</option>
            ))}
          </select>

          <select
            className="border p-2 rounded"
            value={model}
            onChange={e => {
              setModel(e.target.value);
              setVariant('');
            }}
            disabled={!brand}
          >
            <option value="">Model</option>
            {modelOptions.map(m => (
              <option key={m}>{m}</option>
            ))}
          </select>

          <select
            className="border p-2 rounded"
            value={variant}
            onChange={e => setVariant(e.target.value)}
            disabled={!model}
          >
            <option value="">Variant</option>
            {variantOptions.map(v => (
              <option key={v}>{v}</option>
            ))}
          </select>

          <select
            className="border p-2 rounded"
            value={budget}
            onChange={e => setBudget(e.target.value)}
          >
            <option value="">Budget</option>
            <option>Below 1L</option>
            <option>1L - 1.5L</option>
            <option>Above 1.5L</option>
          </select>

          <select
            className="border p-2 rounded"
            value={fuelType}
            onChange={e => setFuelType(e.target.value)}
          >
            <option value="">Fuel</option>
            <option>ICE</option>
            <option>EV</option>
          </select>

          <select
            className="border p-2 rounded"
            value={sortPrice}
            onChange={e => setSortPrice(e.target.value)}
          >
            <option value="">Sort</option>
            <option>Low-High</option>
            <option>High-Low</option>
          </select>
        </div>
      </section>

      {/* PRODUCT GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredProducts.map(p => (
          <div key={p.id} className="bg-white rounded-xl shadow p-5">
            <h3 className="font-bold text-lg">{p.model}</h3>
            <p className="text-sm text-gray-600">
              {p.brand} • {p.type}
            </p>
            <p className="text-xs text-gray-500">Engine: {p.engine} cc</p>
            <p className="text-xl font-semibold mt-2">
              ₹{p.price.toLocaleString()}
            </p>

            <button
              onClick={() => addToRFQ(p)}
              className="mt-4 w-full border border-blue-600 text-blue-600 py-2 rounded"
            >
              Add to RFQ
            </button>

            <button
              onClick={() => {
                if (compareList.find(x => x.id === p.id)) return;
                if (compareList.length >= 3) return;
                setCompareList(prev => [...prev, p]);
              }}
              className="mt-2 w-full border border-purple-600 text-purple-600 py-2 rounded"
            >
              Compare
            </button>
          </div>
        ))}
      </div>

      {/* SELECTED FOR COMPARISON (OUTSIDE GRID) */}
      {compareList.length > 0 && (
        <div className="mt-8 bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-2">Selected for Comparison</h3>

          {compareList.map(item => (
            <div key={item.id} className="flex justify-between text-sm">
              {item.brand} – {item.model}
              <button
                onClick={() =>
                  setCompareList(prev =>
                    prev.filter(x => x.id !== item.id)
                  )
                }
                className="text-red-500"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      {/* RFQ BASKET */}
      <section className="mt-8 bg-white p-6 border-t">
        <h2 className="text-xl font-bold mb-4">RFQ Basket</h2>

        {rfqBasket.length === 0 ? (
          <p className="text-gray-500">No products added yet.</p>
        ) : (
          <div className="space-y-3">
            {rfqBasket.map(item => (
              <div
                key={item.id}
                className="flex justify-between items-center border p-3 rounded"
              >
                <div>
                  <p className="font-semibold">
                    {item.brand} – {item.model}
                  </p>
                  <p className="text-sm text-gray-500">
                    ₹{item.price.toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => removeFromRFQ(item.id)}
                  className="text-red-600 text-sm"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  </div>
);
}