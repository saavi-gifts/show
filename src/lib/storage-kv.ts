import { kv } from '@vercel/kv'
import { Gift } from '@/types/gift'

const GIFTS_KEY = 'gifts'
const GIFT_ID_KEY = 'gift_id_counter'

export const kvStorage = {
  // Read all gifts
  getGifts: async (): Promise<Gift[]> => {
    try {
      const gifts = await kv.get<Gift[]>(GIFTS_KEY)
      return gifts || []
    } catch (error) {
      console.error('Error reading gifts from KV:', error)
      return []
    }
  },

  // Save gifts to KV
  saveGifts: async (gifts: Gift[]): Promise<void> => {
    try {
      await kv.set(GIFTS_KEY, gifts)
    } catch (error) {
      console.error('Error saving gifts to KV:', error)
      throw new Error('Failed to save gifts')
    }
  },

  // Get gift by ID
  getGiftById: async (id: string): Promise<Gift | null> => {
    const gifts = await kvStorage.getGifts()
    return gifts.find(gift => gift.id === id) || null
  },

  // Add new gift
  addGift: async (giftData: Omit<Gift, 'id' | 'createdAt' | 'updatedAt'>): Promise<Gift> => {
    const gifts = await kvStorage.getGifts()
    
    // Generate unique ID
    let counter = await kv.get<number>(GIFT_ID_KEY) || Date.now()
    counter += 1
    await kv.set(GIFT_ID_KEY, counter)
    
    const newGift: Gift = {
      ...giftData,
      id: counter.toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    gifts.push(newGift)
    await kvStorage.saveGifts(gifts)
    return newGift
  },

  // Update existing gift
  updateGift: async (id: string, giftData: Partial<Omit<Gift, 'id' | 'createdAt'>>): Promise<Gift | null> => {
    const gifts = await kvStorage.getGifts()
    const index = gifts.findIndex(gift => gift.id === id)
    
    if (index === -1) {
      return null
    }

    gifts[index] = {
      ...gifts[index],
      ...giftData,
      updatedAt: new Date()
    }
    
    await kvStorage.saveGifts(gifts)
    return gifts[index]
  },

  // Delete gift
  deleteGift: async (id: string): Promise<boolean> => {
    const gifts = await kvStorage.getGifts()
    const index = gifts.findIndex(gift => gift.id === id)
    
    if (index === -1) {
      return false
    }

    gifts.splice(index, 1)
    await kvStorage.saveGifts(gifts)
    return true
  }
}