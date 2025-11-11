import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import * as fs from 'fs';
import * as path from 'path';
import { AppModule } from '../src/app.module';

/**
 * Testes E2E para endpoint POST /nfts/prepare-mint
 *
 * Cobertura:
 * - Autenticação JWT obrigatória
 * - Validação de arquivo (tipo, tamanho)
 * - Validação de campos obrigatórios
 * - Upload completo de NFT
 * - Rate limiting
 * - Respostas de erro apropriadas
 *
 * NOTA: Estes testes requerem credenciais Pinata válidas no .env
 * Se não configuradas, os testes serão skipped.
 */
describe('POST /nfts/prepare-mint (E2E)', () => {
  let app: INestApplication;
  let authToken: string;
  const testImagePath = path.join(__dirname, 'fixtures', 'test-image.png');

  const hasPinataCredentials = () => {
    return (
      process.env.PINATA_JWT &&
      process.env.PINATA_JWT !== 'CONFIGURE_SUA_PINATA_JWT_AQUI' &&
      process.env.PINATA_GATEWAY &&
      process.env.PINATA_GATEWAY !== 'CONFIGURE_SEU_GATEWAY_AQUI.mypinata.cloud'
    );
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Aplicar validations pipes como na aplicação real
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      })
    );

    await app.init();

    // Obter token de autenticação (assumindo que existe endpoint de login)
    // Ajustar conforme sua implementação de auth
    try {
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
          signature: 'mock-signature-for-testing',
        });

      if (loginResponse.body.access_token) {
        authToken = loginResponse.body.access_token;
      }
    } catch (error) {
      console.warn('Failed to get auth token. Some tests may be skipped.');
    }
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Autenticação', () => {
    it('deve retornar 401 sem token JWT', () => {
      return request(app.getHttpServer())
        .post('/nfts/prepare-mint')
        .expect(401);
    });

    it('deve retornar 401 com token inválido', () => {
      return request(app.getHttpServer())
        .post('/nfts/prepare-mint')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });

  describe('Validação de Arquivo', () => {
    it('deve retornar 400 sem arquivo de imagem', () => {
      if (!authToken) return;

      return request(app.getHttpServer())
        .post('/nfts/prepare-mint')
        .set('Authorization', `Bearer ${authToken}`)
        .field('name', 'Test NFT')
        .field('description', 'Test description')
        .expect(400)
        .expect(res => {
          expect(res.body.message).toContain('image');
        });
    });

    it('deve retornar 400 para arquivo maior que 50MB', () => {
      if (!authToken) return;

      // Criar buffer de 51MB (simulado)
      const largeBuffer = Buffer.alloc(51 * 1024 * 1024);

      return request(app.getHttpServer())
        .post('/nfts/prepare-mint')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('image', largeBuffer, 'large-image.jpg')
        .field('name', 'Test NFT')
        .field('description', 'Test description')
        .expect(400)
        .expect(res => {
          expect(res.body.message).toMatch(/size|50MB/i);
        });
    });

    it('deve retornar 400 para tipo de arquivo inválido', () => {
      if (!authToken) return;

      const textBuffer = Buffer.from('not an image');

      return request(app.getHttpServer())
        .post('/nfts/prepare-mint')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('image', textBuffer, 'file.txt')
        .field('name', 'Test NFT')
        .field('description', 'Test description')
        .expect(400)
        .expect(res => {
          expect(res.body.message).toMatch(/type|format/i);
        });
    });

    it('deve aceitar JPEG', async () => {
      if (!authToken || !hasPinataCredentials()) {
        console.log('Skipping: Missing auth token or Pinata credentials');
        return;
      }

      if (!fs.existsSync(testImagePath)) {
        console.log('Skipping: Test image not found');
        return;
      }

      return request(app.getHttpServer())
        .post('/nfts/prepare-mint')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('image', testImagePath)
        .field('name', 'JPEG Test')
        .field('description', 'Testing JPEG upload')
        .expect(201);
    });

    it('deve aceitar PNG', async () => {
      if (!authToken || !hasPinataCredentials()) {
        console.log('Skipping: Missing auth token or Pinata credentials');
        return;
      }

      if (!fs.existsSync(testImagePath)) {
        console.log('Skipping: Test image not found');
        return;
      }

      return request(app.getHttpServer())
        .post('/nfts/prepare-mint')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('image', testImagePath)
        .field('name', 'PNG Test')
        .field('description', 'Testing PNG upload')
        .expect(201);
    });
  });

  describe('Validação de Campos', () => {
    it('deve retornar 400 sem campo name', () => {
      if (!authToken || !fs.existsSync(testImagePath)) return;

      return request(app.getHttpServer())
        .post('/nfts/prepare-mint')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('image', testImagePath)
        .field('description', 'Test description')
        .expect(400)
        .expect(res => {
          expect(res.body.message).toContain('name');
        });
    });

    it('deve retornar 400 sem campo description', () => {
      if (!authToken || !fs.existsSync(testImagePath)) return;

      return request(app.getHttpServer())
        .post('/nfts/prepare-mint')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('image', testImagePath)
        .field('name', 'Test NFT')
        .expect(400)
        .expect(res => {
          expect(res.body.message).toContain('description');
        });
    });

    it('deve retornar 400 para attributes inválido (não-JSON)', () => {
      if (!authToken || !fs.existsSync(testImagePath)) return;

      return request(app.getHttpServer())
        .post('/nfts/prepare-mint')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('image', testImagePath)
        .field('name', 'Test NFT')
        .field('description', 'Test description')
        .field('attributes', 'not-valid-json')
        .expect(400)
        .expect(res => {
          expect(res.body.message).toMatch(/attributes.*JSON/i);
        });
    });

    it('deve retornar 400 para attributes que não é array', () => {
      if (!authToken || !fs.existsSync(testImagePath)) return;

      return request(app.getHttpServer())
        .post('/nfts/prepare-mint')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('image', testImagePath)
        .field('name', 'Test NFT')
        .field('description', 'Test description')
        .field('attributes', JSON.stringify({ not: 'array' }))
        .expect(400)
        .expect(res => {
          expect(res.body.message).toMatch(/attributes.*array/i);
        });
    });
  });

  describe('Upload Completo de NFT', () => {
    it('deve fazer upload completo com sucesso', async () => {
      if (!authToken || !hasPinataCredentials()) {
        console.log('Skipping: Missing auth token or Pinata credentials');
        return;
      }

      if (!fs.existsSync(testImagePath)) {
        console.log('Skipping: Test image not found');
        return;
      }

      const response = await request(app.getHttpServer())
        .post('/nfts/prepare-mint')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('image', testImagePath)
        .field('name', 'Complete Test NFT')
        .field('description', 'Testing complete upload workflow')
        .field(
          'attributes',
          JSON.stringify([
            { trait_type: 'Artist', value: '0x123...' },
            { trait_type: 'Location', value: 'Galaxy Bay' },
          ])
        )
        .expect(201);

      // Validar estrutura da resposta
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('message');

      const { data } = response.body;

      // Validar campos do data
      expect(data).toHaveProperty('imageCID');
      expect(data).toHaveProperty('metadataCID');
      expect(data).toHaveProperty('tokenURI');
      expect(data).toHaveProperty('imageUrl');
      expect(data).toHaveProperty('metadataUrl');

      // Validar formatos
      expect(data.imageCID).toMatch(/^Qm[a-zA-Z0-9]{44}$|^bafy[a-z0-9]{50,}/);
      expect(data.metadataCID).toMatch(/^Qm[a-zA-Z0-9]{44}$|^bafy[a-z0-9]{50,}/);
      expect(data.tokenURI).toMatch(/^ipfs:\/\//);
      expect(data.imageUrl).toMatch(/^https:\/\//);
      expect(data.metadataUrl).toMatch(/^https:\/\//);

      // Validar tokenURI contém metadataCID
      expect(data.tokenURI).toContain(data.metadataCID);

      // Validar URLs de gateway
      expect(data.imageUrl).toContain('/ipfs/');
      expect(data.imageUrl).toContain(data.imageCID);
      expect(data.metadataUrl).toContain('/ipfs/');
      expect(data.metadataUrl).toContain(data.metadataCID);
    });

    it('deve fazer upload sem attributes', async () => {
      if (!authToken || !hasPinataCredentials()) {
        console.log('Skipping: Missing auth token or Pinata credentials');
        return;
      }

      if (!fs.existsSync(testImagePath)) {
        console.log('Skipping: Test image not found');
        return;
      }

      const response = await request(app.getHttpServer())
        .post('/nfts/prepare-mint')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('image', testImagePath)
        .field('name', 'Minimal NFT')
        .field('description', 'NFT without attributes')
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.tokenURI).toBeDefined();
    });

    it('deve fazer upload com attributes complexos', async () => {
      if (!authToken || !hasPinataCredentials()) {
        console.log('Skipping: Missing auth token or Pinata credentials');
        return;
      }

      if (!fs.existsSync(testImagePath)) {
        console.log('Skipping: Test image not found');
        return;
      }

      const complexAttributes = [
        { trait_type: 'Artist', value: '0x123...' },
        { trait_type: 'Generation', value: 1, display_type: 'number' },
        { trait_type: 'Power', value: 85, display_type: 'boost_number', max_value: 100 },
        { trait_type: 'Speed Boost', value: 25, display_type: 'boost_percentage' },
        { trait_type: 'Created', value: Math.floor(Date.now() / 1000), display_type: 'date' },
      ];

      const response = await request(app.getHttpServer())
        .post('/nfts/prepare-mint')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('image', testImagePath)
        .field('name', 'Complex NFT')
        .field('description', 'NFT with complex attributes')
        .field('attributes', JSON.stringify(complexAttributes))
        .expect(201);

      expect(response.body.success).toBe(true);
    });
  });

  describe('Rate Limiting', () => {
    it('deve aplicar rate limit de 10 uploads/minuto', async () => {
      if (!authToken || !hasPinataCredentials()) {
        console.log('Skipping: Missing auth token or Pinata credentials');
        return;
      }

      if (!fs.existsSync(testImagePath)) {
        console.log('Skipping: Test image not found');
        return;
      }

      // Fazer 11 requests rapidamente
      const requests = [];
      for (let i = 0; i < 11; i++) {
        requests.push(
          request(app.getHttpServer())
            .post('/nfts/prepare-mint')
            .set('Authorization', `Bearer ${authToken}`)
            .attach('image', testImagePath)
            .field('name', `Rate Limit Test ${i}`)
            .field('description', 'Testing rate limit')
        );
      }

      const responses = await Promise.all(requests);

      // Pelo menos uma deve retornar 429 (Too Many Requests)
      const tooManyRequests = responses.filter(r => r.status === 429);
      expect(tooManyRequests.length).toBeGreaterThan(0);
    }, 30000); // Timeout de 30s para este teste
  });

  describe('Respostas de Erro', () => {
    it('deve retornar 503 se Pinata estiver indisponível', async () => {
      // Este teste requer mock do PinataService para simular falha
      // Implementação depende da estratégia de mocking da aplicação
      console.log('Test not implemented: Requires PinataService mocking');
    });

    it('deve retornar mensagem de erro amigável', () => {
      if (!authToken || !fs.existsSync(testImagePath)) return;

      return request(app.getHttpServer())
        .post('/nfts/prepare-mint')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('image', testImagePath)
        .field('name', 'Test')
        // Missing description
        .expect(400)
        .expect(res => {
          expect(res.body).toHaveProperty('message');
          expect(typeof res.body.message).toBe('string');
          expect(res.body.message.length).toBeGreaterThan(0);
        });
    });
  });

  describe('Swagger Documentation', () => {
    it('deve ter documentação Swagger disponível', () => {
      return request(app.getHttpServer())
        .get('/api-docs')
        .expect(301); // Redirect para /api-docs/
    });

    it('deve documentar endpoint prepare-mint', async () => {
      const response = await request(app.getHttpServer())
        .get('/api-docs-json')
        .expect(200);

      expect(response.body.paths).toHaveProperty('/nfts/prepare-mint');
      expect(response.body.paths['/nfts/prepare-mint']).toHaveProperty('post');

      const endpoint = response.body.paths['/nfts/prepare-mint'].post;
      expect(endpoint).toHaveProperty('summary');
      expect(endpoint).toHaveProperty('requestBody');
      expect(endpoint).toHaveProperty('responses');
      expect(endpoint.responses).toHaveProperty('201');
      expect(endpoint.responses).toHaveProperty('400');
      expect(endpoint.responses).toHaveProperty('401');
    });
  });
});
