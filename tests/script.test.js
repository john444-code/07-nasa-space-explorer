/**
 * Unit Tests for NASA APOD Gallery
 * Tests core functions: fetch logic, error handling, and rendering
 * 
 * Run with: npm test
 */

// Mock setup for the DOM elements before importing script
const createMockElement = (id) => {
  const el = document.createElement('div');
  el.id = id;
  document.body.appendChild(el);
  return el;
};

// Create mock elements
createMockElement('startDate');
createMockElement('endDate');
createMockElement('getButton');
createMockElement('gallery');
createMockElement('randomFact');
createMockElement('modal');
createMockElement('modalOverlay');
createMockElement('modalClose');
createMockElement('modalBody');

// Mock dateRange.js function
global.setupDateInputs = jest.fn();

// Fetch mock
global.fetch = jest.fn();

describe('NASA APOD Gallery Tests', () => {
  
  // Test 1: fetchApodRange returns array of items
  describe('fetchApodRange', () => {
    it('should return an array of APOD items on success', async () => {
      const mockData = [
        {
          date: '2026-04-03',
          title: 'Test Image 1',
          url: 'https://example.com/image1.jpg',
          hdurl: 'https://example.com/image1_hd.jpg',
          media_type: 'image',
          explanation: 'Test explanation'
        }
      ];

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData
      });

      const result = await fetchApodRange('2026-04-01', '2026-04-03');
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(1);
      expect(result[0].title).toBe('Test Image 1');
    });

    it('should throw error on API failure', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 429
      });

      await expect(fetchApodRange('2026-04-01', '2026-04-03')).rejects.toThrow();
    });

    it('should convert single object response to array', async () => {
      const mockData = {
        date: '2026-04-03',
        title: 'Single Image',
        url: 'https://example.com/image.jpg',
        media_type: 'image'
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData
      });

      const result = await fetchApodRange('2026-04-03', '2026-04-03');
      expect(Array.isArray(result)).toBe(true);
      expect(result[0].title).toBe('Single Image');
    });
  });

  // Test 2: renderGallery displays correct number of items
  describe('renderGallery', () => {
    beforeEach(() => {
      document.getElementById('gallery').innerHTML = '';
    });

    it('should render gallery items for image media type', () => {
      const items = [
        {
          date: '2026-04-03',
          title: 'Image 1',
          url: 'https://example.com/1.jpg',
          media_type: 'image',
          explanation: 'Explanation 1'
        }
      ];

      renderGallery(items);
      const cards = document.querySelectorAll('.gallery-item');
      expect(cards.length).toBe(1);
    });

    it('should render multiple gallery items', () => {
      const items = [
        {
          date: '2026-04-03',
          title: 'Image 1',
          url: 'https://example.com/1.jpg',
          media_type: 'image'
        },
        {
          date: '2026-04-02',
          title: 'Image 2',
          url: 'https://example.com/2.jpg',
          media_type: 'image'
        },
        {
          date: '2026-04-01',
          title: 'Video 1',
          url: 'https://youtube.com/watch?v=abc123',
          media_type: 'video'
        }
      ];

      renderGallery(items);
      const cards = document.querySelectorAll('.gallery-item');
      expect(cards.length).toBe(3);
    });

    it('should show placeholder when items array is empty', () => {
      renderGallery([]);
      const placeholder = document.querySelector('.placeholder');
      expect(placeholder).toBeTruthy();
      expect(placeholder.textContent).toContain('No images found');
    });

    it('should add aria attributes for accessibility', () => {
      const items = [
        {
          date: '2026-04-03',
          title: 'Test Image',
          url: 'https://example.com/1.jpg',
          media_type: 'image'
        }
      ];

      renderGallery(items);
      const card = document.querySelector('.gallery-item');
      expect(card.getAttribute('role')).toBe('article');
      expect(card.getAttribute('aria-label')).toContain('Test Image');
    });
  });

  // Test 3: Error handling
  describe('showError', () => {
    beforeEach(() => {
      document.getElementById('gallery').innerHTML = '';
    });

    it('should display error message with alert role', () => {
      showError('Custom error message');
      const errorDiv = document.querySelector('[role="alert"]');
      expect(errorDiv).toBeTruthy();
      expect(errorDiv.textContent).toContain('Custom error message');
    });
  });

  // Test 4: Loading state
  describe('showLoading', () => {
    beforeEach(() => {
      document.getElementById('gallery').innerHTML = '';
    });

    it('should display loading message with status role', () => {
      showLoading();
      const statusDiv = document.querySelector('[role="status"]');
      expect(statusDiv).toBeTruthy();
      expect(statusDiv.textContent).toContain('Loading space photos');
    });

    it('should have aria-live polite for announcements', () => {
      showLoading();
      const statusDiv = document.querySelector('[role="status"]');
      expect(statusDiv.getAttribute('aria-live')).toBe('polite');
    });
  });

  // Test 5: Random fact selection
  describe('showRandomFact', () => {
    it('should select from SPACE_FACTS array', () => {
      showRandomFact();
      const factText = document.getElementById('randomFact').textContent;
      expect(factText).toContain('Did you know?');
      // Verify it's one of our facts
      const isFact = SPACE_FACTS.some(fact => factText.includes(fact));
      expect(isFact).toBe(true);
    });
  });

  // Test 6: Modal functionality
  describe('openModal', () => {
    it('should remove hidden class from modal', () => {
      const item = {
        title: 'Test',
        date: '2026-04-03',
        url: 'https://example.com/test.jpg',
        media_type: 'image',
        explanation: 'Test explanation'
      };

      openModal(item);
      expect(modal.classList.contains('hidden')).toBe(false);
    });

    it('should set aria-hidden to false when opening', () => {
      const item = {
        title: 'Test',
        date: '2026-04-03',
        url: 'https://example.com/test.jpg',
        media_type: 'image',
        explanation: 'Test'
      };

      openModal(item);
      expect(modal.getAttribute('aria-hidden')).toBe('false');
    });
  });

  describe('closeModal', () => {
    it('should add hidden class to modal', () => {
      modal.classList.remove('hidden');
      closeModal();
      expect(modal.classList.contains('hidden')).toBe(true);
    });

    it('should set aria-hidden to true when closing', () => {
      modal.classList.remove('hidden');
      closeModal();
      expect(modal.getAttribute('aria-hidden')).toBe('true');
    });
  });

  // Test 7: Request validation
  describe('Button click handler', () => {
    beforeEach(() => {
      document.getElementById('startDate').value = '';
      document.getElementById('endDate').value = '';
    });

    it('should show error when dates are not selected', async () => {
      // Simulate clicking button without dates
      const event = new Event('click');
      getButton.dispatchEvent(event);
      
      // Wait for async handler
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const errorDiv = document.querySelector('[role="alert"]');
      expect(errorDiv).toBeTruthy();
    });
  });
});

// Export functions for testing (if using modules)
// module.exports = { fetchApodRange, renderGallery, showError, showLoading };
