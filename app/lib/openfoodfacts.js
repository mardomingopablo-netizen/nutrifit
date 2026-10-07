// Integración con Open Food Facts (base de datos abierta de productos).
// Devuelve alimentos en el mismo formato que FOODS_DB (valores por 100g).

const round1 = (v) => (v || v === 0) ? Math.round(Number(v) * 10) / 10 : 0

function mapProduct(p, code) {
  const n = p.nutriments || {}
  // kcal por 100g: usa energy-kcal_100g; si no, convierte desde kJ.
  let cal = n['energy-kcal_100g']
  if (cal == null && n['energy_100g'] != null) cal = n['energy_100g'] / 4.184
  if (cal == null) return null // sin datos nutricionales útiles

  const brand = (p.brands || '').split(',')[0].trim()
  const base = p.product_name || p.generic_name || 'Producto'
  const name = (brand && !base.toLowerCase().includes(brand.toLowerCase()))
    ? `${base} · ${brand}`
    : base

  return {
    id: 'off_' + (code || p.code || Math.random().toString(36).slice(2)),
    name: name.slice(0, 70),
    category: 'prepared',
    cal: Math.round(cal),
    protein: round1(n.proteins_100g),
    carbs: round1(n.carbohydrates_100g),
    fat: round1(n.fat_100g),
    fiber: round1(n.fiber_100g),
    source: 'off',
    image: p.image_front_small_url || null,
  }
}

// Busca un producto por código de barras. Devuelve el alimento o null.
export async function lookupBarcode(code) {
  const clean = String(code).replace(/\D/g, '')
  if (!clean) return null
  const url = `https://world.openfoodfacts.org/api/v2/product/${clean}.json?fields=product_name,generic_name,brands,nutriments,image_front_small_url,code`
  const res = await fetch(url)
  if (!res.ok) return null
  const data = await res.json()
  if (data.status !== 1 || !data.product) return null
  return mapProduct(data.product, clean)
}

// Busca productos por nombre. Devuelve una lista de alimentos.
export async function searchProducts(query) {
  const q = (query || '').trim()
  if (q.length < 2) return []
  const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(q)}&search_simple=1&action=process&json=1&page_size=25&fields=product_name,generic_name,brands,nutriments,image_front_small_url,code`
  const res = await fetch(url)
  if (!res.ok) return []
  const data = await res.json()
  return (data.products || []).map(p => mapProduct(p, p.code)).filter(Boolean)
}
