import React, { useEffect, useState } from 'react';
import { FlashList } from '@shopify/flash-list';
import { Pressable, Dimensions, Image, Text, View, ActivityIndicator } from 'react-native';
import { image500, getUpcomingMovies } from '@/services/tmdbapi';
import { router } from 'expo-router';

const { width, height } = Dimensions.get("window");

interface Movie {
  id: number;
  poster_path: string;
  title: string;
}

export const Upcoming = () => {
  const [upcomingMovies, setUpcomingMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getUpcomingMovies();
        setUpcomingMovies(data.results);
      } catch (error) {
        console.error('Error fetching upcoming movies:', error);
        setError('Failed to load movies');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleMoviePress = (id: number) => {
    router.push(`./moviedetails${id}`);
  };

  if (loading) {
    return (
      <View style={{
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
      }}>
        <ActivityIndicator size="large" />
        <Text >Loading movies...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        padding: 20,
      }}>
        <Text style={{
          fontSize: 16, 
          textAlign: 'center',
        }}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <FlashList
        data={upcomingMovies}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => handleMoviePress(item.id)}
            style={{ padding: 8 }}
          >
            <View
              style={{
                elevation: 1,
                borderRadius: 10,
                overflow: 'hidden',
              }}
            >
              <Image
                source={{ uri: image500(item.poster_path) || "" }}
                style={{ width: width / 2 - 16, height: height / 3, borderRadius: 10 }}
                resizeMode="cover"
              />
              <View style={{ padding: 8 }}>
                <Text
                  numberOfLines={2}
                  style={{
                    textAlign: 'center',
                    fontWeight: '500'
                  }}
                >
                  {item.title}
                </Text>
              </View>
            </View>
          </Pressable>
        )}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        estimatedItemSize={height / 3 + 56}
      />
    </View>
  );
};

export default Upcoming;