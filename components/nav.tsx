import Link from 'next/link'

export function Nav() {
  return (
    <nav className="navbar bg-base-100 border-b border-base-200 px-4">
      <div className="navbar-start">
        <Link href="/" className="text-xl font-bold">
          Article CMS
        </Link>
      </div>
      <div className="navbar-end gap-2">
        {/* Students: add navigation links here during Session 2 */}
      </div>
    </nav>
  )
}
