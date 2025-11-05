import { useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';

import { MapboxPlace, searchPlaces } from '@/lib/mapbox';

export function usePlaceSearch() {
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<MapboxPlace[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<MapboxPlace | null>(null);
  const [showResults, setShowResults] = useState(false);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const performSearch = (searchText: string) => {
    // Reset results quando il testo è troppo corto
    if (searchText.trim().length < 3) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    // Non fare la ricerca se il testo corrisponde al posto selezionato
    if (selectedPlace && searchText.trim() === selectedPlace.address.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    // Cancella il timeout precedente se l'utente sta ancora scrivendo
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Imposta un nuovo timeout - aspetta che l'utente smetta di scrivere
    searchTimeoutRef.current = setTimeout(async () => {
      // Solo se il testo è ancora abbastanza lungo (potrebbe essere cambiato durante l'attesa)
      if (searchText.trim().length < 3) {
        setSearchResults([]);
        setShowResults(false);
        setSearching(false);
        return;
      }

      // Non fare la ricerca se corrisponde al posto selezionato
      if (selectedPlace && searchText.trim() === selectedPlace.address.trim()) {
        setSearchResults([]);
        setShowResults(false);
        setSearching(false);
        return;
      }

      setSearching(true);
      try {
        console.log('🔍 Starting search for:', searchText);
        const results = await searchPlaces(searchText, 5);
        console.log('✅ Search results:', results);
        setSearchResults(results);
        setShowResults(true);
      } catch (error) {
        console.error('❌ Error searching places:', error);
        Alert.alert('Errore', error instanceof Error ? error.message : 'Errore nella ricerca luoghi');
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 800); // Debounce di 800ms - aspetta che l'utente finisca di scrivere
  };

  const handleSelectPlace = (place: MapboxPlace) => {
    // Cancella il timeout di ricerca se c'è uno in corso
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = null;
    }
    
    setSelectedPlace(place);
    setShowResults(false);
    setSearchResults([]);
    setSearching(false);
    return place.address;
  };

  const resetSearch = () => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = null;
    }
    setSearchResults([]);
    setShowResults(false);
    setSearching(false);
    setSelectedPlace(null);
  };

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return {
    searching,
    searchResults,
    selectedPlace,
    showResults,
    performSearch,
    handleSelectPlace,
    resetSearch,
    setShowResults,
  };
}

