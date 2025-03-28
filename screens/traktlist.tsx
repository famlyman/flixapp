import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Image,
  TouchableOpacity,
} from "react-native";
import { fetchTraktLists, getAccessToken } from "../services/traktapi";
import { getListItemsWithImages } from "../services/tmdb-trakt";
import * as SecureStore from "expo-secure-store";
import { useRouter } from "expo-router";
import { FlashList } from "@shopify/flash-list";


interface TraktList {
  name: string;
  ids: {
    slug: string;
    trakt: number;
  };
}

interface ItemDetails {
  id: number;
  title: string;
  posterUrl: string | null;
  type: "movie" | "show";
}

interface TraktListsProps {
  isAuthenticated: boolean;
}

const TraktLists = ({ isAuthenticated }: TraktListsProps) => {
  const [lists, setLists] = useState<(TraktList & { items?: ItemDetails[] })[]>(
    []
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const router = useRouter();

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!isAuthenticated) {
        setError("Please log in to see your Trakt lists");
        setLoading(false);
        return;
      }

      const storedUsername = await SecureStore.getItemAsync("trakt_username");
      if (!storedUsername) {
        setError("No username found. Please log in again.");
        setLoading(false);
        return;
      }
      setUsername(storedUsername);

      const accessToken = await getAccessToken();
      if (!accessToken) {
        setError("Not authenticated");
        setLoading(false);
        return;
      }

      const data = await fetchTraktLists();
      const enhancedLists = await Promise.all(
        data.map(async (list: TraktList) => {
          const items = await getListItemsWithImages(
            storedUsername,
            list.ids.trakt,
          );
          return { ...list, items };
        })
      );
      setLists(enhancedLists);
    } catch (err: any) {
      console.error("Error fetching lists:", err);
      setError(err.message || "Failed to fetch lists");
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleListPress = (list: TraktList) => {
    router.push({
      pathname: "../app/[listdetails]",
      params: {
        listId: list.ids.trakt.toString(),
        listName: list.name,
      },
    });
  };

  const handleItemPress = (item: ItemDetails) => {
    router.push({
      pathname: "../app/[itemdetails]",
      params: {
        id: item.id.toString(),
        type: item.type,
        title: item.title,
      },
    });
  };

  const renderItem = ({
    item,
  }: {
    item: TraktList & { items?: ItemDetails[] };
  }) => (
    <TouchableOpacity onPress={() => handleListPress(item)}>
      <View style={styles.card}>
        <View>
          <Text style={styles.itemTitle}>{item.name}</Text>
          {item.items && (
            <FlashList
              estimatedItemSize={200}
              data={item.items}
              horizontal
              keyExtractor={(subItem, index) => `${subItem.id}-${subItem.type}-${index}`}
              renderItem={({ item: subItem }) => (
                <TouchableOpacity 
                  style={styles.itemContainer} 
                  onPress={() => handleItemPress(subItem)}
                >
                  {subItem.posterUrl && (
                    <Image
                      source={{ uri: subItem.posterUrl }}
                      style={styles.itemImage}
                    />
                  )}
                  <Text 
                    style={[
                      styles.itemTitle, 
                    ]}
                  >
                    {subItem.title}
                  </Text>
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator animating={true} size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>
          Error: {error}
        </Text>
      </View>
    );
  }

  if (lists.length === 0) {
    return (
      <View style={styles.centered}>
        <Text  >
          No lists found.
        </Text>
      </View>
    );
  }

  return (
    <FlashList
      estimatedItemSize={200}
      data={lists}
      renderItem={({ item }) => renderItem({ item })}
      keyExtractor={(item) => item.ids.slug}
      contentContainerStyle={{
        paddingVertical: 10,
      }}
    />
  );
};

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingVertical: 10,
  },
  card: {
    marginVertical: 5,
    width: "95%",
    alignSelf: "center",
    borderRadius: 10,
    elevation: 3,
  },
  itemContainer: {
    alignItems: "center",
    marginRight: 10,
  },
  itemImage: {
    width: 60,
    height: 90,
    borderRadius: 4,
  },
  itemTitle: {
    textAlign: "center",
    marginTop: 4,
    maxWidth: 60,
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
  },
});

export default TraktLists;