import { useEffect, useState } from 'react'
import { api } from '../../services/api'

const ICON = {
  beef: '🥩',
  pork: '🍖',
  seafood: '🦐',
  veggie: '🥬',
  meatball: '🍢',
  soup: '🍲',
  drink: '🥤',
}

// แสดงเมนูของร้านจากระบบกลาง (db.json) เฉพาะรายการที่ยังมีของ
export default function FeaturedFoods({ limit = 4 }) {
  const [foods, setFoods] = useState([])
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    let alive = true
    api
      .getMenus()
      .then((data) => {
        if (!alive) return
        setFoods(data.filter((m) => m.available).slice(0, limit))
        setStatus('done')
      })
      .catch(() => alive && setStatus('error'))
    return () => {
      alive = false
    }
  }, [limit])

  if (status === 'loading') return <p className="or">กำลังโหลดเมนู...</p>
  if (status === 'error' || foods.length === 0) return null

  return (
    <section className="featured" aria-label="เมนูแนะนำ">
      <p className="or">เมนูแนะนำของร้าน</p>
      <ul className="featured-list">
        {foods.map((f) => (
          <li key={f.id}>
            {f.image ? (
              <img src={f.image} alt={f.name} loading="lazy" />
            ) : (
              <span className="featured-icon" aria-hidden="true">
                {ICON[f.category] ?? '🍽️'}
              </span>
            )}
            <span>{f.name}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}