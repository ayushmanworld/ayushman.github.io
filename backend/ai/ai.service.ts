import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import Anthropic from '@anthropic-ai/sdk'
import { PrismaService } from '../src/prisma/prisma.service'
import { AskQueryDto } from './dto/ask-query.dto'

@Injectable()
export class AIService {
  private readonly logger = new Logger(AIService.name)
  private readonly anthropic: Anthropic

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    this.anthropic = new Anthropic({
      apiKey: this.config.get('ANTHROPIC_API_KEY'),
    })
  }

  async query(dto: AskQueryDto): Promise<{
    answer: string
    sources: Array<{ name: string; url?: string }>
    sessionId: string
    tokens: number
  }> {
    this.logger.log(`AI Query: "${dto.query}" | city: ${dto.city} | lang: ${dto.language}`)

    // 1. Retrieve relevant knowledge chunks via pgvector similarity search
    const relevantChunks = await this.retrieveContext(dto.query, dto.language || 'en')

    // 2. Retrieve relevant resources from DB
    const resources = await this.prisma.resource.findMany({
      where: {
        isVerified: true,
        isActive: true,
        OR: [
          { city: dto.city?.toLowerCase() },
          { city: 'all' },
        ],
      },
      take: 5,
      select: {
        name: true, type: true, city: true, state: true,
        phone: true, website: true, description: true, services: true,
      },
    })

    // 3. Build system prompt
    const systemPrompt = this.buildSystemPrompt(relevantChunks, resources, dto)

    // 4. Get/create AI session
    let session = dto.sessionId
      ? await this.prisma.aISession.findUnique({ where: { sessionId: dto.sessionId } })
      : null

    const history = (session?.turns as any[]) || []

    // 5. Call Claude
    const messages: Anthropic.MessageParam[] = [
      ...history.map((t: any) => ({
        role: t.role as 'user' | 'assistant',
        content: t.content,
      })),
      { role: 'user', content: dto.query },
    ]

    const response = await this.anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: systemPrompt,
      messages,
    })

    const answer = response.content[0].type === 'text' ? response.content[0].text : ''
    const tokens = response.usage.input_tokens + response.usage.output_tokens

    // 6. Extract sources mentioned
    const sources = this.extractSources(answer, resources)

    // 7. Save/update session
    const newTurns = [
      ...history,
      { role: 'user', content: dto.query, timestamp: new Date() },
      { role: 'assistant', content: answer, timestamp: new Date() },
    ]

    const sessionRecord = await this.prisma.aISession.upsert({
      where: { sessionId: dto.sessionId || 'new-' + Date.now() },
      update: { turns: newTurns, totalTokens: { increment: tokens } },
      create: {
        sessionId: dto.sessionId || crypto.randomUUID(),
        userId: dto.userId,
        turns: newTurns,
        totalTokens: tokens,
      },
    })

    return {
      answer,
      sources,
      sessionId: sessionRecord.sessionId,
      tokens,
    }
  }

  private buildSystemPrompt(
    chunks: any[],
    resources: any[],
    dto: AskQueryDto,
  ): string {
    const context = chunks.map((c) => c.content).join('\n\n')
    const resourceList = resources
      .map((r) => `- ${r.name} (${r.type}) in ${r.city}: ${r.phone || ''} — ${r.description?.slice(0, 100)}`)
      .join('\n')

    return `You are Ayushman's compassionate AI assistant — a knowledgeable guide helping Indian families of children with autism, ADHD, and developmental disabilities.

Your role:
- Answer questions about autism, ADHD, therapy options, schools, government schemes, and legal rights
- Provide practical, actionable advice grounded in evidence
- Be warm, empathetic and non-judgmental
- Always give India-specific information when possible
- Recommend specific resources from the database when relevant
- Know that families are often overwhelmed — keep answers clear and calming

User context:
- Location: ${dto.city || 'India'}
- Child's age: ${dto.childAge || 'unknown'}
- Diagnosis: ${dto.diagnosis || 'unknown'}
- Language preference: ${dto.language || 'en'}

Knowledge base context:
${context}

Available verified resources near the user:
${resourceList}

Guidelines:
- Always recommend calling us at +91 82800 56665 for urgent help
- For mental health crises, recommend iCall: 9152987821
- Cite specific resources by name when recommending them
- If unsure, say so honestly rather than guessing
- Keep responses under 300 words unless detail is needed
- Format with clear sections when answering multi-part questions
- In Hindi queries, respond in Hindi
- Never give specific medical diagnoses — direct to qualified professionals`
  }

  private async retrieveContext(query: string, language: string): Promise<any[]> {
    try {
      // Simple keyword search as fallback (replace with pgvector similarity in production)
      const chunks = await this.prisma.knowledgeChunk.findMany({
        where: {
          language,
          OR: [
            { content: { contains: query, mode: 'insensitive' } },
            { category: { in: this.detectCategories(query) } },
          ],
        },
        take: 5,
        orderBy: { createdAt: 'desc' },
      })
      return chunks
    } catch {
      return []
    }
  }

  private detectCategories(query: string): string[] {
    const q = query.toLowerCase()
    const cats: string[] = []
    if (q.includes('therapy') || q.includes('aba') || q.includes('speech')) cats.push('therapy')
    if (q.includes('school') || q.includes('education') || q.includes('iep')) cats.push('school')
    if (q.includes('diagnos') || q.includes('assessment')) cats.push('diagnosis')
    if (q.includes('government') || q.includes('scheme') || q.includes('udid')) cats.push('govt')
    if (cats.length === 0) cats.push('general')
    return cats
  }

  private extractSources(
    answer: string,
    resources: any[],
  ): Array<{ name: string; url?: string }> {
    return resources
      .filter((r) => answer.toLowerCase().includes(r.name.toLowerCase()))
      .map((r) => ({ name: r.name, url: r.website }))
      .slice(0, 3)
  }

  async logFeedback(sessionId: string, helpful: boolean, comment?: string) {
    await this.prisma.aISession.update({
      where: { sessionId },
      data: {
        feedbackScore: helpful ? 1 : -1,
        feedbackNote: comment,
      },
    })
  }

  async getSuggestions(partial: string): Promise<string[]> {
    const common = [
      'What to do after autism diagnosis',
      'Schools for autism in Bangalore',
      'ABA therapy cost in India',
      'Government schemes for autism',
      'How to manage meltdowns',
      'Speech therapy for non-verbal child',
      'ADHD medication alternatives',
      'Special Olympics near me',
    ]
    return common.filter((s) => s.toLowerCase().includes(partial.toLowerCase())).slice(0, 5)
  }
}
