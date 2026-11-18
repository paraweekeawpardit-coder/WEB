import { useReducer } from 'react'

// ตะกร้า: [{ menuId, name, price, qty }]
function reducer(items, action) {
  switch (action.type) {
    case 'add': {
      const { menu, qty } = action
      const found = items.find((i) => i.menuId === menu.id)
      if (found) {
        return items.map((i) => (i.menuId === menu.id ? { ...i, qty: i.qty + qty } : i))
      }
      return [...items, { menuId: menu.id, name: menu.name, price: menu.price, qty }]
    }
    case 'setQty':
      return items.map((i) => (i.menuId === action.menuId ? { ...i, qty: Math.max(1, action.qty) } : i))
    case 'remove':
      return items.filter((i) => i.menuId !== action.menuId)
    case 'clear':
      return []
    default:
      return items
  }
}

export default function useCart() {
  const [items, dispatch] = useReducer(reducer, [])
  return {
    items,
    count: items.reduce((s, i) => s + i.qty, 0),
    add: (menu, qty = 1) => dispatch({ type: 'add', menu, qty }),
    setQty: (menuId, qty) => dispatch({ type: 'setQty', menuId, qty }),
    remove: (menuId) => dispatch({ type: 'remove', menuId }),
    clear: () => dispatch({ type: 'clear' }),
  }
}