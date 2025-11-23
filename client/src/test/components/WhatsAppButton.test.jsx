import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import WhatsAppButton from '../../components/common/WhatsAppButton'

// Mock de window.open
const mockWindowOpen = vi.fn()
window.open = mockWindowOpen

describe('WhatsAppButton', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('debe renderizar el botón de WhatsApp', () => {
    render(<WhatsAppButton />)
    
    const button = screen.getByRole('button', { name: /contactar por whatsapp/i })
    expect(button).toBeInTheDocument()
  })

  it('debe abrir WhatsApp cuando se hace clic en el botón', async () => {
    const user = userEvent.setup()
    render(<WhatsAppButton />)
    
    const button = screen.getByRole('button', { name: /contactar por whatsapp/i })
    await user.click(button)

    expect(mockWindowOpen).toHaveBeenCalledTimes(1)
    expect(mockWindowOpen).toHaveBeenCalledWith(
      expect.stringContaining('wa.me/5491121836922'),
      '_blank'
    )
  })

  it('debe incluir el mensaje predefinido en la URL', async () => {
    const user = userEvent.setup()
    render(<WhatsAppButton />)
    
    const button = screen.getByRole('button', { name: /contactar por whatsapp/i })
    await user.click(button)

    const callArgs = mockWindowOpen.mock.calls[0][0]
    expect(callArgs).toContain('text=')
    expect(decodeURIComponent(callArgs)).toContain('Hola! Me interesa conocer más sobre los servicios que ofrecen.')
  })

  it('debe tener el atributo title correcto', () => {
    render(<WhatsAppButton />)
    
    const button = screen.getByRole('button', { name: /contactar por whatsapp/i })
    expect(button).toHaveAttribute('title', 'Contactar por WhatsApp')
  })

  it('debe contener el SVG de WhatsApp', () => {
    const { container } = render(<WhatsAppButton />)
    
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
    expect(svg).toHaveAttribute('viewBox', '0 0 24 24')
  })
})

