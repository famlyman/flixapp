// In listModal.tsx
import * as React from 'react';
import { fetchTraktLists, addToTraktList } from '@/services/traktapi';
import { View, Text, Modal, StyleSheet, ScrollView } from 'react-native';
import { RadioButton, Button } from 'react-native-paper';


export interface MyListsProps {
  visible: boolean;
  onClose: () => void;
  itemId?: number; // Changed from movieId to itemId for flexibility
  type?: 'movie' | 'show'; // New prop to specify type
}

const MyLists: React.FC<MyListsProps> = ({ visible, onClose, itemId, type = 'movie' }) => {
  const [lists, setLists] = React.useState<any[]>([]);
  const [selectedList, setSelectedList] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const containerStyle = { backgroundColor: 'black', padding: 20, margin: 20, borderRadius: 8 };

  React.useEffect(() => {
    const loadLists = async () => {
      setLoading(true);
      try {
        const traktLists = await fetchTraktLists();
        setLists(traktLists);
        setError(null);
      } catch (err: any) {
        setError('Failed to load lists');
      } finally {
        setLoading(false);
      }
    };

    if (visible) {
      loadLists();
    }
  }, [visible]);

  const handleConfirm = async () => {    
    if (selectedList && itemId) {
      try {
        await addToTraktList(selectedList, itemId, type);
      } catch (err: any) {
        console.error(err)
        setError('Failed to add movie to list');
        return;
      }
    }
    onClose();
  };
  return (
    <Modal
      visible={visible}
      onRequestClose={onClose}
      style={containerStyle}
      >
        <View>
          <Text style={styles.title}>Add to Trakt List</Text>

          {loading && <Text>Loading...</Text>}
          {error && <Text style={styles.error}>{error}</Text>}
          {!loading && !error && lists.length === 0 && (
            <Text>No lists found</Text>
          )}
          {!loading && !error && lists.length > 0 && (
            <ScrollView style={styles.listContainer}>
              <RadioButton.Group
                onValueChange={(newValue: string) => setSelectedList(newValue)}
                value={selectedList || ''}
              >
                {lists.map((list) => (
                  <View key={list.ids.trakt} style={styles.radioItem}>
                    <RadioButton value={list.ids.trakt.toString()} />
                    <Text style={styles.radioLabel}>{list.name}</Text>
                  </View>
                ))}
              </RadioButton.Group>
            </ScrollView>
          )}
          <View style={styles.buttonContainer}>
            <Button mode="outlined" onPress={onClose} style={styles.button}>
              Cancel
            </Button>
            <Button mode="contained" onPress={handleConfirm} style={styles.button}>
              Add
            </Button>
          </View>
        </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  listContainer: { maxHeight: 300 },
  radioItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 5 },
  radioLabel: { fontSize: 16, marginLeft: 8 },
  error: { color: 'red', marginBottom: 10 },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  button: { flex: 1, marginHorizontal: 5 },
});

export default MyLists;