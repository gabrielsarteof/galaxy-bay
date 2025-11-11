import { NFTMetadataBuilder } from '../metadata-builder';

/**
 * Testes unitários para NFTMetadataBuilder
 *
 * Cobertura:
 * - Construção de metadata básica
 * - Todos os tipos de atributos OpenSea
 * - Validação de campos obrigatórios
 * - Método builder pattern (fluent API)
 */
describe('NFTMetadataBuilder', () => {
  let builder: NFTMetadataBuilder;

  beforeEach(() => {
    builder = new NFTMetadataBuilder();
  });

  describe('Informações Básicas', () => {
    it('deve definir informações básicas corretamente', () => {
      const metadata = builder
        .setBasicInfo('Test NFT', 'Description', 'QmTest123')
        .build();

      expect(metadata.name).toBe('Test NFT');
      expect(metadata.description).toBe('Description');
      expect(metadata.image).toBe('ipfs://QmTest123');
    });

    it('deve adicionar prefixo ipfs:// automaticamente', () => {
      const metadata = builder
        .setBasicInfo('Test', 'Desc', 'QmTest123')
        .build();

      expect(metadata.image).toBe('ipfs://QmTest123');
      expect(metadata.image).not.toBe('QmTest123');
    });

    it('deve retornar builder para encadeamento', () => {
      const result = builder.setBasicInfo('Test', 'Desc', 'QmTest123');
      expect(result).toBe(builder);
    });
  });

  describe('URLs Opcionais', () => {
    it('deve definir URL externa', () => {
      const metadata = builder
        .setBasicInfo('Test', 'Desc', 'QmTest123')
        .setExternalURL('https://galaxybay.io/nft/1')
        .build();

      expect(metadata.external_url).toBe('https://galaxybay.io/nft/1');
    });

    it('deve definir cor de fundo sem #', () => {
      const metadata = builder
        .setBasicInfo('Test', 'Desc', 'QmTest123')
        .setBackgroundColor('#1a1a2e')
        .build();

      expect(metadata.background_color).toBe('1a1a2e');
      expect(metadata.background_color).not.toContain('#');
    });

    it('deve definir URL de animação', () => {
      const metadata = builder
        .setBasicInfo('Test', 'Desc', 'QmTest123')
        .setAnimationURL('QmAnimation123')
        .build();

      expect(metadata.animation_url).toBe('ipfs://QmAnimation123');
    });

    it('deve definir URL do YouTube', () => {
      const metadata = builder
        .setBasicInfo('Test', 'Desc', 'QmTest123')
        .setYouTubeURL('https://youtube.com/watch?v=abc123')
        .build();

      expect(metadata.youtube_url).toBe('https://youtube.com/watch?v=abc123');
    });
  });

  describe('Atributos de Texto', () => {
    it('deve adicionar atributo de texto simples', () => {
      const metadata = builder
        .setBasicInfo('Test', 'Desc', 'QmTest123')
        .addTextAttribute('Artist', '0x123...')
        .build();

      expect(metadata.attributes).toHaveLength(1);
      expect(metadata.attributes[0]).toEqual({
        trait_type: 'Artist',
        value: '0x123...',
      });
    });

    it('deve adicionar múltiplos atributos de texto', () => {
      const metadata = builder
        .setBasicInfo('Test', 'Desc', 'QmTest123')
        .addTextAttribute('Artist', '0x123...')
        .addTextAttribute('Location', 'Galaxy Bay')
        .addTextAttribute('Style', 'Abstract')
        .build();

      expect(metadata.attributes).toHaveLength(3);
      expect(metadata.attributes[1].trait_type).toBe('Location');
    });
  });

  describe('Atributos Numéricos', () => {
    it('deve adicionar atributo numérico com display_type', () => {
      const metadata = builder
        .setBasicInfo('Test', 'Desc', 'QmTest123')
        .addNumericAttribute('Generation', 1)
        .build();

      expect(metadata.attributes[0]).toEqual({
        trait_type: 'Generation',
        value: 1,
        display_type: 'number',
      });
    });

    it('deve aceitar números decimais', () => {
      const metadata = builder
        .setBasicInfo('Test', 'Desc', 'QmTest123')
        .addNumericAttribute('Score', 98.5)
        .build();

      expect(metadata.attributes[0].value).toBe(98.5);
    });
  });

  describe('Boost Numbers', () => {
    it('deve adicionar boost absoluto com max_value padrão', () => {
      const metadata = builder
        .setBasicInfo('Test', 'Desc', 'QmTest123')
        .addBoostNumber('Power', 85)
        .build();

      expect(metadata.attributes[0]).toEqual({
        trait_type: 'Power',
        value: 85,
        display_type: 'boost_number',
        max_value: 100,
      });
    });

    it('deve adicionar boost absoluto com max_value customizado', () => {
      const metadata = builder
        .setBasicInfo('Test', 'Desc', 'QmTest123')
        .addBoostNumber('Health', 500, 1000)
        .build();

      expect(metadata.attributes[0].max_value).toBe(1000);
    });
  });

  describe('Boost Percentages', () => {
    it('deve adicionar boost percentual', () => {
      const metadata = builder
        .setBasicInfo('Test', 'Desc', 'QmTest123')
        .addBoostPercentage('Speed Boost', 25)
        .build();

      expect(metadata.attributes[0]).toEqual({
        trait_type: 'Speed Boost',
        value: 25,
        display_type: 'boost_percentage',
      });
    });
  });

  describe('Atributos de Data', () => {
    it('deve adicionar data como Unix timestamp', () => {
      const timestamp = Math.floor(Date.now() / 1000);
      const metadata = builder
        .setBasicInfo('Test', 'Desc', 'QmTest123')
        .addDateAttribute('Created', timestamp)
        .build();

      expect(metadata.attributes[0]).toEqual({
        trait_type: 'Created',
        value: timestamp,
        display_type: 'date',
      });
    });
  });

  describe('Encadeamento de Métodos (Fluent API)', () => {
    it('deve permitir encadeamento completo', () => {
      const metadata = builder
        .setBasicInfo('Galaxy NFT #1', 'A stunning artwork', 'QmTest123')
        .setExternalURL('https://galaxybay.io/nft/1')
        .setBackgroundColor('#1a1a2e')
        .addTextAttribute('Artist', '0x123...')
        .addTextAttribute('Location', 'Galaxy Bay')
        .addNumericAttribute('Generation', 1)
        .addBoostNumber('Power', 85, 100)
        .addBoostPercentage('Speed Boost', 25)
        .addDateAttribute('Created', 1699056000)
        .build();

      expect(metadata.name).toBe('Galaxy NFT #1');
      expect(metadata.attributes).toHaveLength(6);
    });
  });

  describe('Validação no Build', () => {
    it('deve lançar erro se name não foi definido', () => {
      expect(() => builder.build()).toThrow('campo "name" é obrigatório');
    });

    it('deve lançar erro se description não foi definido', () => {
      builder.setBasicInfo('Test', '', 'QmTest123');

      // Reset description para undefined
      (builder as any).metadata.description = undefined;

      expect(() => builder.build()).toThrow('campo "description" é obrigatório');
    });

    it('deve lançar erro se image não foi definido', () => {
      (builder as any).metadata.name = 'Test';
      (builder as any).metadata.description = 'Desc';

      expect(() => builder.build()).toThrow('campo "image" é obrigatório');
    });

    it('deve validar antes de retornar metadata', () => {
      // Sem definir nada
      expect(() => builder.build()).toThrow();

      // Definir apenas name
      (builder as any).metadata.name = 'Test';
      expect(() => builder.build()).toThrow();

      // Definir name + description
      (builder as any).metadata.description = 'Desc';
      expect(() => builder.build()).toThrow();

      // Definir tudo - deve passar
      (builder as any).metadata.image = 'ipfs://QmTest123';
      expect(() => builder.build()).not.toThrow();
    });
  });

  describe('Metadata Completa OpenSea-Compatible', () => {
    it('deve gerar metadata válida para OpenSea', () => {
      const metadata = builder
        .setBasicInfo(
          'Sunset at Galaxy Bay #42',
          'A stunning photograph captured at golden hour',
          'QmVLwvmGehsrNEvhcCnnsw5RQNseohgEkFNN1848zNzdng'
        )
        .setExternalURL('https://galaxybay.io/nft/42')
        .setBackgroundColor('#1a1a2e')
        .addTextAttribute('Artist', '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb')
        .addTextAttribute('Location', 'Galaxy Bay')
        .addTextAttribute('Camera', 'Canon EOS R5')
        .addTextAttribute('Rarity', 'Rare')
        .addNumericAttribute('Edition', 42)
        .addDateAttribute('Captured', 1699056000)
        .build();

      // Validar estrutura
      expect(metadata).toHaveProperty('name');
      expect(metadata).toHaveProperty('description');
      expect(metadata).toHaveProperty('image');
      expect(metadata).toHaveProperty('external_url');
      expect(metadata).toHaveProperty('background_color');
      expect(metadata).toHaveProperty('attributes');

      // Validar types
      expect(typeof metadata.name).toBe('string');
      expect(typeof metadata.description).toBe('string');
      expect(metadata.image).toMatch(/^ipfs:\/\//);
      expect(Array.isArray(metadata.attributes)).toBe(true);
      expect(metadata.attributes.length).toBeGreaterThan(0);

      // Validar formato de atributos
      metadata.attributes.forEach(attr => {
        expect(attr).toHaveProperty('trait_type');
        expect(attr).toHaveProperty('value');
      });
    });

    it('deve ser válida sem campos opcionais', () => {
      const metadata = builder
        .setBasicInfo('Minimal NFT', 'Minimal description', 'QmTest123')
        .build();

      expect(metadata.name).toBe('Minimal NFT');
      expect(metadata.description).toBe('Minimal description');
      expect(metadata.image).toBe('ipfs://QmTest123');
      expect(metadata.attributes).toEqual([]);
      expect(metadata.external_url).toBeUndefined();
      expect(metadata.background_color).toBeUndefined();
    });
  });

  describe('Casos de Uso Reais', () => {
    it('deve criar metadata para NFT de arte digital', () => {
      const metadata = builder
        .setBasicInfo('Digital Artwork #1', 'Abstract composition', 'QmArt123')
        .addTextAttribute('Artist', 'John Doe')
        .addTextAttribute('Style', 'Abstract')
        .addTextAttribute('Medium', 'Digital')
        .addNumericAttribute('Year', 2024)
        .build();

      expect(metadata.attributes).toHaveLength(4);
      expect(metadata.attributes[0].value).toBe('John Doe');
    });

    it('deve criar metadata para NFT de fotografia', () => {
      const metadata = builder
        .setBasicInfo('Landscape Photo #42', 'Sunset at the beach', 'QmPhoto123')
        .setExternalURL('https://portfolio.com/photo/42')
        .addTextAttribute('Photographer', 'Jane Smith')
        .addTextAttribute('Location', 'Malibu Beach')
        .addTextAttribute('Camera', 'Sony A7IV')
        .addTextAttribute('ISO', '100')
        .addTextAttribute('Aperture', 'f/2.8')
        .addDateAttribute('Captured', 1699056000)
        .build();

      expect(metadata.attributes).toHaveLength(6);
      expect(metadata.external_url).toBeDefined();
    });

    it('deve criar metadata para NFT de gaming', () => {
      const metadata = builder
        .setBasicInfo('Legendary Sword', 'A powerful weapon', 'QmSword123')
        .addTextAttribute('Type', 'Weapon')
        .addTextAttribute('Rarity', 'Legendary')
        .addBoostNumber('Attack', 95, 100)
        .addBoostNumber('Defense', 45, 100)
        .addBoostPercentage('Critical Hit', 15)
        .addNumericAttribute('Level', 50)
        .build();

      const boostAttrs = metadata.attributes.filter(
        attr => attr.display_type === 'boost_number'
      );
      expect(boostAttrs).toHaveLength(2);
    });
  });

  describe('Edge Cases', () => {
    it('deve rejeitar string vazia como name', () => {
      expect(() => {
        builder.setBasicInfo('', 'Desc', 'QmTest123').build();
      }).toThrow('campo "name" é obrigatório');
    });

    it('deve lidar com valores numéricos zero', () => {
      const metadata = builder
        .setBasicInfo('Test', 'Desc', 'QmTest123')
        .addNumericAttribute('Score', 0)
        .addBoostNumber('Power', 0, 100)
        .build();

      expect(metadata.attributes[0].value).toBe(0);
      expect(metadata.attributes[1].value).toBe(0);
    });

    it('deve lidar com valores numéricos negativos', () => {
      const metadata = builder
        .setBasicInfo('Test', 'Desc', 'QmTest123')
        .addNumericAttribute('Temperature', -10)
        .build();

      expect(metadata.attributes[0].value).toBe(-10);
    });

    it('deve lidar com caracteres especiais em strings', () => {
      const metadata = builder
        .setBasicInfo('Test "NFT" #1 <>', 'Desc with & symbols', 'QmTest123')
        .addTextAttribute('Artist', 'Name with "quotes" & symbols')
        .build();

      expect(metadata.name).toContain('"');
      expect(metadata.attributes[0].value).toContain('&');
    });
  });
});
