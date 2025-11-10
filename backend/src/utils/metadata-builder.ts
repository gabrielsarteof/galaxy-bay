/**
 * Builder para construir metadata OpenSea-compatible de forma type-safe
 *
 * Evita erros de estrutura e garante conformidade com padrão
 */
export class NFTMetadataBuilder {
  private metadata: {
    name?: string;
    description?: string;
    image?: string;
    external_url?: string;
    background_color?: string;
    animation_url?: string;
    youtube_url?: string;
    attributes: Array<{
      trait_type: string;
      value: string | number;
      display_type?: string;
      max_value?: number;
    }>;
  } = {
    attributes: [],
  };

  /**
   * Define informações básicas (obrigatórias)
   */
  setBasicInfo(name: string, description: string, imageCID: string): this {
    this.metadata.name = name;
    this.metadata.description = description;
    this.metadata.image = `ipfs://${imageCID}`;
    return this;
  }

  /**
   * Define URL externa (website do projeto/artista)
   */
  setExternalURL(url: string): this {
    this.metadata.external_url = url;
    return this;
  }

  /**
   * Define cor de fundo (hex sem #)
   *
   * Exemplo: setBackgroundColor('#1a1a2e') → background_color: '1a1a2e'
   */
  setBackgroundColor(hexColor: string): this {
    this.metadata.background_color = hexColor.replace('#', '');
    return this;
  }

  /**
   * Define URL de animação/vídeo (MP4, WebM)
   */
  setAnimationURL(cid: string): this {
    this.metadata.animation_url = `ipfs://${cid}`;
    return this;
  }

  /**
   * Define URL do YouTube
   */
  setYouTubeURL(url: string): this {
    this.metadata.youtube_url = url;
    return this;
  }

  /**
   * Adiciona atributo de texto
   *
   * Renderizado como tag simples no OpenSea
   */
  addTextAttribute(traitType: string, value: string): this {
    this.metadata.attributes.push({
      trait_type: traitType,
      value,
    });
    return this;
  }

  /**
   * Adiciona atributo numérico
   *
   * Renderizado com estatísticas (min, max, avg)
   */
  addNumericAttribute(traitType: string, value: number): this {
    this.metadata.attributes.push({
      trait_type: traitType,
      value,
      display_type: 'number',
    });
    return this;
  }

  /**
   * Adiciona boost absoluto
   *
   * Renderizado como progress bar (ex: 50/100)
   */
  addBoostNumber(traitType: string, value: number, maxValue: number = 100): this {
    this.metadata.attributes.push({
      trait_type: traitType,
      value,
      display_type: 'boost_number',
      max_value: maxValue,
    });
    return this;
  }

  /**
   * Adiciona boost percentual
   *
   * Renderizado como "+X%" com ícone
   */
  addBoostPercentage(traitType: string, value: number): this {
    this.metadata.attributes.push({
      trait_type: traitType,
      value,
      display_type: 'boost_percentage',
    });
    return this;
  }

  /**
   * Adiciona data (Unix timestamp)
   *
   * Renderizado formatado (ex: "Nov 10, 2025")
   */
  addDateAttribute(traitType: string, timestamp: number): this {
    this.metadata.attributes.push({
      trait_type: traitType,
      value: timestamp,
      display_type: 'date',
    });
    return this;
  }

  /**
   * Constrói metadata final
   *
   * Valida campos obrigatórios antes de retornar
   */
  build(): Record<string, any> {
    if (!this.metadata.name) {
      throw new Error('Metadata inválida: campo "name" é obrigatório');
    }
    if (!this.metadata.description) {
      throw new Error('Metadata inválida: campo "description" é obrigatório');
    }
    if (!this.metadata.image) {
      throw new Error('Metadata inválida: campo "image" é obrigatório');
    }

    return this.metadata;
  }
}
