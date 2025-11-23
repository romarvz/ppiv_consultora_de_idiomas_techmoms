import { describe, it, expect } from 'vitest'
import { routes, publicRoutes, protectedRoutes } from '../../utils/routes'

describe('routes', () => {
  it('debe tener todas las rutas públicas definidas', () => {
    expect(routes.HOME).toBe('/')
    expect(routes.ABOUT).toBe('/about')
    expect(routes.SERVICES).toBe('/services')
    expect(routes.COURSES).toBe('/cursos')
    expect(routes.CLIENTS).toBe('/clients')
    expect(routes.DEMO).toBe('/demo')
    expect(routes.CONTACT).toBe('/contact')
    expect(routes.LOGIN).toBe('/login')
  })

  it('debe tener todas las rutas de dashboard definidas', () => {
    expect(routes.DASHBOARD.ADMIN).toBe('/dashboard/admin')
    expect(routes.DASHBOARD.STUDENT).toBe('/dashboard/student')
    expect(routes.DASHBOARD.TEACHER).toBe('/dashboard/teacher')
    expect(routes.DASHBOARD.COMPANY).toBe('/dashboard/company')
    expect(routes.DASHBOARD.FINANCIAL).toBe('/dashboard/admin/financial')
  })
})

describe('publicRoutes', () => {
  it('debe contener todas las rutas públicas', () => {
    expect(publicRoutes).toContain(routes.HOME)
    expect(publicRoutes).toContain(routes.ABOUT)
    expect(publicRoutes).toContain(routes.SERVICES)
    expect(publicRoutes).toContain(routes.COURSES)
    expect(publicRoutes).toContain(routes.CLIENTS)
    expect(publicRoutes).toContain(routes.DEMO)
    expect(publicRoutes).toContain(routes.CONTACT)
    expect(publicRoutes).toContain(routes.LOGIN)
  })

  it('debe ser un array', () => {
    expect(Array.isArray(publicRoutes)).toBe(true)
  })
})

describe('protectedRoutes', () => {
  it('debe contener todas las rutas protegidas', () => {
    expect(protectedRoutes).toContain(routes.DASHBOARD.ADMIN)
    expect(protectedRoutes).toContain(routes.DASHBOARD.STUDENT)
    expect(protectedRoutes).toContain(routes.DASHBOARD.TEACHER)
    expect(protectedRoutes).toContain(routes.DASHBOARD.COMPANY)
  })

  it('debe ser un array', () => {
    expect(Array.isArray(protectedRoutes)).toBe(true)
  })

  it('no debe contener rutas públicas', () => {
    expect(protectedRoutes).not.toContain(routes.HOME)
    expect(protectedRoutes).not.toContain(routes.LOGIN)
  })
})

