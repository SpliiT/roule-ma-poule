import { getDrivingRoute } from '../routing-service';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Routing Service', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        jest.clearAllMocks();
        process.env = { ...originalEnv, NEXT_PUBLIC_MAPTILER_API_KEY: 'test-api-key' };
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    it('should throw an error if API key is missing', async () => {
        delete process.env.NEXT_PUBLIC_MAPTILER_API_KEY;
        await expect(getDrivingRoute([1, 1], [2, 2])).rejects.toThrow('API Key MapTiler manquante');
    });

    it('should return parsed route data on success', async () => {
        const mockResponse = {
            data: {
                features: [
                    {
                        geometry: {
                            coordinates: [[1, 1], [1.5, 1.5], [2, 2]]
                        },
                        properties: {
                            distance: 1500,
                            duration: 300
                        }
                    }
                ]
            }
        };

        mockedAxios.get.mockResolvedValueOnce(mockResponse);

        const route = await getDrivingRoute([1, 1], [2, 2]);

        expect(mockedAxios.get).toHaveBeenCalledWith('https://api.maptiler.com/routing/v1/driving/1,1;2,2.json?key=test-api-key');
        expect(route).toEqual({
            coordinates: [[1, 1], [1.5, 1.5], [2, 2]],
            distance: 1500,
            duration: 300
        });
    });

    it('should throw an error if no route is found in the response', async () => {
        const mockResponse = {
            data: {
                features: []
            }
        };

        mockedAxios.get.mockResolvedValueOnce(mockResponse);

        await expect(getDrivingRoute([1, 1], [2, 2])).rejects.toThrow('Aucun itinéraire trouvé');
    });

    it('should throw an error if axios request fails', async () => {
        mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));
        await expect(getDrivingRoute([1, 1], [2, 2])).rejects.toThrow('Network error');
    });
});
