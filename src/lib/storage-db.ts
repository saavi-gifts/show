import { connect } from '@planetscale/database'
import { Gift } from '@/types/gift'

// Initialize PlanetScale connection
const config = {
  host: process.env.DATABASE_HOST,
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
}

const conn = connect(config)

export const dbStorage = {
  // Read all gifts
  getGifts: async (): Promise<Gift[]> => {
    try {
      const { rows } = await conn.execute('SELECT * FROM gifts ORDER BY created_at DESC')
      return rows.map(row => ({
        id: row.id as string,
        name: row.name as string,
        description: row.description as string || undefined,
        category: row.category as string,
        priceRangeMin: row.price_range_min as number || undefined,
        priceRangeMax: row.price_range_max as number || undefined,
        dimensions: row.dimensions ? JSON.parse(row.dimensions as string) : undefined,
        occasions: row.occasions ? JSON.parse(row.occasions as string) : [],
        tags: row.tags ? JSON.parse(row.tags as string) : [],
        imageUrl: row.image_url as string || undefined,
        isActive: row.is_active as boolean,
        createdAt: new Date(row.created_at as string),
        updatedAt: new Date(row.updated_at as string)
      }))
    } catch (error) {
      console.error('Error reading gifts from DB:', error)
      return []
    }
  },

  // Get gift by ID
  getGiftById: async (id: string): Promise<Gift | null> => {
    try {
      const { rows } = await conn.execute('SELECT * FROM gifts WHERE id = ?', [id])
      if (rows.length === 0) return null
      
      const row = rows[0]
      return {
        id: row.id as string,
        name: row.name as string,
        description: row.description as string || undefined,
        category: row.category as string,
        priceRangeMin: row.price_range_min as number || undefined,
        priceRangeMax: row.price_range_max as number || undefined,
        dimensions: row.dimensions ? JSON.parse(row.dimensions as string) : undefined,
        occasions: row.occasions ? JSON.parse(row.occasions as string) : [],
        tags: row.tags ? JSON.parse(row.tags as string) : [],
        imageUrl: row.image_url as string || undefined,
        isActive: row.is_active as boolean,
        createdAt: new Date(row.created_at as string),
        updatedAt: new Date(row.updated_at as string)
      }
    } catch (error) {
      console.error('Error reading gift from DB:', error)
      return null
    }
  },

  // Add new gift
  addGift: async (giftData: Omit<Gift, 'id' | 'createdAt' | 'updatedAt'>): Promise<Gift> => {
    const id = Date.now().toString()
    const now = new Date()
    
    try {
      await conn.execute(`
        INSERT INTO gifts (
          id, name, description, category, price_range_min, price_range_max,
          dimensions, occasions, tags, image_url, is_active,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        id,
        giftData.name,
        giftData.description || null,
        giftData.category,
        giftData.priceRangeMin || null,
        giftData.priceRangeMax || null,
        giftData.dimensions ? JSON.stringify(giftData.dimensions) : null,
        JSON.stringify(giftData.occasions || []),
        JSON.stringify(giftData.tags || []),
        giftData.imageUrl || null,
        giftData.isActive !== false,
        now.toISOString(),
        now.toISOString()
      ])

      return {
        ...giftData,
        id,
        createdAt: now,
        updatedAt: now
      }
    } catch (error) {
      console.error('Error adding gift to DB:', error)
      throw new Error('Failed to add gift')
    }
  },

  // Update existing gift
  updateGift: async (id: string, giftData: Partial<Omit<Gift, 'id' | 'createdAt'>>): Promise<Gift | null> => {
    const now = new Date()
    
    try {
      const fields = []
      const values = []
      
      if (giftData.name !== undefined) { fields.push('name = ?'); values.push(giftData.name) }
      if (giftData.description !== undefined) { fields.push('description = ?'); values.push(giftData.description) }
      if (giftData.category !== undefined) { fields.push('category = ?'); values.push(giftData.category) }
      if (giftData.priceRangeMin !== undefined) { fields.push('price_range_min = ?'); values.push(giftData.priceRangeMin) }
      if (giftData.priceRangeMax !== undefined) { fields.push('price_range_max = ?'); values.push(giftData.priceRangeMax) }
      if (giftData.dimensions !== undefined) { fields.push('dimensions = ?'); values.push(giftData.dimensions ? JSON.stringify(giftData.dimensions) : null) }
      if (giftData.occasions !== undefined) { fields.push('occasions = ?'); values.push(JSON.stringify(giftData.occasions)) }
      if (giftData.tags !== undefined) { fields.push('tags = ?'); values.push(JSON.stringify(giftData.tags)) }
      if (giftData.imageUrl !== undefined) { fields.push('image_url = ?'); values.push(giftData.imageUrl) }
      if (giftData.isActive !== undefined) { fields.push('is_active = ?'); values.push(giftData.isActive) }
      
      fields.push('updated_at = ?')
      values.push(now.toISOString())
      values.push(id)

      const { rowsAffected } = await conn.execute(
        `UPDATE gifts SET ${fields.join(', ')} WHERE id = ?`,
        values
      )

      if (rowsAffected === 0) {
        return null
      }

      return await dbStorage.getGiftById(id)
    } catch (error) {
      console.error('Error updating gift in DB:', error)
      throw new Error('Failed to update gift')
    }
  },

  // Delete gift
  deleteGift: async (id: string): Promise<boolean> => {
    try {
      const { rowsAffected } = await conn.execute('DELETE FROM gifts WHERE id = ?', [id])
      return rowsAffected > 0
    } catch (error) {
      console.error('Error deleting gift from DB:', error)
      return false
    }
  }
}