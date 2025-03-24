import React, { useEffect, useState } from 'react';
import { 
  ScrollView, 
  View, 
  Text,
  Image, 
  StyleSheet, 
  Dimensions, 
  ActivityIndicator
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { getShowDetails, image500 } from '@/services/tmdbapi';
import Constants from 'expo-constants';

const { width, height } = Dimensions.get('window');

// Define the TV series details interface
interface TvDetails {
  id: number;
  name: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  first_air_date: string;
  vote_average: number;
  episode_run_time: number[];
  genres: Array<{ id: number; name: string }>;
  number_of_seasons: number;
  number_of_episodes: number;
}

export default function TvDetailsScreen() {
  // Get the id from the route params
  const { id } = useLocalSearchParams();
  const seriesId = typeof id === 'string' ? parseInt(id, 10) : Array.isArray(id) ? parseInt(id[0], 10) : 0;
  const [series, setSeries] = useState<TvDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const statusBarHeight = Constants.statusBarHeight;
  useEffect(() => {
    if (!seriesId) {
      setError('Invalid series ID');
      setLoading(false);
      return;
    }

    const fetchTvDetails = async () => {
      try {
        setLoading(true);
        const data = await getShowDetails(seriesId);
        setSeries(data);
      } catch (err) {
        console.error('Error fetching TV series details:', err);
        setError('Failed to load TV series details');
      } finally {
        setLoading(false);
      }
    };

    fetchTvDetails();
  }, [seriesId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator animating size="large" />
        <Text 
          style={{ marginTop: 10, fontSize: 16 }}
        >
          Loading series details...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={{ textAlign: 'center', fontSize: 16 }}>
          {error}
        </Text>
      </View>
    );
  }

  if (!series) {
    return (
      <View style={styles.errorContainer}>
        <Text 
          style={{ textAlign: 'center', fontSize: 16 }}
        >
          No series details found
        </Text>
      </View>
    );
  }

  // Get average episode runtime
  const avgRuntime = series.episode_run_time && series.episode_run_time.length > 0 
    ? Math.floor(series.episode_run_time.reduce((a, b) => a + b, 0) / series.episode_run_time.length) 
    : 0;

  return (
    <ScrollView 
      style={[
        styles.container, 
        { 
          paddingTop: statusBarHeight,
        }
      ]}
    >
      {/* Backdrop Image */}
      {series.backdrop_path && (
        <Image
          source={{ uri: image500(series.backdrop_path) || '' }}
          style={styles.backdropImage}
          resizeMode="cover"
        />
      )}
      
      <View style={styles.contentContainer}>
        {/* Series Poster and Basic Info */}
        <View style={styles.headerContainer}>
          {series.poster_path && (
            <Image
              source={{ uri: image500(series.poster_path) || '' }}
              style={styles.posterImage}
              resizeMode="cover"
            />
          )}
          
          <View style={styles.infoContainer}>
            <Text 
              style={{ 
                marginBottom: 8, 
                fontWeight: 'bold', 
                fontSize: 24
              }}
            >
              {series.name}
            </Text>
            
            {series.first_air_date && (
              <Text 
                style={{ marginBottom: 4 }}
              >
                First Aired: {new Date(series.first_air_date).toLocaleDateString()}
              </Text>
            )}
            
            {series.vote_average > 0 && (
              <Text 
                style={{ marginBottom: 4 }}
              >
                Rating: {series.vote_average.toFixed(1)}/10
              </Text>
            )}
            
            {avgRuntime > 0 && (
              <Text 
                style={{ 
                  marginBottom: 4, 
                  fontSize: 14,
                  lineHeight: 20
                }}
              >
                Avg. Episode: {avgRuntime} min
              </Text>
            )}
            <Text 
              style={{ marginBottom: 4 }}
            >
              Seasons: {series.number_of_seasons} | Episodes: {series.number_of_episodes}
            </Text>
            
            {series.genres && series.genres.length > 0 && (
              <Text 
                style={{ marginBottom: 4 }}
              >
                Genres: {series.genres.map(g => g.name).join(', ')}
              </Text>
            )}
          </View>
        </View>
        
        {/* Overview */}
        <View style={styles.overviewContainer}>
          <Text 
            style={{ marginBottom: 8, fontWeight: 'bold', fontSize: 20 }}
          >
            Overview
          </Text>
          <Text 
            style={{ lineHeight: 22 }}
          >
            {series.overview}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  backdropImage: {
    width: width,
    height: height * 0.3,
  },
  contentContainer: {
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    marginTop: -20,
  },
  headerContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  posterImage: {
    width: width * 0.3,
    height: height * 0.2,
    borderRadius: 10,
  },
  infoContainer: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  overviewContainer: {
    marginTop: 8,
  }
});