import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { CreateGiftData } from '@/types/gift'
import { storage } from '@/lib/storage'
import fs from 'fs'
import path from 'path'

// GET - Fetch all gifts
export async function GET() {
  try {
    const GIFTS_FILE = path.join(process.cwd(), 'data', 'gifts.json')
    
    if (!fs.existsSync(GIFTS_FILE)) {
      return NextResponse.json([])
    }
    
    const data = fs.readFileSync(GIFTS_FILE, 'utf-8')
    const rawGifts = JSON.parse(data)
    
    // Normalize data types
    const gifts = rawGifts.map((gift: any) => ({
      ...gift,
      priceRangeMin: gift.priceRangeMin ? parseFloat(gift.priceRangeMin) : undefined,
      priceRangeMax: gift.priceRangeMax ? parseFloat(gift.priceRangeMax) : undefined,
      dimensions: gift.dimensions ? {
        ...gift.dimensions,
        length: gift.dimensions.length ? parseFloat(gift.dimensions.length) : 0,
        width: gift.dimensions.width ? parseFloat(gift.dimensions.width) : 0,
        height: gift.dimensions.height ? parseFloat(gift.dimensions.height) : 0,
      } : undefined,
      tags: Array.isArray(gift.tags) ? gift.tags : (typeof gift.tags === 'string' ? [gift.tags] : []),
      occasions: Array.isArray(gift.occasions) ? gift.occasions : [],
      createdAt: new Date(gift.createdAt),
      updatedAt: new Date(gift.updatedAt)
    }))
    
    return NextResponse.json(gifts)
  } catch (error) {
    console.error('Error fetching gifts:', error)
    return NextResponse.json({ error: 'Failed to fetch gifts', details: String(error) }, { status: 500 })
  }
}

// POST - Create new gift
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data: CreateGiftData = await request.json()

    // Validate required fields
    if (!data.name || !data.category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Validate price range if provided
    if ((data.priceRangeMin !== undefined && data.priceRangeMin < 0) || 
        (data.priceRangeMax !== undefined && data.priceRangeMax < 0) ||
        (data.priceRangeMin !== undefined && data.priceRangeMax !== undefined && data.priceRangeMin > data.priceRangeMax)) {
      return NextResponse.json({ error: 'Invalid price range' }, { status: 400 })
    }

    // Validate dimensions if provided
    if (data.dimensions && (data.dimensions.length <= 0 || data.dimensions.width <= 0 || data.dimensions.height <= 0)) {
      return NextResponse.json({ error: 'Invalid dimensions' }, { status: 400 })
    }

    // Validate occasions
    if (!data.occasions || data.occasions.length === 0) {
      return NextResponse.json({ error: 'At least one occasion is required' }, { status: 400 })
    }

    const newGift = await storage.addGift(data)
    return NextResponse.json(newGift, { status: 201 })
  } catch (error) {
    console.error('Error creating gift:', error)
    return NextResponse.json({ error: 'Failed to create gift' }, { status: 500 })
  }
}