/**
 * Ayushman RAG Ingestion Pipeline
 *
 * Ingests autism/ADHD knowledge from:
 * - Structured FAQ documents
 * - PDF research papers
 * - Government scheme documentation
 * - WHO / CDC guidelines
 * - Custom curated content
 *
 * Stores as pgvector embeddings in PostgreSQL.
 */

import { PrismaClient } from '@prisma/client'
import Anthropic from '@anthropic-ai/sdk'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// ── Knowledge sources ──────────────────────────────────────

const KNOWLEDGE_BASE: KnowledgeItem[] = [
  // Diagnosis
  {
    content: `What is Autism Spectrum Disorder (ASD)?
Autism Spectrum Disorder (ASD) is a neurodevelopmental condition characterised by differences in social communication, restricted interests, and repetitive behaviours. It is called a "spectrum" because it affects individuals differently and to varying degrees. ASD is not a disease — it is a different way of experiencing the world. In India, approximately 1 in 68 children is estimated to have autism (NIMHANS 2021). Boys are 4x more likely to be diagnosed. Early diagnosis before age 3 leads to dramatically better outcomes.`,
    source: 'Ayushman Knowledge Base — Diagnosis',
    category: 'diagnosis',
    language: 'en',
  },
  {
    content: `Early Signs of Autism in Children Under 3:
- Not responding to their name by 12 months
- Not pointing to objects to show interest by 14 months
- Not playing "pretend" by 18 months
- Avoiding eye contact and wanting to be alone
- Having trouble understanding other people's feelings
- Delayed speech or no speech development
- Repetitive behaviours (rocking, spinning, flapping)
- Being very sensitive to sound, light or touch
- Strong attachment to routines, distress at changes
- Unusual interests (e.g., intense focus on one topic)

If you notice these signs, consult a developmental paediatrician immediately. Early intervention before age 5 gives the best outcomes.`,
    source: 'CDC Autism Signs — Adapted for India',
    sourceUrl: 'https://www.cdc.gov/autism/signs.html',
    category: 'diagnosis',
    language: 'en',
  },

  // Therapy
  {
    content: `ABA Therapy (Applied Behaviour Analysis):
ABA is the most extensively researched intervention for autism, endorsed by WHO, CDC and the American Psychological Association. It breaks skills into small steps and uses positive reinforcement to teach communication, social skills, daily living, and reduce harmful behaviours.

In India: ABA sessions typically cost ₹1,000–₹2,500 per hour. BCBA-certified therapists provide the highest quality ABA. Home-based ABA (parent-trained) is an effective lower-cost option for many families.

Best for: All ages, particularly effective for children under 5. Also beneficial for school-age and adolescents.

Ayushman subsidises ABA therapy for qualifying low-income families. Contact: +91 82800 56665`,
    source: 'Ayushman Therapy Guide — ABA',
    category: 'therapy',
    language: 'en',
  },
  {
    content: `Speech-Language Therapy for Autism:
Speech therapy helps children with communication difficulties — including those who are non-verbal. Techniques include:

1. PECS (Picture Exchange Communication System) — suitable from 18 months
2. PROMPT therapy — addresses motor aspects of speech production
3. Hanen Method — trains parents to be their child's primary language facilitator
4. AAC (Augmentative & Alternative Communication) — iPad apps, speech devices

In India: Speech therapy costs ₹500–₹1,500 per session. Recommended frequency: 3-5 sessions per week for best results.

ASHA (American Speech-Language-Hearing Association) guidelines recommend starting speech therapy as soon as a delay is suspected — do NOT wait for a formal diagnosis.`,
    source: 'ASHA — Speech Therapy Guidelines',
    sourceUrl: 'https://www.asha.org',
    category: 'therapy',
    language: 'en',
  },

  // Schools
  {
    content: `Legal Rights for School Admission in India:
Under the Rights of Persons with Disabilities (RPwD) Act 2016:
- Section 16: All government educational institutions MUST provide inclusive education free of cost
- Section 17: Private unaided institutions must make reasonable accommodations
- Every child with autism/disability is entitled to a "reasonable accommodation" plan
- Schools cannot refuse admission solely on grounds of disability

How to enforce your rights:
1. Send a written request to the Principal citing RPwD Act 2016, Section 16
2. If refused, file a complaint with the District Education Officer (DEO)
3. Escalate to State Commissioner for Persons with Disabilities
4. Legal support available from Action For Autism: 011-26972114

Your child ALSO has the right to:
- A shadow teacher/aide (funded by school or govt)
- Modified examination accommodations
- An Individualised Education Plan (IEP)`,
    source: 'RPwD Act 2016 — Ayushman Legal Guide',
    sourceUrl: 'https://disabilityaffairs.gov.in',
    category: 'school',
    language: 'en',
  },

  // Government Schemes
  {
    content: `Government Schemes for Autism Families in India:

1. UDID Card (Unique Disability ID)
   - Apply at district hospital or online: swavlambancard.gov.in
   - Required for most government benefits
   - Free, processing takes 30-60 days

2. ADIP Scheme (Assistance to Disabled Persons)
   - Free assistive devices: AAC devices, sensory tools, hearing aids
   - For families with income < ₹20,000/month
   - Apply through district welfare office

3. National Trust Schemes (national-trust.nic.in)
   - Niramaya: Health insurance ₹1 lakh/year for ₹250/500 premium
   - Gharaunda: Supported residential care for adults
   - Samarth: Skill development training
   - Disha: Early intervention centres

4. Section 80DD Tax Deduction
   - ₹75,000 deduction for 40-79% disability
   - ₹1,25,000 for 80%+ disability
   - Claim in your annual ITR with disability certificate

5. State Welfare Schemes (vary by state)
   - Karnataka: Monthly disability pension, free education, transport
   - Most states have similar schemes — check your state disability board`,
    source: 'Ayushman Govt Schemes Guide — India',
    sourceUrl: 'https://disabilityaffairs.gov.in',
    category: 'govt',
    language: 'en',
  },

  // Parent Support
  {
    content: `Managing Caregiver Burnout — A Guide for Autism Parents:
Studies show 85% of autism parents experience significant burnout. This is normal and manageable.

Signs of burnout: exhaustion, irritability, social isolation, anxiety, feeling hopeless, physical health decline.

Evidence-based strategies:
1. Respite care — even 2 hours/week makes a difference. Ask relatives, support groups.
2. Join a parent support group — reduces isolation, provides practical tips. Ayushman hosts monthly groups.
3. Exercise — 20-30 minutes daily reduces caregiver stress by 40% (research-backed)
4. Therapy for yourself — iCall offers free counselling: 9152987821
5. Set realistic expectations — progress is not linear. Celebrate small wins.
6. Sleep — prioritise it. A sleep-deprived parent cannot be an effective advocate.
7. Accept imperfection — you are doing enough. You are not alone.

Remember: Your child's best therapy is a regulated, rested parent. Your wellbeing IS their therapy.`,
    source: 'Ayushman Parent Wellbeing Guide',
    category: 'parent',
    language: 'en',
  },

  // Hindi content
  {
    content: `ऑटिज्म क्या है? (What is Autism — Hindi)
ऑटिज्म स्पेक्ट्रम डिसऑर्डर (ASD) एक न्यूरोडेवलपमेंटल कंडीशन है जो सामाजिक संवाद, दोहराने वाले व्यवहार और सीमित रुचियों को प्रभावित करती है।

भारत में हर 68 में से 1 बच्चे को ऑटिज्म हो सकता है।

शुरुआती संकेत:
• 12 महीने तक नाम पर प्रतिक्रिया न देना
• आंख न मिलाना
• बोलने में देरी या बिल्कुल न बोलना
• एक जैसी हरकतें बार-बार करना
• रोजाना के बदलाव से परेशान होना

अगर आपको ये संकेत दिखें, तो तुरंत डॉक्टर से मिलें। जल्दी इलाज से बच्चे का भविष्य बेहतर होता है।

सहायता के लिए Ayushman से संपर्क करें: +91 82800 56665`,
    source: 'Ayushman Hindi Knowledge Base',
    category: 'diagnosis',
    language: 'hi',
  },
]

// ── Embedding generation ───────────────────────────────────

async function generateEmbedding(text: string): Promise<number[]> {
  // Note: Anthropic doesn't have a native embeddings API yet.
  // Use OpenAI's text-embedding-3-small or Cohere's embed for production.
  // This is a placeholder that returns a mock embedding.
  // In production: replace with actual embedding API call.

  // Example with a hypothetical embedding service:
  // const response = await fetch('https://api.cohere.ai/v1/embed', {
  //   method: 'POST',
  //   headers: { Authorization: `Bearer ${process.env.COHERE_API_KEY}` },
  //   body: JSON.stringify({ texts: [text], model: 'embed-multilingual-v3.0', input_type: 'search_document' })
  // })
  // const data = await response.json()
  // return data.embeddings[0]

  // Mock embedding for development (1536 dimensions to match pgvector config)
  return Array.from({ length: 1536 }, () => Math.random() * 2 - 1)
}

// ── Main ingestion ─────────────────────────────────────────

async function ingest() {
  console.log('🚀 Starting Ayushman RAG ingestion pipeline...')
  console.log(`📚 Processing ${KNOWLEDGE_BASE.length} knowledge items`)

  let processed = 0
  let failed = 0

  for (const item of KNOWLEDGE_BASE) {
    try {
      const embedding = await generateEmbedding(item.content)

      await prisma.$executeRaw`
        INSERT INTO knowledge_chunks (id, content, source, source_url, category, language, embedding, created_at, updated_at)
        VALUES (
          ${`chunk-${Date.now()}-${Math.random().toString(36).slice(2)}`},
          ${item.content},
          ${item.source},
          ${item.sourceUrl || null},
          ${item.category},
          ${item.language},
          ${`[${embedding.join(',')}]`}::vector,
          NOW(),
          NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
          content = EXCLUDED.content,
          embedding = EXCLUDED.embedding,
          updated_at = NOW()
      `

      processed++
      console.log(`✅ [${processed}/${KNOWLEDGE_BASE.length}] ${item.source}`)

      // Rate limit
      await new Promise((r) => setTimeout(r, 200))
    } catch (err) {
      failed++
      console.error(`❌ Failed: ${item.source}`, err)
    }
  }

  console.log(`\n🎉 Ingestion complete: ${processed} succeeded, ${failed} failed`)
}

ingest()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())

interface KnowledgeItem {
  content: string
  source: string
  sourceUrl?: string
  category: 'diagnosis' | 'therapy' | 'school' | 'govt' | 'parent' | 'general'
  language: 'en' | 'hi'
}
