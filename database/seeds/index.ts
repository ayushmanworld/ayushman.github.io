/**
 * Ayushman Platform — Database Seed
 *
 * Seeds development and staging databases with:
 * - Admin / founder user
 * - Sample resources (10 verified)
 * - Sample videos (15 verified)
 * - Forum categories
 * - Knowledge chunks (placeholder until AI ingest runs)
 *
 * Usage: pnpm db:seed
 */

import { PrismaClient, UserRole, UserStatus, ResourceType } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

const BCRYPT_ROUNDS = 12

async function main(): Promise<void> {
  console.log('🌱 Starting Ayushman database seed...')

  // ─── Admin / Founder ────────────────────────────────
  const founderHash = await bcrypt.hash('Ayushman@Founder2026!', BCRYPT_ROUNDS)

  const founder = await prisma.user.upsert({
    where: { email: 'ayushmans@outlook.in' },
    update: { role: UserRole.FOUNDER, status: UserStatus.ACTIVE, isEmailVerified: true },
    create: {
      email: 'ayushmans@outlook.in',
      name: 'BK Satpathy',
      passwordHash: founderHash,
      role: UserRole.FOUNDER,
      status: UserStatus.ACTIVE,
      isEmailVerified: true,
      country: 'India',
      state: 'Karnataka',
      city: 'Bangalore',
    },
  })
  console.log(`✅ Founder user: ${founder.email}`)

  const adminHash = await bcrypt.hash('Ayushman@Admin2026!', BCRYPT_ROUNDS)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@ayushman.world' },
    update: { role: UserRole.ADMIN, status: UserStatus.ACTIVE, isEmailVerified: true },
    create: {
      email: 'admin@ayushman.world',
      name: 'Ayushman Admin',
      passwordHash: adminHash,
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      isEmailVerified: true,
      country: 'India',
      state: 'Karnataka',
      city: 'Bangalore',
    },
  })
  console.log(`✅ Admin user: ${admin.email}`)

  // ─── Resources ──────────────────────────────────────
  const resources = [
    {
      name: 'NIMHANS — Child & Adolescent Psychiatry',
      type: ResourceType.HOSPITAL,
      description: "India's premier neuroscience institution. Government-subsidised OPD for autism and ADHD diagnosis. Child psychiatry available Monday to Saturday.",
      tags: ['Diagnosis', 'Child Psychiatry', 'Subsidised', 'OPD'],
      services: ['Diagnosis', 'Child Psychiatry', 'OT', 'Speech Therapy'],
      conditions: ['autism', 'adhd', 'developmental_delay'],
      address: 'Hosur Road, Bangalore 560029',
      city: 'bangalore', state: 'Karnataka', country: 'India',
      phone: '080-46110007', email: 'info@nimhans.ac.in', website: 'https://nimhans.ac.in',
      workingHours: 'Mon–Sat 9am–5pm',
      lat: 12.9447, lng: 77.5946,
      isVerified: true, isActive: true,
      approvedBy: founder.id, approvedAt: new Date(),
    },
    {
      name: 'Action For Autism (AFA)',
      type: ResourceType.RESEARCH,
      description: "India's leading autism advocacy organisation. ABA therapy, parent training, inclusive education resources and free legal support for school admission cases.",
      tags: ['ABA', 'Advocacy', 'Legal Support', 'Parent Training'],
      services: ['ABA Therapy', 'Parent Training', 'Legal Aid', 'Inclusive Education'],
      conditions: ['autism', 'adhd'],
      address: 'Community Centre, Sheikh Sarai Phase 1, New Delhi 110017',
      city: 'delhi', state: 'Delhi', country: 'India',
      phone: '011-26972114', email: 'contact@autism.net.in', website: 'https://actionforautism.org',
      workingHours: 'Mon–Fri 9am–5pm',
      lat: 28.5294, lng: 77.2101,
      isVerified: true, isActive: true,
      approvedBy: founder.id, approvedAt: new Date(),
    },
    {
      name: 'Tamana Special Education Centre',
      type: ResourceType.SCHOOL,
      description: 'Specialised school for children with autism, Down syndrome and cerebral palsy. TEACCH-based curriculum with vocational training for older students.',
      tags: ['Special School', 'TEACCH', 'Vocational', 'Life Skills'],
      services: ['Special Education', 'Vocational Training', 'Life Skills'],
      conditions: ['autism', 'down_syndrome', 'cerebral_palsy'],
      address: 'A-1 Nizamuddin West, New Delhi 110013',
      city: 'delhi', state: 'Delhi', country: 'India',
      phone: '011-24354601', email: 'tamana@vsnl.net', website: 'https://tamana.org',
      workingHours: 'Mon–Sat 8:30am–3pm',
      lat: 28.5938, lng: 77.2423,
      isVerified: true, isActive: true,
      approvedBy: founder.id, approvedAt: new Date(),
    },
    {
      name: 'Fortis Child Development Unit Bangalore',
      type: ResourceType.HOSPITAL,
      description: 'Paediatric neurology and developmental paediatrics. Autism and ADHD diagnostic clinics with multidisciplinary team including developmental paediatrician, child psychologist, speech therapist and OT.',
      tags: ['Paediatric Neurology', 'Diagnosis', 'OT', 'Speech', 'Multidisciplinary'],
      services: ['Paediatric Neurology', 'Diagnosis', 'OT', 'Speech Therapy', 'Psychology'],
      conditions: ['autism', 'adhd', 'developmental_delay'],
      address: 'Bannerghatta Road, Bangalore 560076',
      city: 'bangalore', state: 'Karnataka', country: 'India',
      phone: '1800-500-1116', email: 'contactus@fortis.in', website: 'https://fortishealthcare.com',
      workingHours: 'Mon–Sat 9am–6pm',
      lat: 12.8924, lng: 77.5981,
      isVerified: true, isActive: true,
      approvedBy: founder.id, approvedAt: new Date(),
    },
    {
      name: 'iCall — Free Mental Health Helpline',
      type: ResourceType.PARENT_SUPPORT,
      description: 'Free confidential counselling run by TISS Mumbai. Specialists in caregiver burnout and autism parent support. Available Monday to Saturday 8am to 10pm.',
      tags: ['Free', 'Counselling', 'Parent Support', 'Burnout', 'Hindi & English'],
      services: ['Counselling', 'Parent Support', 'Crisis Intervention'],
      conditions: ['autism', 'adhd', 'developmental_delay'],
      address: 'Online + Phone — Pan India',
      city: 'all', state: 'Pan India', country: 'India',
      phone: '9152987821', email: 'icall@tiss.edu', website: 'https://icallpsy.org',
      workingHours: 'Mon–Sat 8am–10pm',
      isVerified: true, isActive: true,
      approvedBy: founder.id, approvedAt: new Date(),
    },
    {
      name: 'Special Olympics Bharat',
      type: ResourceType.SPORTS,
      description: 'Free sports programs and competitions for children with intellectual disabilities. 18 sports disciplines available. Local chapters in all major Indian cities.',
      tags: ['Free', 'Swimming', 'Athletics', 'Football', 'Inclusive', 'All Cities'],
      services: ['Swimming', 'Athletics', 'Football', 'Gymnastics', 'Equestrian'],
      conditions: ['autism', 'adhd', 'intellectual_disability'],
      address: 'Pan India — local chapters nationwide',
      city: 'all', state: 'Pan India', country: 'India',
      phone: '011-40177300', email: 'info@specialolympicsbharat.org', website: 'https://specialolympicsbharat.org',
      workingHours: 'Varies by chapter',
      isVerified: true, isActive: true,
      approvedBy: founder.id, approvedAt: new Date(),
    },
    {
      name: 'Disability Affairs — Government Schemes Portal',
      type: ResourceType.GOVT,
      description: 'Official Government of India portal for UDID certificate, ADIP scheme, National Trust registration, and all central disability welfare schemes.',
      tags: ['UDID', 'ADIP', 'National Trust', 'RPwD Act', 'Free'],
      services: ['UDID Certificate', 'ADIP Scheme', 'National Trust', 'Welfare Schemes'],
      conditions: ['autism', 'adhd', 'all'],
      address: 'Online Portal — All India',
      city: 'all', state: 'Pan India', country: 'India',
      phone: '1800-11-4321', website: 'https://disabilityaffairs.gov.in',
      workingHours: '24/7 Online',
      isVerified: true, isActive: true,
      approvedBy: founder.id, approvedAt: new Date(),
    },
    {
      name: 'Ayushman Parent Support Circle — Bangalore',
      type: ResourceType.PARENT_SUPPORT,
      description: 'Monthly parent meetup in Bangalore — share, learn and grow with other families navigating autism. Free. Also available online for families across India.',
      tags: ['Free', 'Community', 'Monthly', 'Bangalore', 'Online Available'],
      services: ['Parent Support Group', 'Community', 'Resource Navigation'],
      conditions: ['autism', 'adhd', 'developmental_delay'],
      address: 'Kodichikhnahallai, Bangalore 560076',
      city: 'bangalore', state: 'Karnataka', country: 'India',
      phone: '+91 82800 56665', email: 'ayushmans@outlook.in', website: 'https://ayushman.world',
      workingHours: 'Every 2nd Saturday 10am',
      lat: 12.9197, lng: 77.6820,
      isVerified: true, isActive: true,
      approvedBy: founder.id, approvedAt: new Date(),
    },
  ]

  for (const resource of resources) {
    await prisma.resource.upsert({
      where: { id: resource.name.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 36) },
      update: { isVerified: true },
      create: {
        id: resource.name.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 36),
        ...resource,
      },
    })
  }
  console.log(`✅ ${resources.length} resources seeded`)

  // ─── Videos ─────────────────────────────────────────
  const videos = [
    { title: 'What is ASD? Complete Guide for Parents', youtubeId: 'Oo4f-eDkzIM', category: 'diagnosis', language: 'english', source: 'Temple Grandin Institute', duration: '18:24', tags: ['ASD basics', 'First steps'], isIndiaSpecific: false },
    { title: 'Early Signs of Autism in Toddlers (0–3 years)', youtubeId: 'YV4tAHqSgEk', category: 'diagnosis', language: 'english', ageGroup: '0-3', source: 'CDC', duration: '12:10', tags: ['Early signs', 'Toddlers'], isIndiaSpecific: false },
    { title: 'बच्चे में ऑटिज्म के शुरुआती संकेत — Hindi Guide', youtubeId: 'nriyRyLFBxE', category: 'diagnosis', language: 'hindi', source: 'NIMHANS', duration: '15:30', tags: ['Hindi', 'India', 'Early signs'], isIndiaSpecific: true },
    { title: 'ABA Therapy Explained — Parent Guide', youtubeId: '7V9EaXaHKLo', category: 'therapy', language: 'english', source: 'Dr. Mary Barbera', duration: '28:05', tags: ['ABA', 'Home therapy'], isIndiaSpecific: false },
    { title: 'Occupational Therapy at Home — 10 Activities', youtubeId: 'qlMwG1uLKQI', category: 'therapy', language: 'english', ageGroup: '3-12', source: 'OT Mom', duration: '16:42', tags: ['OT', 'Home activities'], isIndiaSpecific: false },
    { title: 'Speech Therapy for Non-Verbal Autism Children', youtubeId: 'ln3gFMUHaFI', category: 'communication', language: 'english', ageGroup: '2-8', source: 'ASHA', duration: '22:10', tags: ['Non-verbal', 'Speech', 'AAC'], isIndiaSpecific: false },
    { title: 'Sensory Meltdowns vs Tantrums — Key Differences', youtubeId: 'TGRohivQqd0', category: 'sensory', language: 'english', source: 'OT Mom', duration: '12:18', tags: ['Meltdowns', 'Sensory'], isIndiaSpecific: false },
    { title: 'Sensory Diet for Autism — How to Create One', youtubeId: 'h2yAtfzVNJQ', category: 'sensory', language: 'english', source: 'The Sensory Spectrum', duration: '24:30', tags: ['Sensory diet', 'OT'], isIndiaSpecific: false },
    { title: 'IEP — Advocate for Your Child at School', youtubeId: 'YCJmELjYDcg', category: 'school', language: 'english', ageGroup: '6-18', source: 'Autism Speaks', duration: '15:42', tags: ['IEP', 'School rights', 'Advocacy'], isIndiaSpecific: false },
    { title: 'RPwD Act 2016 — Your Child\'s Rights in India', youtubeId: 'bHUqKrTxH2I', category: 'school', language: 'english', source: 'Disability Rights India', duration: '26:00', tags: ['RPwD', 'Legal rights', 'India'], isIndiaSpecific: true },
    { title: 'Parent Burnout & Caregiver Fatigue — Recovery', youtubeId: 'xN4hXJCXSMw', category: 'parent', language: 'english', source: 'Autism Parent Magazine', duration: '35:20', tags: ['Burnout', 'Parent wellbeing'], isIndiaSpecific: false },
    { title: 'ऑटिज्म में माता-पिता का मानसिक स्वास्थ्य', youtubeId: 'Kn7m1QHZKLQ', category: 'parent', language: 'hindi', source: 'iCall TISS India', duration: '22:30', tags: ['Hindi', 'Parent mental health', 'India'], isIndiaSpecific: true },
    { title: 'ADHD Explained — Causes, Symptoms & Treatments', youtubeId: 'ouZrZa5pLXk', category: 'adhd', language: 'english', source: 'How to ADHD', duration: '14:20', tags: ['ADHD', 'Overview', 'Symptoms'], isIndiaSpecific: false },
    { title: 'ADHD in the Classroom — Strategies That Work', youtubeId: 'wNM1mIwf4CU', category: 'adhd', language: 'english', ageGroup: '6-12', source: 'ADDitude Magazine', duration: '19:50', tags: ['ADHD', 'School', 'Teachers'], isIndiaSpecific: false },
    { title: 'Planning for Your Autistic Child\'s Future (18+)', youtubeId: 'mE4i2RcezGw', category: 'parent', language: 'english', ageGroup: '12-18', source: 'Autism Society of America', duration: '44:10', tags: ['Future planning', 'Adult autism'], isIndiaSpecific: false },
  ]

  for (const video of videos) {
    await prisma.video.upsert({
      where: { youtubeId: video.youtubeId },
      update: {},
      create: { ...video, isVerified: true, isActive: true },
    })
  }
  console.log(`✅ ${videos.length} videos seeded`)

  // ─── Forum Categories ────────────────────────────────
  const categories = [
    { name: 'Getting Started', slug: 'getting-started', description: 'New to autism? Start here.', icon: '🌱', sortOrder: 1 },
    { name: 'Therapy & Interventions', slug: 'therapy', description: 'ABA, speech, OT, sensory integration and more.', icon: '🧠', sortOrder: 2 },
    { name: 'School & Education', slug: 'school', description: 'IEPs, inclusive schools, rights and advocacy.', icon: '🏫', sortOrder: 3 },
    { name: 'Parent Wellbeing', slug: 'parent-wellbeing', description: 'Self-care, burnout, relationships and support.', icon: '💚', sortOrder: 4 },
    { name: 'Government Schemes', slug: 'govt-schemes', description: 'UDID, ADIP, National Trust and state schemes.', icon: '📋', sortOrder: 5 },
    { name: 'Resources & Reviews', slug: 'resources', description: 'Reviews and recommendations for centres near you.', icon: '📍', sortOrder: 6 },
    { name: 'ADHD', slug: 'adhd', description: 'ADHD-specific discussion and support.', icon: '⚡', sortOrder: 7 },
    { name: 'Research & Science', slug: 'research', description: 'Latest research, studies and evidence-based practice.', icon: '🔬', sortOrder: 8 },
  ]

  for (const cat of categories) {
    await prisma.forumCategory.upsert({
      where: { slug: cat.slug },
      update: {},
      create: { ...cat, isActive: true },
    })
  }
  console.log(`✅ ${categories.length} forum categories seeded`)

  console.log('\n✅ Database seeding complete!')
  console.log('─────────────────────────────────────')
  console.log(`Founder: ayushmans@outlook.in / Ayushman@Founder2026!`)
  console.log(`Admin:   admin@ayushman.world / Ayushman@Admin2026!`)
  console.log('─────────────────────────────────────')
}

main()
  .catch((error: unknown) => {
    console.error('Seed failed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
