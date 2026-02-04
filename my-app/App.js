import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  FlatList,
  useWindowDimensions,
  Alert,
  Platform,
} from 'react-native';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@notes_app';

export default function App() {
  const [items, setItems] = useState([]);
  const [text, setText] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const { width } = useWindowDimensions();

  // Загрузка данных при старте
  useEffect(() => {
    const loadItems = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
        if (jsonValue != null) {
          setItems(JSON.parse(jsonValue));
        }
      } catch (e) {
        console.error('Failed to load notes', e);
      }
    };
    loadItems();
  }, []);

  // Сохранение при изменении
  useEffect(() => {
    const saveItems = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      } catch (e) {
        console.error('Failed to save notes', e);
      }
    };
    if (items.length > 0 || items.length === 0) {
      const timeout = setTimeout(saveItems, 300);
      return () => clearTimeout(timeout);
    }
  }, [items]);

  const handleAdd = () => {
    const trimmed = text.trim();
    if (trimmed) {
      setItems((prev) => [{ id: Date.now().toString(), value: trimmed }, ...prev]);
      setText('');
    }
  };

  const startEditing = (item) => {
    setEditingId(item.id);
    setEditText(item.value);
  };

  const saveEdit = () => {
    if (editText.trim()) {
      setItems((prev) =>
        prev.map((item) =>
          item.id === editingId ? { ...item, value: editText.trim() } : item
        )
      );
    }
    setEditingId(null);
    setEditText('');
  };

  const handleDelete = (id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setEditText('');
    }
  };

  const isLandscape = width > 600;

  const renderItem = ({ item }) => {
    if (editingId === item.id) {
      return (
        <View style={styles.editRow}>
          <TextInput
            style={styles.editInput}
            value={editText}
            onChangeText={setEditText}
            autoFocus
            onSubmitEditing={saveEdit}
            blurOnSubmit
          />
          <Pressable onPress={saveEdit} style={styles.saveButton}>
            <Text style={styles.saveText}>✓</Text>
          </Pressable>
        </View>
      );
    }

    return (
      <Pressable onPress={() => startEditing(item)} style={styles.itemRow}>
        <View style={styles.itemTextContainer}>
          <Text style={styles.itemText} numberOfLines={2}>
            {item.value}
          </Text>
        </View>
        <Pressable onPress={() => handleDelete(item.id)} style={styles.deleteButton}>
          <Text style={styles.deleteText}>✕</Text>
        </Pressable>
      </Pressable>
    );
  };

  return (
    <View style={[styles.container, Platform.OS === 'ios' && styles.iosContainer]}>
      <StatusBar style="light" />

      <Text style={styles.header}>Заметки</Text>

      {/* Ввод */}
      <View style={[styles.inputWrapper, isLandscape && styles.inputWrapperWide]}>
        <TextInput
          style={styles.textInput}
          placeholder="Новая заметка..."
          placeholderTextColor="#888"
          value={text}
          onChangeText={setText}
          onSubmitEditing={handleAdd}
          returnKeyType="done"
          color="#fff"
          selectionColor="#666"
        />
        <Pressable onPress={handleAdd} style={styles.addButton}>
          <Text style={styles.addSymbol}>+</Text>
        </Pressable>
      </View>

      {/* Список */}
      {items.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Нет записей</Text>
          <Text style={[styles.emptyText, { fontSize: 14, marginTop: 8 }]}>
            Начните с добавления первой
          </Text>
        </View>
      ) : (
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
}

// Импортируем стили из CSS файла
import styles from '/styles/style.css';

// Или если нужно конвертировать CSS в StyleSheet
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d0d0d',
    paddingTop: Platform.OS === 'android' ? 30 : 60,
    paddingHorizontal: 20,
  },
  header: {
    fontSize: 32,
    fontWeight: '700',
    color: '#f5f5f5',
    marginBottom: 24,
    letterSpacing: -0.8,
    fontFamily: 'System',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 28,
  },
  inputWrapperWide: {
    paddingHorizontal: 40,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    color: '#fff',
    fontSize: 17,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#252525',
    minHeight: 54,
  },
  addButton: {
    width: 54,
    height: 54,
    borderRadius: 16,
    backgroundColor: '#252525',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addSymbol: {
    color: '#aaa',
    fontSize: 28,
    lineHeight: 28,
    fontWeight: '200',
  },
  listContainer: {
    paddingBottom: 30,
  },
  itemRow: {
    flexDirection: 'row',
    backgroundColor: '#141414',
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1e1e1e',
    overflow: 'hidden',
    minHeight: 60,
  },
  editRow: {
    flexDirection: 'row',
    backgroundColor: '#141414',
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1e1e1e',
    overflow: 'hidden',
    minHeight: 60,
  },
  itemTextContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 18,
  },
  itemText: {
    color: '#e0e0e0',
    fontSize: 16,
    lineHeight: 22,
  },
  editInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    paddingVertical: 14,
    paddingHorizontal: 18,
    backgroundColor: 'transparent',
  },
  deleteButton: {
    width: 60,
    backgroundColor: '#ff4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '500',
  },
  saveButton: {
    width: 60,
    backgroundColor: '#2ecc71',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    color: '#666',
    fontSize: 18,
    textAlign: 'center',
    fontFamily: 'System',
  }
});