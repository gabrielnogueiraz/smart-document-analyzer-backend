import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';

import { PdfExtractionService } from './pdf-extraction.service';

// Mock pdf-parse
jest.mock('pdf-parse', () => {
  return jest.fn();
});

describe('PdfExtractionService', () => {
  let service: PdfExtractionService;
  let mockPdfParse: jest.MockedFunction<any>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PdfExtractionService],
    }).compile();

    service = module.get<PdfExtractionService>(PdfExtractionService);
    
    // Get the mocked function
    const pdfParse = require('pdf-parse');
    mockPdfParse = pdfParse;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('extractTextFromBuffer', () => {
    it('should extract text successfully', async () => {
      const mockBuffer = Buffer.from('mock pdf content');
      const mockText = 'This is extracted text from PDF\n\nWith multiple paragraphs.';
      
      mockPdfParse.mockResolvedValue({
        text: mockText,
        numpages: 1,
        info: {},
      });

      const result = await service.extractTextFromBuffer(mockBuffer);

      expect(mockPdfParse).toHaveBeenCalledWith(mockBuffer, {
        max: 0,
        version: 'v1.10.100',
      });
      expect(result).toBe('This is extracted text from PDF\n\nWith multiple paragraphs.');
    });

    it('should throw BadRequestException if no text extracted', async () => {
      const mockBuffer = Buffer.from('mock pdf content');
      
      mockPdfParse.mockResolvedValue({
        text: '',
        numpages: 1,
        info: {},
      });

      await expect(service.extractTextFromBuffer(mockBuffer))
        .rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if pdf-parse fails', async () => {
      const mockBuffer = Buffer.from('invalid pdf content');
      
      mockPdfParse.mockRejectedValue(new Error('Invalid PDF'));

      await expect(service.extractTextFromBuffer(mockBuffer))
        .rejects.toThrow(BadRequestException);
    });

    it('should clean and normalize extracted text', async () => {
      const mockBuffer = Buffer.from('mock pdf content');
      const messyText = 'Text   with   multiple    spaces\r\n\r\n\r\nAnd line breaks';
      
      mockPdfParse.mockResolvedValue({
        text: messyText,
        numpages: 1,
        info: {},
      });

      const result = await service.extractTextFromBuffer(mockBuffer);

      expect(result).toBe('Text with multiple spaces\n\nAnd line breaks');
    });
  });

  describe('validatePdfBuffer', () => {
    it('should return true for valid PDF buffer', async () => {
      const validPdfBuffer = Buffer.from('%PDF-1.4\n%Some PDF content');
      
      const result = await service.validatePdfBuffer(validPdfBuffer);
      
      expect(result).toBe(true);
    });

    it('should return false for invalid PDF buffer', async () => {
      const invalidBuffer = Buffer.from('Not a PDF file');
      
      const result = await service.validatePdfBuffer(invalidBuffer);
      
      expect(result).toBe(false);
    });
  });

  describe('getPdfInfo', () => {
    it('should return PDF information successfully', async () => {
      const mockBuffer = Buffer.from('mock pdf content');
      const mockInfo = {
        numpages: 5,
        info: {
          Title: 'Test Document',
          Author: 'Test Author',
        },
      };
      
      mockPdfParse.mockResolvedValue(mockInfo);

      const result = await service.getPdfInfo(mockBuffer);

      expect(result).toEqual({
        pages: 5,
        info: {
          Title: 'Test Document',
          Author: 'Test Author',
        },
      });
    });

    it('should throw BadRequestException if pdf-parse fails', async () => {
      const mockBuffer = Buffer.from('invalid pdf content');
      
      mockPdfParse.mockRejectedValue(new Error('Invalid PDF'));

      await expect(service.getPdfInfo(mockBuffer))
        .rejects.toThrow(BadRequestException);
    });
  });
});