'use client'

import { useState, useCallback } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { resourcesApi, aiApi, analyticsApi } from '@/lib/api'
import { ResourceCard } from '@/components/forms/ResourceCard'
import { SituationGuide } from '@/components/forms/SituationGuide'
import { AIAssistant } from '@/components/forms/AIAssistant'
import { PartnerGrid } from '@/components/forms/PartnerGrid'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

const AGE_OPTIONS = [
  { value: '', label: 'All Ages' },
  { value: '0-3', label: '0–3 years (Early Intervention)' },
  { value: '3-6', label: '3–6 years (Pre-school)' },
  { value: '6-12', label: '6–12 years (School age)' },
  { value: '12-18', label: '12–18 years (Adolescent)' },
  { value: '18+', label: '18+ years (Adult)' },
]

const DIAGNOSIS_OPTIONS = [
  { value: '', label: 'Any Condition' },
  { value: 'autism', label: 'Autism Spectrum Disorder (ASD)' },
  { value: 'adhd', label: 'ADHD / ADD' },
  { value: 'both', label: 'Autism + ADHD' },
  { value: 'delay', label: 'Developmental Delay' },
  { value: 'speech', label: 'Speech & Language Delay' },
  { value: 'sensory', label: 'Sensory Processing Disorder' },
  { value: 'other', label: 'Other / Not yet diagnosed' },
]

const NEED_OPTIONS = [
  { value: '', label: 'All Resource Types' },
  { value: 'therapy', label: 'Therapy Centre' },
  { value: 'school', label: 'Inclusive / Special School' },
  { value: 'hospital', label: 'Specialist Hospital' },
  { value: 'sports', label: 'Sports Academy' },
  { value: 'govt', label: 'Government Schemes' },
  { value: 'parent', label: 'Parent Support Group' },
]

const CITIES = [
  { value: '', label: 'All Cities' },
  { value: 'bangalore', label: 'Bangalore' },
  { value: 'mumbai', label: 'Mumbai' },
  { value: 'delhi', label: 'Delhi' },
  { value: 'chennai', label: 'Chennai' },
  { value: 'hyderabad', label: 'Hyderabad' },
  { value: 'pune', label: 'Pune' },
  { value: 'kochi', label: 'Kochi' },
  { value: 'kolkata', label: 'Kolkata' },
]

interface SearchFilters {
  query: string
  age: string
  diagnosis: string
  need: string
  city: string
}

export default function ResearchPage() {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '', age: '', diagnosis: '', need: '', city: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [activeFilter, setActiveFilter] = useState('')

  // Resource search query
  const { data: results, isFetching } = useQuery({
    queryKey: ['resources', filters],
    queryFn: () => resourcesApi.search({
      query: filters.query,
      type: filters.need,
      city: filters.city,
      age: filters.age,
      diagnosis: filters.diagnosis,
      limit: 20,
    }),
    enabled: submitted,
  })

  // Analytics mutation
  const logSearch = useMutation({
    mutationFn: () => analyticsApi.recordSearch({
      query: filters.query,
      filters: { age: filters.age, diagnosis: filters.diagnosis, need: filters.need, city: filters.city },
      resultsCount: results?.data?.total ?? 0,
      page: 'research',
    }),
  })

  const handleSearch = useCallback(() => {
    setSubmitted(true)
    logSearch.mutate()
  }, [filters, logSearch])

  const resources = results?.data?.items ?? []
  const filteredResources = activeFilter
    ? resources.filter((r: any) => r.type === activeFilter)
    : resources

  return (
    <div className="min-h-screen bg-warm-white">
      {/* Hero + Search */}
      <section className="bg-gradient-to-br from-navy via-navy/90 to-teal/20 pt-28 pb-0 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <Badge variant="outline" className="mb-5 border-amber/40 text-amber bg-amber/10">
            🔍 Smart Resource Finder
          </Badge>
          <h1 className="font-serif text-5xl font-bold text-white mb-4 leading-tight">
            Find the Right Help,{' '}
            <em className="text-amber not-italic">Right Near You</em>
          </h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
            Tell us about your situation and we'll match you with verified therapy centres,
            schools, hospitals and government resources.
          </p>

          {/* Search Card */}
          <div className="bg-white rounded-3xl p-8 shadow-warm-lg text-left mb-0 relative z-10">
            <h2 className="font-serif text-xl text-navy mb-1">🎯 Find Resources for Your Child</h2>
            <p className="text-sm text-muted mb-6">All searches are anonymous and help us improve results for every family.</p>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">Child's Age</label>
                <Select value={filters.age} onValueChange={(v) => setFilters(f => ({...f, age: v}))}>
                  {AGE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </Select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">Primary Diagnosis</label>
                <Select value={filters.diagnosis} onValueChange={(v) => setFilters(f => ({...f, diagnosis: v}))}>
                  {DIAGNOSIS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </Select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">What Do You Need?</label>
                <Select value={filters.need} onValueChange={(v) => setFilters(f => ({...f, need: v}))}>
                  {NEED_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </Select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">Your City</label>
                <Select value={filters.city} onValueChange={(v) => setFilters(f => ({...f, city: v}))}>
                  {CITIES.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </Select>
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">
                Describe Your Situation (helps AI match better)
              </label>
              <Input
                value={filters.query}
                onChange={(e) => setFilters(f => ({...f, query: e.target.value}))}
                placeholder="e.g. non-verbal 5 year old, looking for ABA therapy under ₹5000/month…"
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>

            <Button
              className="w-full bg-amber hover:bg-amber-dark text-white rounded-full py-4 text-base font-bold"
              onClick={handleSearch}
              disabled={isFetching}
            >
              {isFetching ? '🔄 Searching…' : '🔍 Find Resources Now'}
            </Button>
          </div>
        </div>
      </section>

      {/* Data Notice */}
      <div className="bg-teal text-white px-8 py-5 flex items-center gap-4">
        <span className="text-3xl">📊</span>
        <p className="text-sm text-white/80 leading-relaxed">
          <strong className="text-white">Your searches shape this platform.</strong>{' '}
          Every search is recorded anonymously to help us understand what families need — so we can onboard more providers, add resources, and build better tools.
        </p>
      </div>

      {/* Results */}
      {submitted && (
        <section className="bg-cream px-8 py-12">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <h2 className="font-serif text-3xl text-navy">
                {isFetching ? 'Searching…' : `${filteredResources.length} resources found`}
              </h2>
              {!isFetching && (
                <Badge className="bg-amber text-white px-4 py-2">
                  {results?.data?.total ?? 0} total
                </Badge>
              )}
            </div>

            {/* Type filters */}
            <div className="flex gap-2 flex-wrap mb-6">
              {['', 'therapy', 'school', 'hospital', 'sports', 'govt'].map((type) => (
                <button
                  key={type}
                  onClick={() => setActiveFilter(type)}
                  className={`px-4 py-2 rounded-full text-xs font-bold border transition-all ${
                    activeFilter === type
                      ? 'bg-amber border-amber text-white'
                      : 'bg-white border-border text-muted hover:border-amber hover:text-amber'
                  }`}
                >
                  {type === '' ? 'All' : type === 'therapy' ? '🧠 Therapy' : type === 'school' ? '🏫 School' : type === 'hospital' ? '🏥 Hospital' : type === 'sports' ? '🏃 Sports' : '📋 Govt'}
                </button>
              ))}
            </div>

            {isFetching ? (
              <div className="grid grid-cols-3 gap-4">
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} className="bg-white rounded-2xl h-64 animate-pulse" />
                ))}
              </div>
            ) : filteredResources.length === 0 ? (
              <div className="text-center py-16 text-muted">
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="font-serif text-2xl text-navy mb-2">No results found</h3>
                <p>Try broadening your search. Your query has been recorded — we'll add relevant resources soon.</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                {filteredResources.map((resource: any) => (
                  <ResourceCard key={resource.id} resource={resource} />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* AI Assistant */}
      <section className="bg-white px-8 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <Badge variant="outline" className="mb-4 border-amber/40 text-amber">🤖 AI-Powered</Badge>
            <h2 className="font-serif text-4xl text-navy mb-3">Ask Ayushman AI</h2>
            <p className="text-muted text-lg">
              Describe your situation in plain language. Our AI will give you personalised guidance and resource recommendations.
            </p>
          </div>
          <AIAssistant />
        </div>
      </section>

      {/* Situation Guide */}
      <section className="bg-cream px-8 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-amber mb-3 block">Situation Guide</span>
            <h2 className="font-serif text-4xl text-navy">What Should I Do If…</h2>
          </div>
          <SituationGuide />
        </div>
      </section>

      {/* Partners */}
      <section className="bg-white px-8 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-amber mb-3 block">Verified Partners</span>
            <h2 className="font-serif text-4xl text-navy mb-3">Our Trusted Network</h2>
            <p className="text-muted">Partners appear here after founder verification. All listings are manually reviewed.</p>
          </div>
          <PartnerGrid />
        </div>
      </section>
    </div>
  )
}
