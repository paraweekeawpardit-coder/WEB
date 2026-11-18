export default function WelcomeHeader({ table }) {
  return (
    <header className="slip-head">
      <p className="shop">ยินดีต้อนรับสู่ร้านสุกี้</p>
      <h1>{table ? `โต๊ะ ${table}` : 'เริ่มสั่งอาหาร'}</h1>
    </header>
  )
}
