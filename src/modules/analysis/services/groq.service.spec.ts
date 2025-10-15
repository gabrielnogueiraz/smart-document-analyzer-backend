import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { BadRequestException } from '@nestjs/common';

import { GroqService } from './groq.service';

describe('GroqService', () => {
  let service: GroqService;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    const mockConfigService = {
      get: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GroqService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<GroqService>(GroqService);
    configService = module.get(ConfigService);

    // Setup default config mocks
    configService.get.mockImplementation((key: string) => {
      const config = {
        GROQ_API_URL: 'https://api.groq.com/openai/v1/chat/completions',
        GROQ_MODEL: 'llama-3-8b-8192',
      };
      return config[key];
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('analyzeDocument', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should have analyzeDocument method', () => {
      expect(typeof service.analyzeDocument).toBe('function');
    });

    it('should throw BadRequestException for empty text', async () => {
      await expect(service.analyzeDocument('', 'test-key'))
        .rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for null text', async () => {
      await expect(service.analyzeDocument(null as any, 'test-key'))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('limitTextLength', () => {
    it('should limit text length correctly', () => {
      const longText = 'A'.repeat(10000);
      const result = (service as any).limitTextLength(longText, 1000);
      expect(result.length).toBeLessThanOrEqual(1003); // Allow for "..."
    });

    it('should not modify short text', () => {
      const shortText = 'Short text';
      const result = (service as any).limitTextLength(shortText, 1000);
      expect(result).toBe(shortText);
    });
  });

  describe('buildAnalysisPrompt', () => {
    it('should build prompt with custom instructions', () => {
      const text = 'Test document';
      const customPrompt = 'Focus on security';
      const result = (service as any).buildAnalysisPrompt(text, customPrompt);
      
      expect(result).toContain(text);
      expect(result).toContain(customPrompt);
    });

    it('should build prompt without custom instructions', () => {
      const text = 'Test document';
      const result = (service as any).buildAnalysisPrompt(text);
      
      expect(result).toContain(text);
      expect(result).not.toContain('Instruções adicionais');
    });
  });
});