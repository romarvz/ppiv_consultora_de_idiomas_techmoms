import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Header from '../../components/layout/Header'

// Mock de window.scrollTo
const mockScrollTo = vi.fn()
window.scrollTo = mockScrollTo

// Mock de document.getElementById
const mockGetElementById = vi.fn()
document.getElementById = mockGetElementById

const renderHeader = (initialPath = '/', theme = 'light') => {
  const toggleTheme = vi.fn()
  
  return {
    ...render(
      <MemoryRouter initialEntries={[initialPath]}>
        <Header theme={theme} toggleTheme={toggleTheme} />
      </MemoryRouter>
    ),
    toggleTheme,
  }
}

describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockScrollTo.mockClear()
    mockGetElementById.mockReturnValue({
      scrollIntoView: vi.fn(),
    })
  })

  it('debe renderizar el logo y el nombre de la empresa', () => {
    renderHeader()
    
    expect(screen.getByText('Lingua Academy')).toBeInTheDocument()
    expect(screen.getByAltText('Logo')).toBeInTheDocument()
  })

  it('debe renderizar todos los enlaces de navegación', () => {
    renderHeader()
    
    expect(screen.getByText('Nosotros')).toBeInTheDocument()
    expect(screen.getByText('Servicios')).toBeInTheDocument()
    expect(screen.getByText('Clientes')).toBeInTheDocument()
    expect(screen.getByText('Demo')).toBeInTheDocument()
    expect(screen.getByText('Contacto')).toBeInTheDocument()
  })

  it('debe mostrar el botón de login cuando no está en la página de login', () => {
    renderHeader('/')
    
    expect(screen.getByText('Iniciar Sesión')).toBeInTheDocument()
  })

  it('debe ocultar el botón de login en la página de login', () => {
    renderHeader('/login')
    
    expect(screen.queryByText('Iniciar Sesión')).not.toBeInTheDocument()
  })

  it('debe mostrar el botón de cambio de tema', () => {
    renderHeader('/', 'light')
    
    const themeButton = screen.getByRole('button', { name: /🌙|☀️/ })
    expect(themeButton).toBeInTheDocument()
  })

  it('debe llamar toggleTheme cuando se hace clic en el botón de tema', async () => {
    const user = userEvent.setup()
    const { toggleTheme } = renderHeader('/', 'light')
    
    const themeButton = screen.getByRole('button', { name: /🌙/ })
    await user.click(themeButton)

    expect(toggleTheme).toHaveBeenCalledTimes(1)
  })

  it('debe mostrar el menú hamburguesa en móvil', () => {
    renderHeader()
    
    const menuToggle = screen.getByRole('button', { name: /☰/ })
    expect(menuToggle).toBeInTheDocument()
  })

  it('debe abrir/cerrar el menú móvil cuando se hace clic en el botón hamburguesa', async () => {
    const user = userEvent.setup()
    renderHeader()
    
    const menuToggle = screen.getByRole('button', { name: /☰/ })
    const navLinks = document.querySelector('.nav-links')
    
    expect(navLinks).not.toHaveClass('active')
    
    await user.click(menuToggle)
    
    expect(navLinks).toHaveClass('active')
  })

  it('debe mostrar el dropdown de servicios al hacer hover', async () => {
    const user = userEvent.setup()
    renderHeader()
    
    const serviciosLink = screen.getByText('Servicios')
    const dropdown = document.querySelector('.dropdown-menu')
    
    expect(dropdown).not.toHaveClass('show')
    
    await user.hover(serviciosLink)
    
    expect(dropdown).toHaveClass('show')
  })

  it('debe navegar a /cursos cuando se hace clic en "Ver Todos los Cursos"', async () => {
    const user = userEvent.setup()
    renderHeader()
    
    const serviciosLink = screen.getByText('Servicios')
    await user.hover(serviciosLink)
    
    const cursosLink = screen.getByText('Ver Todos los Cursos')
    await user.click(cursosLink)
    
    // Verificar que el enlace tiene la ruta correcta
    expect(cursosLink.closest('a')).toHaveAttribute('href', '/cursos')
  })
})

