export interface GadgetInfo {
  name: string
  description: string
  route: string
  available: boolean
  icon: string
}

export const gadgetList: GadgetInfo[] = [
  { name: 'QR Scanner', description: 'Scan QR codes from images, clipboard, or URLs', route: '/qr-scanner', available: true, icon: 'i-tabler-qrcode' },
]