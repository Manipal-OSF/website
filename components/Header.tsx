const Header = () => {
  return (
    <header className="flex flex-row justify-between">
      <span>Icon here</span>
      <nav>
        <ul className="grid grid-flow-col gap-5">
          <li>
            <a className="link link-hover" href="#">Home</a>
          </li>
          <li>
            <a className="link link-hover" href="#">Syllabus content</a>
          </li>
        </ul>
      </nav>
    </header>
  )
}

export default Header;
