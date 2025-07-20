import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { storage } from '@/lib/storage'
import { CreateGiftData } from '@/types/gift'

export const dynamic = 'force-dynamic'

// GET - Fetch gift by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const gift = storage.getGiftById(id)
    
    if (!gift) {
      return NextResponse.json({ error: 'Gift not found' }, { status: 404 })
    }

    return NextResponse.json(gift)
  } catch (error) {
    console.error('Error fetching gift:', error)
    return NextResponse.json({ error: 'Failed to fetch gift' }, { status: 500 })
  }
}

// PUT - Update gift
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params
    const updatedGift = storage.updateGift(id, data)
    
    if (!updatedGift) {
      return NextResponse.json({ error: 'Gift not found' }, { status: 404 })
    }

    return NextResponse.json(updatedGift)
  } catch (error) {
    console.error('Error updating gift:', error)
    return NextResponse.json({ error: 'Failed to update gift' }, { status: 500 })
  }
}

// DELETE - Delete gift
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const success = storage.deleteGift(id)
    
    if (!success) {
      return NextResponse.json({ error: 'Gift not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Gift deleted successfully' })
  } catch (error) {
    console.error('Error deleting gift:', error)
    return NextResponse.json({ error: 'Failed to delete gift' }, { status: 500 })
  }
}