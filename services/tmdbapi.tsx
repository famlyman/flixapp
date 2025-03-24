import axios from 'axios';
import Constants from 'expo-constants';

const BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_API = Constants.expoConfig?.extra?.TMDB_API || '';


// Axios instance for TMDB API
export const tmdbApi = axios.create({
  baseURL: BASE_URL,
  params: {
    api_key: TMDB_API
  }
});

// Add request interceptor for debugging
tmdbApi.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

// Add response interceptor for debugging
tmdbApi.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

// Search functions
export const searchMovies = async (query: string) => {
  try {
    const response = await tmdbApi.get('/search/movie?include_adult=false&language=en-US&page=1', {
      params: { query }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const searchShows = async (query: string) => {
  try {
    const response = await tmdbApi.get('/search/tv?include_adult=false&language=en-US&page=1', {
      params: { query }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Discovery functions
export const getUpcomingMovies = async () => {
  try {
    const response = await tmdbApi.get('/movie/upcoming?language=en-US&page=1');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getPopularMovies = async () => {
  try {
    const response = await tmdbApi.get('/movie/popular?language=en-US&page=1');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getTrendingShows = async () => {
  try {
    const response = await tmdbApi.get('/trending/tv/day?language=en-US');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Detail functions
export const getMovieDetails = async (id: number) => {
  try {
    const response = await tmdbApi.get(`/movie/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getShowDetails = async (id: number) => {
  try {
    const response = await tmdbApi.get(`/tv/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Image utility
export const image500 = (posterPath: string | null) =>
  posterPath ? `https://image.tmdb.org/t/p/w500${posterPath}` : null;

export default tmdbApi;