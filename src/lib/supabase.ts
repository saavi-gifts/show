import { createClient } from '@supabase/supabase-js'
import { Gift } from '@/types/gift'

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY

// Only create client if credentials are available
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null

export const supabaseStorage = {
  // Read all gifts
  getGifts: async (): Promise<Gift[]> => {
    if (!supabase) {
      throw new Error('Supabase client not initialized. Please set SUPABASE_URL and SUPABASE_ANON_KEY environment variables.')
    }
    
    try {
      const { data, error } = await supabase
        .from('gifts')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      return data.map(row => ({
        id: row.id,
        name: row.name,
        description: row.description || undefined,
        category: row.category,
        priceRangeMin: row.price_range_min || undefined,
        priceRangeMax: row.price_range_max || undefined,
        dimensions: row.dimensions || undefined,
        occasions: row.occasions || [],
        tags: row.tags || [],
        imageUrl: row.image_url || undefined,
        isActive: row.is_active,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at)
      }))
    } catch (error) {
      console.error('Error reading gifts from Supabase:', error)
      return []
    }
  },

  // Get gift by ID
  getGiftById: async (id: string): Promise<Gift | null> => {
    if (!supabase) {
      throw new Error('Supabase client not initialized. Please set SUPABASE_URL and SUPABASE_ANON_KEY environment variables.')
    }
    
    try {
      const { data, error } = await supabase
        .from('gifts')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') return null // No rows found
        throw error
      }

      return {
        id: data.id,
        name: data.name,
        description: data.description || undefined,
        category: data.category,
        priceRangeMin: data.price_range_min || undefined,
        priceRangeMax: data.price_range_max || undefined,
        dimensions: data.dimensions || undefined,
        occasions: data.occasions || [],
        tags: data.tags || [],
        imageUrl: data.image_url || undefined,
        isActive: data.is_active,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      }
    } catch (error) {
      console.error('Error reading gift from Supabase:', error)
      return null
    }
  },

  // Add new gift
  addGift: async (giftData: Omit<Gift, 'id' | 'createdAt' | 'updatedAt'>): Promise<Gift> => {
    if (!supabase) {
      throw new Error('Supabase client not initialized. Please set SUPABASE_URL and SUPABASE_ANON_KEY environment variables.')
    }
    
    try {
      const { data, error } = await supabase
        .from('gifts')
        .insert({
          name: giftData.name,
          description: giftData.description || null,
          category: giftData.category,
          price_range_min: giftData.priceRangeMin || null,
          price_range_max: giftData.priceRangeMax || null,
          dimensions: giftData.dimensions || null,
          occasions: giftData.occasions || [],
          tags: giftData.tags || [],
          image_url: giftData.imageUrl || null,
          is_active: giftData.isActive !== false
        })
        .select()
        .single()

      if (error) throw error

      return {
        id: data.id,
        name: data.name,
        description: data.description || undefined,
        category: data.category,
        priceRangeMin: data.price_range_min || undefined,
        priceRangeMax: data.price_range_max || undefined,
        dimensions: data.dimensions || undefined,
        occasions: data.occasions || [],
        tags: data.tags || [],
        imageUrl: data.image_url || undefined,
        isActive: data.is_active,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      }
    } catch (error) {
      console.error('Error adding gift to Supabase:', error)
      throw new Error('Failed to add gift')
    }
  },

  // Update existing gift
  updateGift: async (id: string, giftData: Partial<Omit<Gift, 'id' | 'createdAt'>>): Promise<Gift | null> => {
    if (!supabase) {
      throw new Error('Supabase client not initialized. Please set SUPABASE_URL and SUPABASE_ANON_KEY environment variables.')
    }
    
    try {
      const updateData: any = {}
      
      if (giftData.name !== undefined) updateData.name = giftData.name
      if (giftData.description !== undefined) updateData.description = giftData.description
      if (giftData.category !== undefined) updateData.category = giftData.category
      if (giftData.priceRangeMin !== undefined) updateData.price_range_min = giftData.priceRangeMin
      if (giftData.priceRangeMax !== undefined) updateData.price_range_max = giftData.priceRangeMax
      if (giftData.dimensions !== undefined) updateData.dimensions = giftData.dimensions
      if (giftData.occasions !== undefined) updateData.occasions = giftData.occasions
      if (giftData.tags !== undefined) updateData.tags = giftData.tags
      if (giftData.imageUrl !== undefined) updateData.image_url = giftData.imageUrl
      if (giftData.isActive !== undefined) updateData.is_active = giftData.isActive

      updateData.updated_at = new Date().toISOString()

      const { data, error } = await supabase
        .from('gifts')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        if (error.code === 'PGRST116') return null // No rows found
        throw error
      }

      return {
        id: data.id,
        name: data.name,
        description: data.description || undefined,
        category: data.category,
        priceRangeMin: data.price_range_min || undefined,
        priceRangeMax: data.price_range_max || undefined,
        dimensions: data.dimensions || undefined,
        occasions: data.occasions || [],
        tags: data.tags || [],
        imageUrl: data.image_url || undefined,
        isActive: data.is_active,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      }
    } catch (error) {
      console.error('Error updating gift in Supabase:', error)
      throw new Error('Failed to update gift')
    }
  },

  // Delete gift
  deleteGift: async (id: string): Promise<boolean> => {
    if (!supabase) {
      throw new Error('Supabase client not initialized. Please set SUPABASE_URL and SUPABASE_ANON_KEY environment variables.')
    }
    
    try {
      const { error } = await supabase
        .from('gifts')
        .delete()
        .eq('id', id)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error deleting gift from Supabase:', error)
      return false
    }
  }
}