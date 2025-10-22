import request from 'supertest'
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'

const { createServer } = await import('../../../server')

let app: ReturnType<typeof createServer>

describe('Application mode routes', () => {
  beforeAll(() => {
    app = createServer()
  })

  beforeEach(async () => {
    await request(app).post('/api/mode').send({ mode: 'real', actor: 'tests' })
  })

  it('returns current application mode', async () => {
    const response = await request(app).get('/api/mode')

    expect(response.status).toBe(200)
    expect(response.body.mode).toBe('real')
    expect(response.body.updatedAt).toBeDefined()
  })

  it('allows switching to preview mode', async () => {
    const response = await request(app)
      .post('/api/mode')
      .send({ mode: 'preview', actor: 'unit-test', note: 'switching to preview' })

    expect(response.status).toBe(200)
    expect(response.body.mode).toBe('preview')
    expect(response.body.lastActor).toBe('unit-test')

    const followUp = await request(app).get('/api/mode')
    expect(followUp.body.mode).toBe('preview')
  })

  it('rejects invalid modes', async () => {
    const response = await request(app)
      .post('/api/mode')
      .send({ mode: 'invalid' })

    expect(response.status).toBe(400)
    expect(response.body.message).toBe('Invalid application mode')
  })
})
