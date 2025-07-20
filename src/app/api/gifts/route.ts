import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { storage } from '@/lib/storage'
import { CreateGiftData } from '@/types/gift'

// GET - Fetch all gifts
export async function GET() {
  try {
    const gifts = storage.getGifts()
    return NextResponse.json(gifts)
  } catch (error) {
    console.error('Error fetching gifts:', error)
    return NextResponse.json({ error: 'Failed to fetch gifts' }, { status: 500 })
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

    const newGift = storage.addGift(data)
    return NextResponse.json(newGift, { status: 201 })
  } catch (error) {
    console.error('Error creating gift:', error)
    return NextResponse.json({ error: 'Failed to create gift' }, { status: 500 })
  }
}