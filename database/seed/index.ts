import { PrismaClient, ResourceType, UserRole } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding Ayushman database...')

  // ── Admin user ──
  const adminHash = await bcrypt.hash('Ayushman@Admin2026!', 12)
  await prisma.user.upsert({
    where: { email: 'ayushmans@outlook.in' },
    update: {},
    create: {
      email: 'ayushmans@outlook.in',
      name: 'BK Satpathy',
      passwordHash: adminHash,
      role: UserRole.FOUNDER,
      isVerified: true,
      country: 'India',
      state: 'Karnataka',
      city: 'Bangalore',
    },
  })
  console.log('✅ Admin user created')

  // ── Resources ──
  const resources = [
    {
      name: 'NIMHANS — Child & Adolescent Psychiatry',
      type: ResourceType.HOSPITAL,
      description: "India's premier neuroscience institution. Offers govt-subsidised autism, ADHD diagnosis and treatment. Child psychiatry OPD available Monday–Saturday.",
      tags: ['Diagnosis', 'Child Psychiatry', 'Neurology', 'OPD', 'Subsidised'],
      address: 'Hosur Road, Bangalore 560029',
      city: 'bangalore', state: 'Karnataka', country: 'India',
      phone: '080-46110007', email: 'info@nimhans.ac.in', website: 'https://nimhans.ac.in',
      workingHours: 'Mon–Sat 9am–5pm',
      lat: 12.9447, lng: 77.5946,
      services: ['Diagnosis', 'Child Psychiatry', 'OT', 'Speech Therapy'],
      conditions: ['autism', 'adhd', 'developmental_delay'],
      isVerified: true, isActive: true,
    },
    {
      name: 'Action For Autism (AFA)',
      type: ResourceType.RESEARCH,
      description: "India's leading autism advocacy organisation. ABA therapy, parent training, inclusive education resources and legal support for school admission cases.",
      tags: ['ABA', 'Advocacy', 'Legal Support', 'Parent Training', 'Inclusive Education'],
      address: 'Community Centre, Sheikh Sarai Phase 1, New Delhi 110017',
      city: 'delhi', state: 'Delhi', country: 'India',
      phone: '011-26972114', email: 'contact@autism.net.in', website: 'https://actionforautism.org',
      workingHours: 'Mon–Fri 9am–5pm',
      lat: 28.5294, lng: 77.2101,
      services: ['ABA Therapy', 'Parent Training', 'Legal Aid', 'Inclusive Education'],
      conditions: ['autism', 'adhd'],
      isVerified: true, isActive: true,
    },
    {
      name: 'Tamana Special Education Centre',
      type: ResourceType.SCHOOL,
      description: 'Specialised school for children with autism, Down syndrome and cerebral palsy. TEACCH-based curriculum with vocational training for older students.',
      tags: ['Special School', 'TEACCH', 'Vocational', 'Life Skills'],
      address: 'A-1 Nizamuddin West, New Delhi 110013',
      city: 'delhi', state: 'Delhi', country: 'India',
      phone: '011-24354601', email: 'tamana@vsnl.net', website: 'https://tamana.org',
      workingHours: 'Mon–Sat 8:30am–3pm',
      lat: 28.5938, lng: 77.2423,
      services: ['Special Education', 'Vocational Training', 'Life Skills'],
      conditions: ['autism', 'down_syndrome', 'cerebral_palsy'],
      isVerified: true, isActive: true,
    },
    {
      name: 'Sethu — Autism School Chennai',
      type: ResourceType.SCHOOL,
      description: 'TEACCH methodology and sensory integration. Structured low-ratio classrooms. One of South India\'s most reputed autism schools.',
      tags: ['TEACCH', 'Sensory Integration', 'Small Classes', 'South India'],
      address: '7 Ashok Nagar, Chennai 600083',
      city: 'chennai', state: 'Tamil Nadu', country: 'India',
      phone: '044-23711196', email: 'sethu@sethu.org', website: 'https://sethu.org',
      workingHours: 'Mon–Fri 8am–3:30pm',
      lat: 13.0219, lng: 80.2249,
      services: ['Special Education', 'Sensory Integration'],
      conditions: ['autism'],
      isVerified: true, isActive: true,
    },
    {
      name: 'AACT Applied Behaviour Centre Mumbai',
      type: ResourceType.THERAPY,
      description: 'ABA therapy, early intervention, social skills groups and parent training workshops. BCBA-supervised therapy teams.',
      tags: ['ABA', 'BCBA', 'Early Intervention', 'Social Skills', 'Parent Training'],
      address: 'Andheri West, Mumbai 400058',
      city: 'mumbai', state: 'Maharashtra', country: 'India',
      phone: '022-26734521', email: 'info@aact.org.in', website: 'https://aact.org.in',
      workingHours: 'Mon–Sat 9am–7pm',
      lat: 19.1395, lng: 72.8296,
      feeSession: 150000, // ₹1500 in paise
      services: ['ABA Therapy', 'Early Intervention', 'Social Skills Groups'],
      conditions: ['autism', 'adhd'],
      isVerified: true, isActive: true,
    },
    {
      name: 'Fortis Child Development Unit',
      type: ResourceType.HOSPITAL,
      description: 'Paediatric neurology, developmental paediatrics, child psychology. Autism & ADHD diagnostic clinics with multidisciplinary teams.',
      tags: ['Paediatric Neurology', 'Diagnosis', 'OT', 'Speech', 'Multidisciplinary'],
      address: 'Bannerghatta Road, Bangalore 560076',
      city: 'bangalore', state: 'Karnataka', country: 'India',
      phone: '1800-500-1116', email: 'contactus@fortis.in', website: 'https://fortishealthcare.com',
      workingHours: 'Mon–Sat 9am–6pm',
      lat: 12.8924, lng: 77.5981,
      services: ['Paediatric Neurology', 'Diagnosis', 'OT', 'Speech Therapy'],
      conditions: ['autism', 'adhd', 'developmental_delay'],
      isVerified: true, isActive: true,
    },
    {
      name: 'iCall — Free Mental Health Helpline',
      type: ResourceType.PARENT_SUPPORT,
      description: 'Free confidential counselling for families. Specialists in caregiver burnout and autism parent support. Available Mon–Sat 8am–10pm.',
      tags: ['Free', 'Counselling', 'Parent Support', 'Burnout', 'Hindi & English'],
      address: 'Online + Phone (Pan India)',
      city: 'all', state: 'Pan India', country: 'India',
      phone: '9152987821', email: 'icall@tiss.edu', website: 'https://icallpsy.org',
      workingHours: 'Mon–Sat 8am–10pm',
      services: ['Counselling', 'Parent Support', 'Crisis Intervention'],
      conditions: ['autism', 'adhd', 'developmental_delay'],
      isVerified: true, isActive: true,
    },
    {
      name: 'Special Olympics Bharat',
      type: ResourceType.SPORTS,
      description: 'Free sports programs and competitions for children with intellectual disabilities. 18+ sports. Chapters in all major Indian cities.',
      tags: ['Free', 'Swimming', 'Athletics', 'Football', 'Inclusive', 'All Cities'],
      address: 'Pan India — local chapters nationwide',
      city: 'all', state: 'Pan India', country: 'India',
      phone: '011-40177300', email: 'info@specialolympicsbharat.org',
      website: 'https://specialolympicsbharat.org',
      workingHours: 'Varies by chapter',
      services: ['Swimming', 'Athletics', 'Football', 'Gymnastics'],
      conditions: ['autism', 'adhd', 'intellectual_disability'],
      isVerified: true, isActive: true,
    },
    {
      name: 'Disability Affairs — Govt Schemes Portal',
      type: ResourceType.GOVT,
      description: 'Official government portal for UDID certificate, ADIP scheme, National Trust registration, and all central disability welfare schemes.',
      tags: ['UDID', 'ADIP', 'National Trust', 'RPwD Act', 'Govt', 'Free'],
      address: 'Online Portal — All India',
      city: 'all', state: 'Pan India', country: 'India',
      phone: '1800-11-4321', website: 'https://disabilityaffairs.gov.in',
      workingHours: '24/7 Online',
      services: ['UDID Certificate', 'ADIP Scheme', 'National Trust', 'Welfare Schemes'],
      conditions: ['autism', 'adhd', 'all'],
      isVerified: true, isActive: true,
    },
    {
      name: 'Ayushman Parent Support Circle — Bangalore',
      type: ResourceType.PARENT_SUPPORT,
      description: 'Monthly parent meetup in Bangalore — share, learn and grow with other families navigating autism. Free. Also available online for families across India.',
      tags: ['Free', 'Community', 'Monthly', 'Bangalore', 'Online Available'],
      address: 'Kodichikhnahallai, Bangalore 560076',
      city: 'bangalore', state: 'Karnataka', country: 'India',
      phone: '+91 82800 56665', email: 'ayushmans@outlook.in', website: 'https://ayushman.world',
      workingHours: 'Every 2nd Saturday 10am',
      lat: 12.9197, lng: 77.6820,
      services: ['Parent Support Group', 'Community', 'Resource Navigation'],
      conditions: ['autism', 'adhd', 'developmental_delay'],
      isVerified: true, isActive: true,
    },
  ]

  for (const r of resources) {
    await prisma.resource.upsert({
      where: { id: r.name.toLowerCase().replace(/\s+/g, '-').slice(0, 30) },
      update: { isVerified: r.isVerified },
      create: {
        id: r.name.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 30),
        ...r,
      },
    })
  }
  console.log(`✅ ${resources.length} resources seeded`)

  // ── Videos ──
  const videos = [
    { title: 'What is ASD? Complete Guide for Parents', youtubeId: 'Oo4f-eDkzIM', category: 'diagnosis', language: 'english', source: 'Temple Grandin Institute', duration: '18:24', tags: ['ASD basics', 'First steps', 'Diagnosis'] },
    { title: 'Early Signs of Autism in Toddlers (0–3 years)', youtubeId: 'YV4tAHqSgEk', category: 'diagnosis', language: 'english', ageGroup: '0-3', source: 'CDC', duration: '12:10', tags: ['Early signs', 'Toddlers', 'Screening'] },
    { title: 'बच्चे में ऑटिज्म के शुरुआती संकेत', youtubeId: 'nriyRyLFBxE', category: 'diagnosis', language: 'hindi', isIndiaSpecific: true, source: 'NIMHANS', duration: '15:30', tags: ['Hindi', 'India', 'Early signs'] },
    { title: 'ABA Therapy Explained — What Parents Need to Know', youtubeId: '7V9EaXaHKLo', category: 'therapy', language: 'english', source: 'Dr. Mary Barbera', duration: '28:05', tags: ['ABA', 'Home therapy', 'Basics'] },
    { title: 'Speech Therapy for Non-Verbal Autism Children', youtubeId: 'ln3gFMUHaFI', category: 'communication', language: 'english', ageGroup: '2-8', source: 'ASHA', duration: '22:10', tags: ['Non-verbal', 'Speech', 'AAC'] },
    { title: 'Sensory Meltdowns vs Tantrums — Key Differences', youtubeId: 'TGRohivQqd0', category: 'sensory', language: 'english', source: 'OT Mom', duration: '12:18', tags: ['Meltdowns', 'Sensory', 'De-escalation'] },
    { title: 'IEP — How to Advocate for Your Child at School', youtubeId: 'YCJmELjYDcg', category: 'school', language: 'english', ageGroup: '6-18', source: 'Autism Speaks', duration: '15:42', tags: ['IEP', 'School rights', 'Advocacy'] },
    { title: 'RPwD Act 2016 — Your Child\'s Rights in India', youtubeId: 'bHUqKrTxH2I', category: 'school', language: 'english', isIndiaSpecific: true, source: 'Disability Rights India', duration: '26:00', tags: ['RPwD', 'Legal rights', 'India'] },
    { title: 'Parent Burnout & Caregiver Fatigue — Recovery', youtubeId: 'xN4hXJCXSMw', category: 'parent', language: 'english', source: 'Autism Parent Magazine', duration: '35:20', tags: ['Burnout', 'Parent wellbeing', 'Self-care'] },
    { title: 'ADHD Explained — Causes, Symptoms & Treatments', youtubeId: 'ouZrZa5pLXk', category: 'adhd', language: 'english', source: 'How to ADHD', duration: '14:20', tags: ['ADHD', 'Overview', 'Symptoms'] },
    { title: 'Occupational Therapy at Home — 10 Easy Activities', youtubeId: 'qlMwG1uLKQI', category: 'therapy', language: 'english', ageGroup: '3-12', source: 'OT Mom', duration: '16:42', tags: ['OT', 'Home activities', 'Motor skills'] },
    { title: 'Sensory Diet for Autism — How to Create One', youtubeId: 'h2yAtfzVNJQ', category: 'sensory', language: 'english', source: 'The Sensory Spectrum', duration: '24:30', tags: ['Sensory diet', 'OT', 'Daily routine'] },
    { title: 'ऑटिज्म में संचार कैसे बढ़ाएं — Hindi Guide', youtubeId: 'mCbDSqb4Kko', category: 'communication', language: 'hindi', isIndiaSpecific: true, source: 'Action For Autism India', duration: '18:00', tags: ['Hindi', 'Communication', 'AAC'] },
    { title: 'ADHD in the Classroom — Strategies That Work', youtubeId: 'wNM1mIwf4CU', category: 'adhd', language: 'english', ageGroup: '6-12', source: 'ADDitude Magazine', duration: '19:50', tags: ['ADHD', 'School', 'Teachers'] },
    { title: 'Grief & Acceptance — A Parent\'s Autism Journey', youtubeId: '2LQqUBpqkNs', category: 'parent', language: 'english', source: 'Autism Society of America', duration: '41:00', tags: ['Grief', 'Acceptance', 'Journey'] },
  ]

  for (const v of videos) {
    await prisma.video.upsert({
      where: { youtubeId: v.youtubeId },
      update: {},
      create: { ...v, isVerified: true, isActive: true },
    })
  }
  console.log(`✅ ${videos.length} videos seeded`)

  console.log('✅ Database seeding complete!')
}

main()
  .catch((e) => { console.error('Seed failed:', e); process.exit(1) })
  .finally(() => prisma.$disconnect())
