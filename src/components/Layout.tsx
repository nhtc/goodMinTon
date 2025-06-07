import React from "react"

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div>
      <header>
        <h1>Badminton Manager</h1>
        <nav>
          <ul>
            <li>
              <a href='/'>Home</a>
            </li>
            <li>
              <a href='/members'>Members</a>
            </li>
            <li>
              <a href='/history'>History</a>
            </li>
            <li>
              <a href='/login'>Login</a>
            </li>
          </ul>
        </nav>
      </header>
      <main className='h-[100vh]'>{children}</main>
      <footer>
        <p>&copy; {new Date().getFullYear()} Badminton Manager</p>
      </footer>
    </div>
  )
}

export default Layout
