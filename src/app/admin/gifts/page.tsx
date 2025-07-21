"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { Container } from "@/components/Container"
import { ImageUpload } from "@/components/ImageUpload"
import { CreateGiftData, Gift } from "@/types/gift"
import { getPagePath, getApiPath } from "@/lib/utils"

const occasionOptions = [
  "Birthday", "Anniversary", "Wedding", "Diwali", "Holi", "Christmas", 
  "New Year", "Valentine's Day", "Mother's Day", "Father's Day", 
  "Graduation", "Housewarming", "Baby Shower", "Corporate Gifts"
]

const categoryOptions = [
  "Home Decor", "Jewelry", "Textiles", "Pottery", "Wooden Crafts", 
  "Metalware", "Paper Crafts", "Personal Care", "Kitchen Items", "Other"
]

export default function AdminGifts() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [gifts, setGifts] = useState<Gift[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingGift, setEditingGift] = useState<Gift | null>(null)

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<CreateGiftData>({
    defaultValues: {
      isActive: true
    }
  })

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(getPagePath("/admin/login"))
    }
  }, [status, router])

  useEffect(() => {
    fetchGifts()
  }, [])

  const fetchGifts = async () => {
    try {
      const response = await fetch(getApiPath('/api/gifts'))
      if (response.ok) {
        const data = await response.json()
        setGifts(data)
      }
    } catch (error) {
      console.error('Error fetching gifts (API not available in static export):', error)
      // In static export, show placeholder message
      setGifts([])
    }
  }

  const onSubmit = async (data: CreateGiftData) => {
    setIsLoading(true)
    try {
      if (editingGift) {
        // Update existing gift
        const response = await fetch(getApiPath(`/api/gifts/${editingGift.id}`), {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Failed to update gift')
        }

        const updatedGift = await response.json()
        setGifts(prev => prev.map(gift => gift.id === editingGift.id ? updatedGift : gift))
      } else {
        // Create new gift
        const response = await fetch(getApiPath('/api/gifts'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Failed to create gift')
        }

        const newGift = await response.json()
        setGifts(prev => [...prev, newGift])
      }

      reset()
      setShowForm(false)
      setEditingGift(null)
    } catch (error) {
      console.error("Error saving gift:", error)
      alert(error instanceof Error ? error.message : 'Failed to save gift')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (gift: Gift) => {
    setEditingGift(gift)
    setValue("name", gift.name)
    setValue("description", gift.description || "")
    setValue("priceRangeMin", gift.priceRangeMin)
    setValue("priceRangeMax", gift.priceRangeMax)
    setValue("dimensions", gift.dimensions)
    setValue("occasions", gift.occasions)
    setValue("category", gift.category)
    setValue("tags", gift.tags)
    setValue("imageUrl", gift.imageUrl || "")
    setValue("isActive", gift.isActive)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this gift item?")) {
      try {
        const response = await fetch(getApiPath(`/api/gifts/${id}`), {
          method: 'DELETE',
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Failed to delete gift')
        }

        setGifts(prev => prev.filter(gift => gift.id !== id))
      } catch (error) {
        console.error("Error deleting gift:", error)
        alert(error instanceof Error ? error.message : 'Failed to delete gift')
      }
    }
  }

  const handleCancel = () => {
    reset()
    setShowForm(false)
    setEditingGift(null)
  }

  if (status === "loading") {
    return (
      <Container>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-lg">Loading...</div>
        </div>
      </Container>
    )
  }

  if (!session) {
    return null
  }

  return (
    <Container>
      <div className="min-h-screen py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-playfair">
              Gift Items Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Welcome, {session.user?.name}
            </p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-saavi-gold hover:bg-saavi-gold-dark text-white px-6 py-2 rounded-md font-medium transition-colors"
            >
              {showForm ? "Cancel" : "Add New Gift"}
            </button>
            <button
              onClick={() => signOut({ callbackUrl: getPagePath("/") })}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-md font-medium transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">
              {editingGift ? "Edit Gift Item" : "Add New Gift Item"}
            </h2>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Gift Name *
                  </label>
                  <input
                    {...register("name", { required: "Name is required" })}
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-saavi-gold focus:border-saavi-gold dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Enter gift name"
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category *
                  </label>
                  <select
                    {...register("category", { required: "Category is required" })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-saavi-gold focus:border-saavi-gold dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="">Select category</option>
                    {categoryOptions.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  {...register("description")}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-saavi-gold focus:border-saavi-gold dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Enter gift description"
                />
              </div>

              {/* Price Range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Price Range Min (₹)
                  </label>
                  <input
                    {...register("priceRangeMin", { 
                      min: { value: 0, message: "Price must be positive" }
                    })}
                    type="number"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-saavi-gold focus:border-saavi-gold dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="0.00"
                  />
                  {errors.priceRangeMin && <p className="text-red-500 text-sm mt-1">{errors.priceRangeMin.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Price Range Max (₹)
                  </label>
                  <input
                    {...register("priceRangeMax", { 
                      min: { value: 0, message: "Price must be positive" }
                    })}
                    type="number"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-saavi-gold focus:border-saavi-gold dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="0.00"
                  />
                  {errors.priceRangeMax && <p className="text-red-500 text-sm mt-1">{errors.priceRangeMax.message}</p>}
                </div>
              </div>

              {/* Dimensions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Dimensions (Optional)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <input
                    {...register("dimensions.length", { min: 0 })}
                    type="number"
                    step="0.1"
                    placeholder="Length"
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-saavi-gold focus:border-saavi-gold dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                  <input
                    {...register("dimensions.width", { min: 0 })}
                    type="number"
                    step="0.1"
                    placeholder="Width"
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-saavi-gold focus:border-saavi-gold dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                  <input
                    {...register("dimensions.height", { min: 0 })}
                    type="number"
                    step="0.1"
                    placeholder="Height"
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-saavi-gold focus:border-saavi-gold dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                  <select
                    {...register("dimensions.unit")}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-saavi-gold focus:border-saavi-gold dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="">Unit</option>
                    <option value="cm">cm</option>
                    <option value="inches">inches</option>
                  </select>
                </div>
              </div>

              {/* Occasions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Suitable Occasions *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-32 overflow-y-auto border border-gray-300 rounded-md p-3 dark:border-gray-600 dark:bg-gray-700">
                  {occasionOptions.map(occasion => (
                    <label key={occasion} className="flex items-center space-x-2">
                      <input
                        {...register("occasions", { required: "Select at least one occasion" })}
                        type="checkbox"
                        value={occasion}
                        className="text-saavi-gold focus:ring-saavi-gold"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{occasion}</span>
                    </label>
                  ))}
                </div>
                {errors.occasions && <p className="text-red-500 text-sm mt-1">{errors.occasions.message}</p>}
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tags (comma-separated)
                </label>
                <input
                  {...register("tags")}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-saavi-gold focus:border-saavi-gold dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="handmade, eco-friendly, traditional"
                  onChange={(e) => {
                    const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)
                    setValue("tags", tags)
                  }}
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Product Image
                </label>
                <ImageUpload
                  value={watch("imageUrl")}
                  onChange={(imageUrl) => setValue("imageUrl", imageUrl)}
                  onRemove={() => setValue("imageUrl", "")}
                />
              </div>

              {/* Active Status */}
              <div className="flex items-center space-x-2">
                <input
                  {...register("isActive")}
                  type="checkbox"
                  className="text-saavi-gold focus:ring-saavi-gold"
                />
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Active (visible to customers)
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-saavi-brown hover:bg-saavi-brown-light text-white px-6 py-2 rounded-md font-medium transition-colors disabled:opacity-50"
                >
                  {isLoading ? "Saving..." : editingGift ? "Update Gift" : "Add Gift"}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-md font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Gifts List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Gift Items ({gifts.length})
            </h2>
          </div>
          
          {gifts.length === 0 ? (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
              <div className="mb-2">No gift items found.</div>
              <div className="text-sm">
                {process.env.NEXT_PUBLIC_BASE_PATH ? 
                  "Note: Admin functionality is limited in static export mode. Deploy with server environment for full functionality." 
                  : "Click \"Add New Gift\" to get started."
                }
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Price Range
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {gifts.map((gift) => (
                    <tr key={gift.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {gift.imageUrl && (
                            <img 
                              src={gift.imageUrl} 
                              alt={gift.name}
                              className="h-10 w-10 rounded object-cover mr-3"
                            />
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {gift.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {gift.occasions.slice(0, 2).join(', ')}
                              {gift.occasions.length > 2 && ` +${gift.occasions.length - 2} more`}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {gift.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {gift.priceRangeMin && gift.priceRangeMax ? (
                          gift.priceRangeMin === gift.priceRangeMax ? 
                            `₹${gift.priceRangeMin}` : 
                            `₹${gift.priceRangeMin} - ₹${gift.priceRangeMax}`
                        ) : (
                          "Price on request"
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          gift.isActive 
                            ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' 
                            : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                        }`}>
                          {gift.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleEdit(gift)}
                          className="text-saavi-gold hover:text-saavi-gold-dark transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(gift.id)}
                          className="text-red-600 hover:text-red-700 transition-colors"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Container>
  )
}