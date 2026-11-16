'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Waves, Mountain, CalendarDays, Camera, MapPin, Plane, Clock, Sun,
  CloudRain, Backpack, Compass, ArrowRight, ChevronRight, Play,
  Navigation, Coffee, Bird, Flame, Sparkles, Star, Eye, Map as MapIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { store } from '@/lib/data'
import type { Attraction } from '@/lib/types'

// ── Virtual tour data ────────────────────────────────────────────────────────

interface VirtualTour {
  id: string
  name: string
  category: string
  description: string
  image: string
  tourUrl: string // 360° tour URL (Google Street View, etc.)
  highlights: string[]
  bestTime: string
  duration: string
}

const VIRTUAL_TOURS: VirtualTour[] = [
  {
    id: 'lake-bishoftu',
    name: 'Lake Bishoftu',
    category: 'Crater Lake',
    description: 'The deepest crater lake in the Bishoftu chain — a sacred, deep-green caldera surrounded by sheer volcanic cliffs. The most photographed lake in the region.',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    tourUrl: 'https://www.google.com/maps/@8.7547,39.0028,15a,75y,180t/data=!3m1!1e3',
    highlights: ['Deepest crater lake', 'Sacred site', 'Photography paradise', 'Volcanic cliffs'],
    bestTime: 'Oct – Mar (dry season)',
    duration: '1-2 hours',
  },
  {
    id: 'lake-hora',
    name: 'Lake Hora',
    category: 'Cultural & Festival',
    description: 'The spiritual heart of the Oromo Irecha thanksgiving festival. Grassy shores, calm waters, and deep cultural significance. Hosts 100,000+ visitors each September.',
    image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80',
    tourUrl: 'https://www.google.com/maps/@8.7489,39.0276,15a,75y,180t/data=!3m1!1e3',
    highlights: ['Irecha festival site', 'Oromo cultural heart', 'Grassy picnic shores', 'Guided cultural tours'],
    bestTime: 'Sep (Irecha) or Oct–Mar',
    duration: '2-3 hours',
  },
  {
    id: 'lake-babiogaya',
    name: 'Lake Babiogaya',
    category: 'Crater Lake',
    description: 'Twin-crater lake popular for bird-watching and lakeside relaxation. Resorts perched on the crater rim offer panoramic views of the emerald water below.',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    tourUrl: 'https://www.google.com/maps/@8.7521,39.0412,15a,75y,180t/data=!3m1!1e3',
    highlights: ['Twin crater', 'Bird watching', 'Clifftop resorts', 'Sunset viewpoint'],
    bestTime: 'Oct – Mar (migratory birds)',
    duration: '2-4 hours',
  },
  {
    id: 'lake-kuriftu',
    name: 'Lake Kuriftu',
    category: 'Resort & Recreation',
    description: 'Recreational lake with beach clubs, kayaking, paddle-boarding, and the famous Kuriftu Resort & Spa. The family-friendly destination for water sports.',
    image: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=1200&q=80',
    tourUrl: 'https://www.google.com/maps/@8.7589,39.0634,15a,75y,180t/data=!3m1!1e3',
    highlights: ['Kayaking & SUP', 'Beach club', 'Lakeside resort', 'Family-friendly'],
    bestTime: 'Year-round (best Oct–May)',
    duration: 'Half to full day',
  },
  {
    id: 'cheleleka-wetland',
    name: 'Cheleleka Wetland',
    category: 'Bird Sanctuary',
    description: 'A Ramsar-recognized Important Bird Area hosting flamingos, pelicans, and migratory waterfowl. A paradise for birders and nature photographers.',
    image: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=1200&q=80',
    tourUrl: 'https://www.google.com/maps/@8.7456,39.0589,15a,75y,180t/data=!3m1!1e3',
    highlights: ['142+ bird species', 'Flamingos & pelicans', 'Ramsar site', 'Photography hides'],
    bestTime: 'Oct – Mar (migration)',
    duration: '3-4 hours',
  },
  {
    id: 'sodre-hot-springs',
    name: 'Sodre Hot Springs',
    category: 'Wellness & Nature',
    description: 'Natural geothermal springs on the outskirts of Bishoftu, valued for relaxation and traditional wellness rituals. Steam rises from volcanic fissures.',
    image: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=1200&q=80',
    tourUrl: 'https://www.google.com/maps/@8.7612,38.9987,15a,75y,180t/data=!3m1!1e3',
    highlights: ['Geothermal springs', 'Wellness rituals', 'Natural pools', 'Volcanic landscape'],
    bestTime: 'Year-round',
    duration: '2-3 hours',
  },
]

const GALLERY_IMAGES = [
  { src: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80', alt: 'Crater lake panorama', label: 'Lake Bishoftu — deepest crater' },
  { src: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=800&q=80', alt: 'Lake Hora misty morning', label: 'Lake Hora — Irecha grounds' },
  { src: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80', alt: 'Babiogaya turquoise water', label: 'Lake Babiogaya — twin crater' },
  { src: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=800&q=80', alt: 'Cheleleka flamingos', label: 'Cheleleka Wetland — flamingos' },
  { src: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=800&q=80', alt: 'Sodre hot springs steam', label: 'Sodre Hot Springs' },
  { src: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80', alt: 'Lakeside resort pool', label: 'Bishoftu Resort Lodge' },
  { src: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80', alt: 'Kuriftu Resort beach', label: 'Kuriftu Resort & Spa' },
  { src: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=800&q=80', alt: 'Crater rim trail hike', label: 'Crater Rim Trail' },
  { src: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80', alt: 'Air force museum aircraft', label: 'Ethiopian Air Force Museum' },
  { src: 'https://images.unsplash.com/photo-1545569310-f8c1c9d6e7b6?auto=format&fit=crop&w=800&q=80', alt: 'St. Gabriel Church', label: 'St. Gabriel Church' },
  { src: 'https://images.unsplash.com/photo-1531971589569-0d9370cbe1e5?auto=format&fit=crop&w=800&q=80', alt: 'Bishoftu street scene', label: 'Bishoftu City Center' },
]

const FESTIVAL_CALENDAR = [
  {
    month: 'September',
    name: 'Irecha Festival',
    description: 'The Oromo people\'s most important thanksgiving celebration, held on the shores of Lake Hora. Over 100,000 gather in white, carrying flowers and grass to give thanks.',
    location: 'Lake Hora',
    icon: Sparkles,
    color: 'bg-amber-500/10 text-amber-700',
  },
  {
    month: 'January',
    name: 'Timkat (Epiphany)',
    description: 'Ethiopian Orthodox celebration of Christ\'s baptism. Colorful processions from St. Gabriel Church with replicas of the Ark of the Covenant.',
    location: 'St. Gabriel Church',
    icon: CalendarDays,
    color: 'bg-purple-500/10 text-purple-700',
  },
  {
    month: 'October–March',
    name: 'Bird Migration Season',
    description: 'Peak bird-watching at Cheleleka Wetland. Flamingos, pelicans, and migratory waterfowl arrive in large numbers — best photography opportunities.',
    location: 'Cheleleka Wetland',
    icon: Bird,
    color: 'bg-emerald-500/10 text-emerald-700',
  },
  {
    month: 'Year-round',
    name: 'Cultural Evenings',
    description: 'Resort-hosted Oromo cultural nights with traditional music, coffee ceremonies, and dance. Ask your hotel about scheduled evenings.',
    location: 'Various resorts',
    icon: Coffee,
    color: 'bg-rose-500/10 text-rose-700',
  },
]

const TRAVEL_GUIDE = [
  {
    icon: Plane,
    title: 'Getting There',
    content: 'Bishoftu is 47 km southeast of Addis Ababa along the Addis–Adama Expressway — a 1-hour drive. Taxis, ride-hailing (RIDE, Feres), and minibuses run regularly from Addis Ababa (Megenagna and Kaliti terminals).',
  },
  {
    icon: Sun,
    title: 'Best Time to Visit',
    content: 'October to March is the dry season — sunny, pleasant (18-25°C), and ideal for hiking, bird-watching, and lake activities. September brings the Irecha festival but can be rainy. April–May is the long rainy season.',
  },
  {
    icon: Backpack,
    title: 'What to Pack',
    content: 'Light layers for day, a jacket for cool evenings (Bishoftu sits at 1,920m elevation). Sunscreen, hat, and sunglasses for UV protection at altitude. Binoculars for bird-watching. Comfortable walking shoes for crater rim trails.',
  },
  {
    icon: Navigation,
    title: 'Getting Around',
    content: 'Taxis and bajajs (three-wheelers) are readily available within Bishoftu. Most resorts offer shuttle services between lakes. For the full crater lake circuit, hire a driver for a half-day (2,000-3,500 ETB).',
  },
  {
    icon: Clock,
    title: 'Suggested Itinerary',
    content: 'Day 1: Arrive, check into a lakeside resort, sunset at Lake Babiogaya. Day 2: Morning bird-watching at Cheleleka, afternoon kayaking at Lake Kuriftu. Day 3: Crater Rim Trail hike, Air Force Museum, Irecha site at Lake Hora.',
  },
  {
    icon: Coffee,
    title: 'Food & Drink',
    content: 'Try traditional Oromo dishes: chuko (roasted barley with butter), buna (coffee ceremony), and fresh fish from the crater lakes. Most resorts serve both Ethiopian and international cuisine. Local restaurants line the Main Street.',
  },
]

const LAKE_FACTS = [
  { label: 'Crater Lakes', value: '7', icon: Waves },
  { label: 'Elevation', value: '1,920m', icon: Mountain },
  { label: 'From Addis Ababa', value: '47 km', icon: Plane },
  { label: 'Annual Visitors', value: '500K+', icon: Star },
]

// ── Page component ──────────────────────────────────────────────────────────

export default function VirtualBishoftuPage() {
  const [attractions, setAttractions] = useState<Attraction[]>([])
  const [loading, setLoading] = useState(true)
  const [galleryOpen, setGalleryOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState<number>(0)
  const [heroImage, setHeroImage] = useState('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1920&q=80')

  useEffect(() => {
    // Fetch attractions from API
    fetch('/api/attractions')
      .then((r) => r.json())
      .then((data) => setAttractions(data.attractions || []))
      .catch(() => {})
      .finally(() => setLoading(false))

    // Fetch configurable hero image
    fetch('/api/site-images')
      .then((r) => r.json())
      .then((data) => {
        if (data.images?.virtual_bishoftu) setHeroImage(data.images.virtual_bishoftu)
      })
      .catch(() => {})
  }, [])

  function openGallery(index: number) {
    setSelectedImage(index)
    setGalleryOpen(true)
  }

  return (
    <div className="flex flex-col">
      {/* ═══ Hero ═══ */}
      <section className="relative overflow-hidden bg-primary">
        <div className="absolute inset-0 z-0">
          <img src={heroImage} alt="Bishoftu crater lake" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-primary/75 via-primary/55 to-primary/80" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
        </div>
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40">
          <div className="max-w-3xl text-white">
            <Badge className="mb-4 gap-1.5 bg-white/15 text-white border-white/20 backdrop-blur">
              <Eye className="h-3.5 w-3.5" /> Virtual Tour · 360° Previews
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
              See Bishoftu <span className="text-amber-300">Before You Arrive</span>
            </h1>
            <p className="mt-4 text-lg sm:text-xl text-white/90 max-w-2xl leading-relaxed">
              Explore seven crater lakes, the Irecha festival grounds, hot springs, and lakeside resorts through immersive 360° tours, photo galleries, and interactive guides — your preview of Oromia&apos;s Lake City.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Button asChild size="lg" className="gap-2 bg-amber-500 hover:bg-amber-600 text-white">
                <Link href="#tours">
                  <Compass className="h-5 w-5" /> Start 360° Tour
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="gap-2 border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white">
                <Link href="#gallery">
                  <Camera className="h-5 w-5" /> Photo Gallery
                </Link>
              </Button>
            </div>
          </div>

          {/* Lake facts strip */}
          <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-px overflow-hidden rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md">
            {LAKE_FACTS.map((f) => (
              <div key={f.label} className="px-4 py-4 text-center bg-white/5">
                <f.icon className="h-5 w-5 mx-auto text-amber-300 mb-1" />
                <p className="text-2xl font-bold text-white">{f.value}</p>
                <p className="text-xs text-white/80">{f.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Intro ═══ */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">Why Bishoftu?</p>
          <h2 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight">
            Seven Crater Lakes. One Unforgettable City.
          </h2>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
            Just 47 km from Addis Ababa, Bishoftu (formerly Debre Zeit) is Ethiopia&apos;s most accessible lake resort destination. Born from volcanic eruptions thousands of years ago, its seven crater lakes — Bishoftu, Hora, Babiogaya, Kuriftu, Kilole, Meskel, and Green Lake — each have their own character, color, and story.
          </p>
          <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
            Whether you come for the Irecha thanksgiving festival, the bird-watching at Cheleleka Wetland, a weekend at a lakeside resort, or a hike along the crater rim trail, this virtual tour is your first step. Explore the lakes, feel the culture, and plan your visit — all from your screen.
          </p>
        </div>
      </section>

      {/* ═══ 360° Virtual Tours ═══ */}
      <section id="tours" className="bg-muted/30 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">Interactive Tours</p>
            <h2 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight">360° Lake &amp; Attraction Tours</h2>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
              Click any destination to open a 360° street-level view on Google Maps. Explore the crater rims, lakeshores, and resort areas before you arrive.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {VIRTUAL_TOURS.map((tour) => (
              <Card key={tour.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={tour.image}
                    alt={tour.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  {/* 360° badge */}
                  <Badge className="absolute top-3 right-3 gap-1 bg-primary text-primary-foreground">
                    <Eye className="h-3 w-3" /> 360°
                  </Badge>
                  {/* Play overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 shadow-lg">
                      <Play className="h-6 w-6 text-primary fill-primary ml-0.5" />
                    </div>
                  </div>
                  {/* Label */}
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <p className="text-xs uppercase tracking-wider text-white/80">{tour.category}</p>
                    <p className="text-lg font-semibold">{tour.name}</p>
                  </div>
                </div>
                <CardContent className="p-5">
                  <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">{tour.description}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {tour.highlights.slice(0, 3).map((h) => (
                      <span key={h} className="rounded-full bg-secondary px-2.5 py-0.5 text-[11px] font-medium text-secondary-foreground">
                        {h}
                      </span>
                    ))}
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {tour.duration}</span>
                    <span className="flex items-center gap-1"><Sun className="h-3 w-3" /> {tour.bestTime}</span>
                  </div>
                  <Button asChild size="sm" className="mt-4 w-full gap-2">
                    <a href={tour.tourUrl} target="_blank" rel="noopener noreferrer">
                      <Compass className="h-4 w-4" /> Open 360° Tour
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Photo Gallery ═══ */}
      <section id="gallery" className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">Visual Preview</p>
            <h2 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight">Photo Gallery</h2>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
              Glimpses of Bishoftu&apos;s lakes, resorts, culture, and landscapes. Click any photo to enlarge.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {GALLERY_IMAGES.map((img, i) => (
              <button
                key={i}
                onClick={() => openGallery(i)}
                className="group relative aspect-square overflow-hidden rounded-xl bg-muted"
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-xs text-white font-medium">{img.label}</p>
                </div>
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90">
                    <Eye className="h-3.5 w-3.5 text-primary" />
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Festival Calendar ═══ */}
      <section className="bg-muted/30 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">Plan Around Events</p>
            <h2 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight">Festival &amp; Event Calendar</h2>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
              Time your visit to coincide with Bishoftu&apos;s cultural celebrations and natural events.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {FESTIVAL_CALENDAR.map((event) => (
              <Card key={event.name} className="flex gap-4">
                <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl m-4 ${event.color}`}>
                  <event.icon className="h-7 w-7" />
                </div>
                <CardContent className="flex-1 py-4 pr-4 pl-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-xs">{event.month}</Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {event.location}
                    </span>
                  </div>
                  <h3 className="font-semibold text-lg leading-snug">{event.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{event.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Travel Guide ═══ */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">Plan Your Trip</p>
            <h2 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight">Travel Guide</h2>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
              Everything you need to know to plan your visit to Bishoftu.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {TRAVEL_GUIDE.map((item) => (
              <Card key={item.title} className="flex flex-col">
                <CardContent className="p-5 flex-1">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary mb-3">
                    <item.icon className="h-5 w-5" />
                  </span>
                  <h3 className="font-semibold leading-snug">{item.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{item.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ All Attractions ═══ */}
      <section className="bg-muted/30 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">Full Directory</p>
            <h2 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight">All Attractions in Bishoftu</h2>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
              Complete list of registered destinations on the platform.
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {attractions.map((a) => (
                <Card key={a.id} className="flex gap-3 overflow-hidden">
                  <div className="h-20 w-20 shrink-0 overflow-hidden bg-muted">
                    {a.imageUrl && <img src={a.imageUrl} alt={a.name} className="h-full w-full object-cover" loading="lazy" />}
                  </div>
                  <CardContent className="flex-1 py-3 pr-3 pl-0">
                    <Badge variant="outline" className="text-[10px] mb-1 capitalize">{a.category.replace('_', ' ')}</Badge>
                    <p className="font-medium text-sm leading-snug">{a.name}</p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{a.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Card className="overflow-hidden border-0 bg-primary text-primary-foreground">
            <CardContent className="p-8 sm:p-12 text-center">
              <Sparkles className="h-10 w-10 mx-auto mb-4 text-amber-300" />
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                Ready to Explore Bishoftu in Person?
              </h2>
              <p className="mt-4 text-primary-foreground/90 leading-relaxed max-w-2xl mx-auto">
                You&apos;ve seen the lakes, the festivals, the resorts. Now find your perfect place to stay and start your journey to Oromia&apos;s Lake City.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild size="lg" variant="secondary" className="gap-2">
                  <Link href="/hotels">
                    <Waves className="h-5 w-5" /> Find a Hotel
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="gap-2 border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white">
                  <Link href="/">
                    <ArrowRight className="h-5 w-5" /> Back to Home
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ═══ Gallery Lightbox Dialog ═══ */}
      <Dialog open={galleryOpen} onOpenChange={setGalleryOpen}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black/95 border-black">
          <DialogHeader className="sr-only">
            <DialogTitle>{GALLERY_IMAGES[selectedImage]?.label}</DialogTitle>
            <DialogDescription>Photo {selectedImage + 1} of {GALLERY_IMAGES.length}</DialogDescription>
          </DialogHeader>
          <div className="relative">
            <img
              src={GALLERY_IMAGES[selectedImage]?.src.replace('w=800', 'w=1600')}
              alt={GALLERY_IMAGES[selectedImage]?.alt}
              className="w-full max-h-[80vh] object-contain"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              <p className="text-white font-medium">{GALLERY_IMAGES[selectedImage]?.label}</p>
              <p className="text-white/70 text-xs">Photo {selectedImage + 1} of {GALLERY_IMAGES.length}</p>
            </div>
            {/* Navigation */}
            {selectedImage > 0 && (
              <button
                onClick={() => setSelectedImage((i) => i - 1)}
                className="absolute left-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
                aria-label="Previous"
              >
                <ChevronRight className="h-6 w-6 rotate-180" />
              </button>
            )}
            {selectedImage < GALLERY_IMAGES.length - 1 && (
              <button
                onClick={() => setSelectedImage((i) => i + 1)}
                className="absolute right-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
                aria-label="Next"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
