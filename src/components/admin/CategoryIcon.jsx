import { Beef, CircleDot, CupSoda, Fish, Ham, Salad, Soup, UtensilsCrossed } from 'lucide-react'

// ไอคอน Lucide ประจำหมวดหมู่ (ใช้เมื่อเมนูยังไม่มีรูป)
const MAP = {
  beef: Beef,
  pork: Ham,
  seafood: Fish,
  veggie: Salad,
  meatball: CircleDot,
  soup: Soup,
  drink: CupSoda,
}

export default function CategoryIcon({ category, ...props }) {
  const Icon = MAP[category] ?? UtensilsCrossed
  return <Icon aria-hidden="true" {...props} />
}
