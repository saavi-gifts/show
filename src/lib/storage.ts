import fs from 'fs'
import path from 'path'
import { Gift } from '@/types/gift'
import { kvStorage } from './storage-kv'
import { dbStorage } from './storage-db'

// Determine storage type based on environment variables
const useDatabase = process.env.USE_DB === 'true'
const useKV = !useDatabase && (process.env.VERCEL || process.env.KV_URL)

console.log(`Storage mode: ${useDatabase ? 'Database' : useKV ? 'KV' : 'File System'}`)

// File system storage (fallback for local development)
const DATA_DIR = path.join(process.cwd(), 'data')
const GIFTS_FILE = path.join(DATA_DIR, 'gifts.json')

// Ensure data directory exists (only for local development)
if (!useKV && !useDatabase && !fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true })
}

// Initialize gifts file if it doesn't exist (only for local development)
if (!useKV && !useDatabase && !fs.existsSync(GIFTS_FILE)) {
  fs.writeFileSync(GIFTS_FILE, JSON.stringify([], null, 2))
}

// File system storage implementation (async for consistency)
const fileStorage = {
  getGifts: async (): Promise<Gift[]> => {
    try {
      const data = fs.readFileSync(GIFTS_FILE, 'utf-8')
      return JSON.parse(data)
    } catch (error) {
      console.error('Error reading gifts file:', error)
      return []
    }
  },

  saveGifts: async (gifts: Gift[]): Promise<void> => {
    try {
      fs.writeFileSync(GIFTS_FILE, JSON.stringify(gifts, null, 2))
    } catch (error) {
      console.error('Error saving gifts file:', error)
      throw new Error('Failed to save gifts')
    }
  },

  getGiftById: async (id: string): Promise<Gift | null> => {
    const gifts = await fileStorage.getGifts()
    return gifts.find(gift => gift.id === id) || null
  },

  addGift: async (giftData: Omit<Gift, 'id' | 'createdAt' | 'updatedAt'>): Promise<Gift> => {
    const gifts = await fileStorage.getGifts()
    const newGift: Gift = {
      ...giftData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    }
    gifts.push(newGift)
    await fileStorage.saveGifts(gifts)
    return newGift
  },

  updateGift: async (id: string, giftData: Partial<Omit<Gift, 'id' | 'createdAt'>>): Promise<Gift | null> => {
    const gifts = await fileStorage.getGifts()
    const index = gifts.findIndex(gift => gift.id === id)
    
    if (index === -1) {
      return null
    }

    gifts[index] = {
      ...gifts[index],
      ...giftData,
      updatedAt: new Date()
    }
    
    await fileStorage.saveGifts(gifts)
    return gifts[index]
  },

  deleteGift: async (id: string): Promise<boolean> => {
    const gifts = await fileStorage.getGifts()
    const index = gifts.findIndex(gift => gift.id === id)
    
    if (index === -1) {
      return false
    }

    gifts.splice(index, 1)
    await fileStorage.saveGifts(gifts)
    return true
  }
}

// Export the appropriate storage implementation
export const storage = useDatabase ? dbStorage : useKV ? kvStorage : fileStorage