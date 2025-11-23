import { describe, it, expect } from 'vitest'
import { formatDate, formatCurrency } from '../../utils/formatting'

describe('formatDate', () => {
  it('debe formatear una fecha correctamente', () => {
    const dateString = '2024-01-15T00:00:00.000Z'
    const formatted = formatDate(dateString)
    
    expect(formatted).toBe('15/01/2024')
  })

  it('debe manejar diferentes formatos de fecha', () => {
    const dateString = '2024-12-25T10:30:00.000Z'
    const formatted = formatDate(dateString)
    
    expect(formatted).toBe('25/12/2024')
  })

  it('debe retornar string vacío si la fecha es null', () => {
    const formatted = formatDate(null)
    
    expect(formatted).toBe('')
  })

  it('debe retornar string vacío si la fecha es undefined', () => {
    const formatted = formatDate(undefined)
    
    expect(formatted).toBe('')
  })

  it('debe retornar string vacío si la fecha es string vacío', () => {
    const formatted = formatDate('')
    
    expect(formatted).toBe('')
  })

  it('debe formatear fechas con un solo dígito en día y mes', () => {
    const dateString = '2024-01-05T00:00:00.000Z'
    const formatted = formatDate(dateString)
    
    expect(formatted).toBe('05/01/2024')
  })
})

describe('formatCurrency', () => {
  it('debe formatear un número como moneda', () => {
    const formatted = formatCurrency(1234.56)
    
    expect(formatted).toBe('1.234,56')
  })

  it('debe formatear números enteros con decimales', () => {
    const formatted = formatCurrency(1000)
    
    expect(formatted).toBe('1.000,00')
  })

  it('debe formatear números grandes con separadores de miles', () => {
    const formatted = formatCurrency(1234567.89)
    
    expect(formatted).toBe('1.234.567,89')
  })

  it('debe manejar números negativos', () => {
    const formatted = formatCurrency(-1234.56)
    
    expect(formatted).toBe('-1.234,56')
  })

  it('debe manejar cero', () => {
    const formatted = formatCurrency(0)
    
    expect(formatted).toBe('0,00')
  })

  it('debe retornar "0,00" si el valor no es un número', () => {
    expect(formatCurrency('not a number')).toBe('0,00')
    expect(formatCurrency(null)).toBe('0,00')
    expect(formatCurrency(undefined)).toBe('0,00')
    expect(formatCurrency('123')).toBe('0,00')
  })

  it('debe formatear números con muchos decimales correctamente', () => {
    const formatted = formatCurrency(1234.56789)
    
    // Debe redondear a 2 decimales
    expect(formatted).toBe('1.234,57')
  })

  it('debe formatear números muy pequeños', () => {
    const formatted = formatCurrency(0.01)
    
    expect(formatted).toBe('0,01')
  })
})

