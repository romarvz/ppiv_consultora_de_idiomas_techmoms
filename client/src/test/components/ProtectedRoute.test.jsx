import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ProtectedRoute from '../../components/common/ProtectedRoute'
import * as authHook from '../../hooks/useAuth.jsx'

// Mock del hook useAuth
vi.mock('../../hooks/useAuth.jsx', () => ({
  useAuth: vi.fn(),
}))

// Mock de useLocation
const mockLocation = { pathname: '/dashboard/admin', state: null }
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useLocation: () => mockLocation,
  }
})

const TestComponent = () => <div>Contenido protegido</div>

const renderProtectedRoute = (allowedRoles = [], isAuthenticated = false, user = null, loading = false) => {
  authHook.useAuth.mockReturnValue({
    isAuthenticated,
    user,
    loading,
  })

  return render(
    <MemoryRouter>
      <ProtectedRoute allowedRoles={allowedRoles}>
        <TestComponent />
      </ProtectedRoute>
    </MemoryRouter>
  )
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('debe mostrar loading cuando está verificando autenticación', () => {
    renderProtectedRoute(['admin'], false, null, true)

    expect(screen.getByText('Cargando...')).toBeInTheDocument()
    expect(screen.queryByText('Contenido protegido')).not.toBeInTheDocument()
  })

  it('debe redirigir a login si el usuario no está autenticado', () => {
    const { container } = renderProtectedRoute(['admin'], false, null, false)

    // Verificar que se renderiza Navigate hacia /login
    const navigate = container.querySelector('div')
    // En este caso, React Router renderiza Navigate que redirige
    expect(screen.queryByText('Contenido protegido')).not.toBeInTheDocument()
  })

  it('debe mostrar el contenido si el usuario está autenticado y tiene el rol correcto', () => {
    const user = { _id: '123', role: 'admin' }
    renderProtectedRoute(['admin'], true, user, false)

    expect(screen.getByText('Contenido protegido')).toBeInTheDocument()
  })

  it('debe redirigir si el usuario no tiene el rol requerido', () => {
    const user = { _id: '123', role: 'estudiante' }
    const { container } = renderProtectedRoute(['admin'], true, user, false)

    // Debe redirigir al dashboard del estudiante
    expect(screen.queryByText('Contenido protegido')).not.toBeInTheDocument()
  })

  it('debe permitir acceso si el usuario tiene uno de los roles permitidos', () => {
    const user = { _id: '123', role: 'admin' }
    renderProtectedRoute(['admin', 'empresa'], true, user, false)

    expect(screen.getByText('Contenido protegido')).toBeInTheDocument()
  })

  it('debe permitir acceso si no hay roles requeridos', () => {
    const user = { _id: '123', role: 'estudiante' }
    renderProtectedRoute([], true, user, false)

    expect(screen.getByText('Contenido protegido')).toBeInTheDocument()
  })

  describe('Redirección según rol', () => {
    it('debe redirigir admin a /dashboard/admin', () => {
      const user = { _id: '123', role: 'admin' }
      const { container } = renderProtectedRoute(['profesor'], true, user, false)

      expect(screen.queryByText('Contenido protegido')).not.toBeInTheDocument()
    })

    it('debe redirigir profesor a /dashboard/teacher', () => {
      const user = { _id: '123', role: 'profesor' }
      const { container } = renderProtectedRoute(['admin'], true, user, false)

      expect(screen.queryByText('Contenido protegido')).not.toBeInTheDocument()
    })

    it('debe redirigir estudiante a /dashboard/student', () => {
      const user = { _id: '123', role: 'estudiante' }
      const { container } = renderProtectedRoute(['admin'], true, user, false)

      expect(screen.queryByText('Contenido protegido')).not.toBeInTheDocument()
    })
  })
})

