
<?php
// Ustawiamy nagłówki - zwracamy JSON, pozwalamy na zapytania (CORS)
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

// 1. Wczytanie bazy danych z pliku JSON
$jsonPath = __DIR__ . '/database/songs.json';
if (!file_exists($jsonPath)) {
    echo json_encode(['error' => 'Baza danych nie istnieje.']);
    exit;
}

$jsonString = file_get_contents($jsonPath);
$data = json_decode($jsonString, true);
$songs = $data['songs'] ?? [];

// 2. Pobranie parametrów od użytkownika (z paska adresu URL)
// mb_strtolower pomaga z polskimi znakami i ignoruje wielkość liter
$searchQuery  = mb_strtolower($_GET['search'] ?? '');
$filterGenre  = mb_strtolower($_GET['genre'] ?? '');
$filterAuthor = mb_strtolower($_GET['author'] ?? '');

// Paginacja: która strona? Jeśli ktoś wpisze bzdurę, wymuszamy stronę 1.
$page  = max(1, (int)($_GET['page'] ?? 1));
$limit = 20; // Twój limit z założeń projektu

// 3. Logika Filtrowania i Wyszukiwania
$filteredSongs = array_filter($songs, function($song) use ($searchQuery, $filterGenre, $filterAuthor) {
    
    // a) Wyszukiwanie tekstowe (szukamy w tytule, autorze lub tagach)
    if ($searchQuery !== '') {
        $titleMatch = str_contains(mb_strtolower($song['title']), $searchQuery);
        $authorMatch = str_contains(mb_strtolower($song['author']), $searchQuery);
        
        $tagsMatch = false;
        foreach ($song['tags'] as $tag) {
            if (str_contains(mb_strtolower($tag), $searchQuery)) {
                $tagsMatch = true;
                break;
            }
        }
        
        // Jeśli wpisana fraza nie pasuje do niczego - odrzucamy utwór
        if (!$titleMatch && !$authorMatch && !$tagsMatch) {
            return false;
        }
    }

    // b) Filtrowanie po gatunku
    if ($filterGenre !== '') {
        // Zmieniamy wszystkie gatunki utworu na małe litery, żeby łatwiej porównać
        $lowerGenres = array_map('mb_strtolower', $song['genre']);
        if (!in_array($filterGenre, $lowerGenres)) {
            return false;
        }
    }

    // c) Filtrowanie po autorze (ścisłe dopasowanie dla konkretnego twórcy)
    if ($filterAuthor !== '') {
        if (mb_strtolower($song['author']) !== $filterAuthor) {
            return false;
        }
    }

    // Jeśli utwór przeszedł wszystkie powyższe testy, zostaje na liście!
    return true; 
});

// Resetujemy klucze tablicy (wymagane, aby po filtracji JSON zwrócił tablicę `[]`, a nie obiekt `{}`)
$filteredSongs = array_values($filteredSongs);

// 4. Paginacja (Wycinamy tylko 20 wyników na podstawie wybranej strony)
$totalResults = count($filteredSongs);
$offset = ($page - 1) * $limit;
$paginatedSongs = array_slice($filteredSongs, $offset, $limit);

// 5. Zwracamy czystą listę utworów do Frontendu (zgodnie z zaleceniami!)
echo json_encode($paginatedSongs, JSON_UNESCAPED_UNICODE);
?>
