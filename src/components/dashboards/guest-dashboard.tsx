'use client'

import { useState, useEffect } from 'react'
import { Heart, Star, MapPin, DollarSign, BedDouble, TrendingUp, Trash2, Eye } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { store } from '@/lib/data'
import { getMergedHotels, getMergedNews } from '@/lib/hotel-store'
import { useAuth } from '@/lib/auth'
import type { Hotel, NewsPost } from '@/lib/data'

const FAVORITES_KEY = 'bishoftu_favorites'
const REVIEWS_KEY = 'bishoftu_reviews'

interface Review {
  id: string
  hotelId: string
  hotelName: string
  guestName: string
  rating: number
  comment: string
  createdAt: string
}

function loadFavorites(): string[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]')
  } catch { return [] }
}

function saveFavorites(ids: string[]) {
  if (typeof window !== 'undefined') localStorage.setItem(FAVORITES_KEY, JSON.stringify(ids))
}

function loadReviews(): Review[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(REVIEWS_KEY) || '[]')
  } catch { return [] }
}

function saveReviews(r: Review[]) {
  if (typeof window !== 'undefined') localStorage.setItem(REVIEWS_KEY, JSON.stringify(r))
}

export function GuestDashboard() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [news, setNews] = useState<NewsPost[]>([])
  const [favorites, setFavorites] = useState<string[]>([])
  const [reviews, setReviews] = useState<Review[]>([])

  // Review form
  const [reviewHotelId, setReviewHotelId] = useState('')
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')

  useEffect(() => {
    setHotels(getMergedHotels())
    setNews(getMergedNews().slice(0, 4))
    setFavorites(loadFavorites())
    setReviews(loadReviews())
  }, [])

  const favoriteHotels = hotels.filter((h) => favorites.includes(h.id))

  // Recommended: top-rated + lakeside
  const recommended = [...hotels]
    .sort((a, b) => b.starRating - a.starRating || (b.pricePerNight ?? 0) - (a.pricePerNight ?? 0))
    .slice(0, 3)

  function toggleFavorite(hotelId: string) {
    const current = loadFavorites()
    const next = current.includes(hotelId) ? current.filter((id) => id !== hotelId) : [...current, hotelId]
    saveFavorites(next)
    setFavorites(next)
    toast({
      title: current.includes(hotelId) ? 'Removed from favorites' : 'Added to favorites',
      description: hotels.find((h) => h.id === hotelId)?.name,
    })
  }

  function submitReview(e: React.FormEvent) {
    e.preventDefault()
    if (!reviewHotelId || !reviewComment.trim()) return
    const hotel = hotels.find((h) => h.id === reviewHotelId)
    if (!hotel) return
    const review: Review = {
      id: `r-${Date.now()}`,
      hotelId: hotel.id,
      hotelName: hotel.name,
      guestName: user?.name ?? 'Guest',
      rating: reviewRating,
      comment: reviewComment.trim(),
      createdAt: new Date().toISOString(),
    }
    const next = [review, ...loadReviews()]
    saveReviews(next)
    setReviews(next)
    setReviewHotelId('')
    setReviewComment('')
    setReviewRating(5)
    toast({ title: 'Review posted', description: `Thanks for reviewing ${hotel.name}!` })
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Welcome, {user?.name?.split(' ')[0] ?? 'Guest'}!</h1>
        <p className="text-muted-foreground mt-1">Your personal travel hub for Bishoftu.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardDescription className="text-xs uppercase tracking-wider">Saved Hotels</CardDescription>
            <Heart className="h-5 w-5 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{favorites.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardDescription className="text-xs uppercase tracking-wider">Reviews Posted</CardDescription>
            <Star className="h-5 w-5 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reviews.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardDescription className="text-xs uppercase tracking-wider">Available Hotels</CardDescription>
            <BedDouble className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{hotels.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardDescription className="text-xs uppercase tracking-wider">City Occupancy</CardDescription>
            <TrendingUp className="h-5 w-5 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {Math.round((hotels.reduce((s, h) => s + h.occupiedRooms, 0) / Math.max(1, hotels.reduce((s, h) => s + h.totalRooms, 0))) * 100)}%
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recommended */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Recommended for You</CardTitle>
            <CardDescription>Top-rated hotels in Bishoftu</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recommended.map((h) => (
              <div key={h.id} className="flex gap-3 rounded-lg border p-3">
                <div className="h-20 w-24 shrink-0 overflow-hidden rounded-md bg-muted">
                  {h.imageUrl && <img src={h.imageUrl} alt={h.name} className="h-full w-full object-cover" loading="lazy" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium truncate">{h.name}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" /> {h.subCity}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => toggleFavorite(h.id)}>
                      <Heart className={`h-4 w-4 ${favorites.includes(h.id) ? 'fill-rose-500 text-rose-500' : 'text-muted-foreground'}`} />
                    </Button>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-xs">
                    <span className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star key={n} className={`h-3 w-3 ${n <= h.starRating ? 'fill-amber-400 text-amber-400' : 'text-muted'}`} />
                      ))}
                    </span>
                    <span className="flex items-center gap-0.5 text-primary font-medium">
                      <DollarSign className="h-3 w-3" />
                      {h.pricePerNight ? `${h.pricePerNight.toLocaleString()} ETB` : 'Contact'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Latest news */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Latest Updates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {news.map((n) => (
              <div key={n.id} className="border-l-2 border-primary/30 pl-3">
                <p className="text-sm font-medium leading-snug">{n.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.excerpt}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{new Date(n.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · {n.hotelName}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Favorites */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><Heart className="h-5 w-5 text-rose-500" /> Your Favorite Hotels</CardTitle>
          <CardDescription>{favoriteHotels.length} saved {favoriteHotels.length === 1 ? 'hotel' : 'hotels'}</CardDescription>
        </CardHeader>
        <CardContent>
          {favoriteHotels.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <Heart className="h-10 w-10 mx-auto mb-2 opacity-40" />
              <p>No favorites yet. Tap the heart icon on any hotel to save it here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {favoriteHotels.map((h) => (
                <div key={h.id} className="rounded-lg border p-3 flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{h.name}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" /> {h.subCity}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 text-rose-500" onClick={() => toggleFavorite(h.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <Badge variant="outline">{h.starRating}★</Badge>
                    <span className="text-primary font-medium">{h.pricePerNight ? `${h.pricePerNight.toLocaleString()} ETB` : 'Contact hotel'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Leave a review */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Leave a Review</CardTitle>
          <CardDescription>Share your experience with other travelers</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submitReview} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="rev-hotel">Hotel</Label>
                <select
                  id="rev-hotel"
                  value={reviewHotelId}
                  onChange={(e) => setReviewHotelId(e.target.value)}
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Select a hotel…</option>
                  {hotels.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Rating</Label>
                <div className="flex items-center gap-1 h-10">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} type="button" onClick={() => setReviewRating(n)}>
                      <Star className={`h-7 w-7 ${n <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/40'}`} />
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rev-comment">Your review</Label>
              <Textarea id="rev-comment" value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} placeholder="Tell others about your stay…" rows={3} required />
            </div>
            <Button type="submit" className="gap-2"><Star className="h-4 w-4" /> Post Review</Button>
          </form>
        </CardContent>
      </Card>

      {/* My reviews */}
      {reviews.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your Reviews</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {reviews.map((r) => (
              <div key={r.id} className="border-l-2 border-amber-500/40 pl-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium text-sm">{r.hotelName}</p>
                  <span className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star key={n} className={`h-3 w-3 ${n <= r.rating ? 'fill-amber-400 text-amber-400' : 'text-muted'}`} />
                    ))}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{r.comment}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{new Date(r.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
