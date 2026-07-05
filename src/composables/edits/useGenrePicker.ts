import { GenreService } from '@/api/GenreService';
import { GenreQueryResponseGenre } from '@/api/Responses/GenreQueryResponse';
import { StringExtensions } from '@/helpers/StringExtensions';
import { ClientEventStore, EventTypes } from '@/store/ClientEventStore';
import { computed, inject, ref, type Ref } from 'vue';

const MAX_GENRES_COUNT = 20;
const MAX_GENRE_LENGTH = 64;

export function useGenrePicker(genres: Ref<string[]>) {
    const injectedGenreService = inject<GenreService>('genre-service');
    if (!injectedGenreService) {
        throw new Error('Edits: провайдер genre-service не найден');
    }
    const genreService = injectedGenreService;
    const clientEventStore = ClientEventStore();

    const genreInput = ref('');
    const genresQuery = ref<GenreQueryResponseGenre[]>([]);
    const genreSelectableValues = computed(() => genresQuery.value.map(g => g.Name));
    const isGenresMenuDropped = ref(false);

    function normalizeGenre(genreName: string): string {
        const trimmedName = genreName
            .trim()
            .split(/\s+/)
            .join(' ');

        if (!trimmedName) {
            return '';
        }

        const lowerValue = trimmedName.toLowerCase();
        return lowerValue.charAt(0).toUpperCase() + lowerValue.slice(1);
    }

    function addGenre(genreName: string) {
        const normalizedGenre = normalizeGenre(genreName);
        if (!normalizedGenre) {
            return;
        }

        if (normalizedGenre.length > MAX_GENRE_LENGTH) {
            clientEventStore.push(`Жанр не может быть длиннее ${MAX_GENRE_LENGTH} символов.`, EventTypes.Error);
            return;
        }

        if (genres.value.length >= MAX_GENRES_COUNT) {
            clientEventStore.push(`Можно добавить не более ${MAX_GENRES_COUNT} жанров.`, EventTypes.Error);
            return;
        }

        const isAlreadySelected = genres.value
            .some(selectedGenre => selectedGenre.toLowerCase() === normalizedGenre.toLowerCase());
        if (!isAlreadySelected) {
            genres.value.push(normalizedGenre);
        }
    }

    async function onChangeGenreInput(input: string, isSelected: boolean) {
        if (!isSelected) {
            if (StringExtensions.isNullOrEmpty(input)) {
                isGenresMenuDropped.value = false;
                return;
            }

            const genresResponse = await genreService.Query({
                Search: input,
                GenreIds: null,
                Names: null,
                Limit: 5,
                Offset: null,
            });

            genreInput.value = input;
            genresQuery.value = genresResponse.Genres ?? [];
            if (genresQuery.value.length > 0) {
                isGenresMenuDropped.value = true;
            }
        } else {
            addGenre(input);

            genreInput.value = '';
            genresQuery.value = [];
            isGenresMenuDropped.value = false;
        }
    }

    function onEnterGenreInput(input: string) {
        addGenre(input);
        genreInput.value = '';
        genresQuery.value = [];
        isGenresMenuDropped.value = false;
    }

    function deleteSelectedGenre(genreName: string) {
        genres.value = genres.value.filter(genre => genre !== genreName);
    }

    function normalizeGenresList(source: string[]): string[] {
        return source
            .map(normalizeGenre)
            .filter((genreName, index, allGenres) =>
                genreName.length > 0 &&
                genreName.length <= MAX_GENRE_LENGTH &&
                allGenres.findIndex(genre => genre.toLowerCase() === genreName.toLowerCase()) === index)
            .slice(0, MAX_GENRES_COUNT);
    }

    function resetGenrePicker() {
        genreInput.value = '';
        genresQuery.value = [];
        isGenresMenuDropped.value = false;
    }

    return {
        genreInput,
        genreSelectableValues,
        isGenresMenuDropped,
        onChangeGenreInput,
        onEnterGenreInput,
        deleteSelectedGenre,
        normalizeGenresList,
        resetGenrePicker,
    };
}
