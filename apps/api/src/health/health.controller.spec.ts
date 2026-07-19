import { Test, type TestingModule } from '@nestjs/testing'
import { HealthController } from './health.controller'

describe('HealthController', () => {
  let controller: HealthController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
    }).compile()

    controller = module.get<HealthController>(HealthController)
  })

  describe('check()', () => {
    it('returns status ok', () => {
      const result = controller.check()
      expect(result.status).toBe('ok')
    })

    it('returns a valid ISO timestamp', () => {
      const result = controller.check()
      expect(() => new Date(result.timestamp)).not.toThrow()
      expect(new Date(result.timestamp).getTime()).toBeGreaterThan(0)
    })

    it('returns a non-negative uptime', () => {
      const result = controller.check()
      expect(result.uptime).toBeGreaterThanOrEqual(0)
    })

    it('returns version string', () => {
      const result = controller.check()
      expect(typeof result.version).toBe('string')
    })

    it('returns environment string', () => {
      const result = controller.check()
      expect(typeof result.environment).toBe('string')
    })
  })

  describe('ready()', () => {
    it('returns status ok', () => {
      const result = controller.ready()
      expect(result.status).toBe('ok')
    })

    it('returns a valid ISO timestamp', () => {
      const result = controller.ready()
      expect(() => new Date(result.timestamp)).not.toThrow()
    })
  })
})
