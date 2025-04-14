import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTES_KEY = 'SMART_NOTES';

export const getNotes = async () => {
  const json = await AsyncStorage.getItem(NOTES_KEY);
  return json ? JSON.parse(json) : [];
};

export const saveNotes = async (notes: any[]) => {
  await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(notes));
};

export const addNote = async (note: any) => {
  const notes = await getNotes();
  notes.push(note);
  await saveNotes(notes);
};

export const getSingleNote = async (id: string) => {
  const notes = await getNotes();
  return notes.find((n: any) => n.id === id);
};

export const editNote = async (id: string, updatedNote: any) => {
  let notes = await getNotes();
  notes = notes.map((n: any) => n.id === id ? { ...n, ...updatedNote } : n);
  await saveNotes(notes);
};

export const deleteNote = async (id: string) => {
  let notes = await getNotes();
  notes = notes.filter((n: any) => n.id !== id);
  await saveNotes(notes);
};
