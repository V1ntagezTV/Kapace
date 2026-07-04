import { ChangesHistoryService } from '@/api/ChangesHistoryService';
import { ContentService } from '@/api/ContentService';
import { ContentStatus } from '@/api/Enums/ContentStatus';
import { ContentType } from '@/api/Enums/ContentType';
import { Country } from '@/api/Enums/Country';
import { GenreService } from '@/api/GenreService';
import { ImageService } from '@/api/ImageService';
import { V1ChangeableFields } from '@/api/Requests/V1CreateContentRequest';
import { GenreQueryResponseGenre } from '@/api/Responses/GenreQueryResponse';
import { generateBigIntId } from '@/helpers/generateId';
import { resolveBackendImageLink } from '@/helpers/ImageLinkResolver';
import { StringExtensions } from '@/helpers/StringExtensions';
import { ClientEventStore, EventTypes } from '@/store/ClientEventStore';
import { userStore } from '@/store/UserStore';
import { computed, inject, onMounted, ref, type Ref } from 'vue';

export type AdditionalImage = {
    LocalId: number;
    Url: string;
    File: File | null;
    IsUploaded: boolean;
};

export function useContentEditor(contentId: Ref<string | null>) {
    const injectedContentService = inject<ContentService>('content-service');
    const injectedImageService = inject<ImageService>('image-service');
    const injectedChangesHistoryService = inject<ChangesHistoryService>('changes-history-service');
    const injectedGenreService = inject<GenreService>('genre-service');
    if (!injectedContentService || !injectedImageService || !injectedChangesHistoryService || !injectedGenreService) {
        throw new Error('Edits: провайдеры content-service, image-service, changes-history-service или genre-service не найдены');
    }
    const contentService = injectedContentService;
    const imageService = injectedImageService;
    const changesHistoryService = injectedChangesHistoryService;
    const genreService = injectedGenreService;

    const currentUserStore = userStore();
    const clientEventStore = ClientEventStore();

    const showEngTitleInputField = ref(false);
    const showOriginTitleInputField = ref(false);

    let currentImage: File | undefined;
    const currentImageUrl = ref<string | null>(null);

    const additionalImagesInputRef = ref<HTMLInputElement | null>(null);
    const additionalImages = ref<AdditionalImage[]>([]);

    const avatarImageName = ref<string | null>(null);
    const imageUrl = ref<string | null>(null);
    const mainImageUrl = computed(() => currentImageUrl.value ?? imageUrl.value);
    const title = ref<string | null>(null);
    const engTitle = ref<string | null>(null);
    const originalTitle = ref<string | null>(null);
    const description = ref<string | null>(null);
    const country = ref<typeof Country | null>(null);
    const contentType = ref<typeof ContentType | null>(null);
    const contentStatus = ref<typeof ContentStatus | null>(null);
    const genres = ref<string[]>([]);
    const duration = ref<string | null>(null);
    const releasedAt = ref<string | null>(null);
    const plannedSeries = ref<number | null>(null);
    const minAge = ref<number | null>(null);
    const channel = ref<string | null>(null);

    const isMarkAsInvalidRequiredProperties = ref({
        Title: false,
        Description: false,
        Country: false,
        ContentType: false,
        ContentStatus: false,
    });

    const genreInput = ref('');
    const genresQuery = ref<GenreQueryResponseGenre[]>([]);
    const genreSelectableValues = computed(() => genresQuery.value.map(g => g.Name));
    const isGenresMenuDropped = ref(false);
    const maxGenresCount = 20;
    const maxGenreLength = 64;

    let localImageIdSequence = 0;

    onMounted(async () => {
        const existingContentId = getExistingContentId();
        if (existingContentId === null) {
            return;
        }

        const content = await contentService.V1GetById(existingContentId);
        const contentAvatarLink = resolveBackendImageLink(content.Content.AvatarImageLink);
        avatarImageName.value = content.Content.AvatarImageName;
        imageUrl.value = contentAvatarLink;
        title.value = content.Content.Title;
        contentType.value = content.Content.Type;
        contentStatus.value = content.Content.Status;
        genres.value = content.Genres.map(x => x.Name);
        additionalImages.value = (content.Content.Images ?? [])
            .map(link => resolveBackendImageLink(link))
            .filter(link => !!link && link !== contentAvatarLink)
            .map(link => ({
                LocalId: generateLocalId(),
                Url: link,
                File: null,
                IsUploaded: true,
            }));
        country.value = content.Content.Country;
        description.value = content.Content.Description;
        duration.value = content.Content.Duration != null
            ? minTwoDigits(Math.trunc(content.Content.Duration / 60)) + ':' + (content.Content.Duration % 60)
            : null;
        engTitle.value = content.Content.EngTitle;
        minAge.value = content.Content.MinAgeLimit;
        originalTitle.value = content.Content.OriginTitle;
        plannedSeries.value = content.Content.PlannedSeries;
        releasedAt.value = content.Content.ReleasedAt != null
            ? formatDate(content.Content.ReleasedAt)
            : null;
        channel.value = null;

        showEngTitleInputField.value = (engTitle.value?.length ?? 0) > 0;
        showOriginTitleInputField.value = (originalTitle.value?.length ?? 0) > 0;
    });

    function formatDate(date: string | number | Date): string {
        const d = new Date(date);
        let month = '' + (d.getMonth() + 1);
        let day = '' + d.getDate();
        const year = d.getFullYear();
        month = minTwoDigits(month);
        day = minTwoDigits(day);

        return [year, month, day].join('-');
    }

    function minTwoDigits(n: string | number): string {
        const value = Number(n);
        return (value < 10 ? '0' : '') + value;
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

    function removeAdditionalImage(localId: number) {
        additionalImages.value = additionalImages.value.filter(i => i.LocalId !== localId);
    }

    function addGenre(genreName: string) {
        const normalizedGenre = normalizeGenre(genreName);
        if (!normalizedGenre) {
            return;
        }

        if (normalizedGenre.length > maxGenreLength) {
            clientEventStore.push(`Жанр не может быть длиннее ${maxGenreLength} символов.`, EventTypes.Error);
            return;
        }

        if (genres.value.length >= maxGenresCount) {
            clientEventStore.push(`Можно добавить не более ${maxGenresCount} жанров.`, EventTypes.Error);
            return;
        }

        const isAlreadySelected = genres.value
            .some(selectedGenre => selectedGenre.toLowerCase() === normalizedGenre.toLowerCase());
        if (!isAlreadySelected) {
            genres.value.push(normalizedGenre);
        }
    }

    const durationInMinutes = (durationValue: string): number | null => {
        if (!durationValue) {
            return null;
        }

        const values = durationValue.split(':');
        const hours = parseInt(values[0]);
        const minutes = parseInt(values[1]);

        return (hours * 60) + minutes;
    };

    async function onClickInsertContent() {
        const normalizedGenres = genres.value
            .map(normalizeGenre)
            .filter((genreName, index, allGenres) =>
                genreName.length > 0 &&
                genreName.length <= maxGenreLength &&
                allGenres.findIndex(genre => genre.toLowerCase() === genreName.toLowerCase()) === index)
            .slice(0, maxGenresCount);

        genres.value = normalizedGenres;

        const request: V1ChangeableFields = {
            AvatarImageName: avatarImageName.value,
            AdditionalImageNames: [],
            Channel: channel.value,
            ContentStatus: contentStatus.value,
            ContentType: contentType.value,
            Country: country.value,
            Description: description.value,
            Duration: durationInMinutes(duration.value ?? ''),
            EngTitle: engTitle.value,
            Genres: normalizedGenres,
            MinAge: minAge.value,
            PlannedSeries: plannedSeries.value,
            OriginalTitle: originalTitle.value,
            ReleasedAt: releasedAt.value,
            Title: title.value,
        };

        if (!isAllRequiredPropertiesValid(request)) {
            clientEventStore.push('Ошибка! Заполните обязательные поля.', EventTypes.Error);
            return;
        }

        try {
            const generatedId = generateBigIntId();
            const existingContentId = getExistingContentId();
            const hasExistingContentId = existingContentId !== null;
            const contentIdForImages = hasExistingContentId ? existingContentId : generatedId;

            if (contentIdForImages <= 0) {
                clientEventStore.push('Ошибка! Не удалось получить идентификатор контента.', EventTypes.Error);
                return;
            }

            if (currentImageUrl.value && currentImage) {
                const image = await imageService.insertImage(contentIdForImages, currentImage);
                request.AvatarImageName = image.ImageName;
            }

            const pendingUploads = additionalImages.value.filter(image => !image.IsUploaded && image.File != null);
            for (const image of pendingUploads) {
                const imageData = await imageService.insertImage(contentIdForImages, image.File as File);
                if (request.AdditionalImageNames) {
                    request.AdditionalImageNames.push(imageData.ImageName);
                }
            }

            await changesHistoryService.createContentChange({
                ChangeableFields: request,
                GeneratedId: generatedId,
                ContentId: hasExistingContentId ? existingContentId : null,
                CreatedBy: currentUserStore.loggedIn ? currentUserStore.userId : 0,
            });

            clientEventStore.push('Успех! Заявка на добавление изменений создано.', EventTypes.Success);
        } catch (exception) {
            clientEventStore.push('Ошибка! Неизвестная ошибка сервера.', EventTypes.Error);
            console.log('exception: ' + exception);
        }
    }

    function getExistingContentId(): bigint | null {
        if (!contentId.value) {
            return null;
        }

        try {
            const parsedId = BigInt(contentId.value);
            return parsedId > 0n ? parsedId : null;
        } catch {
            return null;
        }
    }

    async function updateImage(image: File, imageUrlValue: string) {
        currentImage = image;
        currentImageUrl.value = imageUrlValue;
    }

    function openAdditionalImagesDialog() {
        additionalImagesInputRef.value?.click();
    }

    function onAdditionalImagesSelected(event: Event) {
        const input = event.target as HTMLInputElement;
        if (!input.files || input.files.length === 0) {
            return;
        }

        for (const file of Array.from(input.files)) {
            const localImageUrl = URL.createObjectURL(file);
            additionalImages.value.push({
                LocalId: generateLocalId(),
                Url: localImageUrl,
                File: file,
                IsUploaded: false,
            });
        }

        input.value = '';
    }

    function generateLocalId(): number {
        return ++localImageIdSequence;
    }

    function isAllRequiredPropertiesValid(request: V1ChangeableFields): boolean {
        const isValidString = (value: string | null | undefined) => value != null && value.trim() !== '';

        let isValid = true;
        const markAsInvalid = isMarkAsInvalidRequiredProperties.value;
        markAsInvalid.Title = !isValidString(request.Title);
        markAsInvalid.Description = !isValidString(request.Description);
        const countryValue = request.Country as unknown as string | null;
        markAsInvalid.Country = countryValue === null || countryValue === Country.Null;
        markAsInvalid.ContentType = request.ContentType === null;
        markAsInvalid.ContentStatus = request.ContentStatus === null;

        if (
            markAsInvalid.Title ||
            markAsInvalid.Description ||
            markAsInvalid.Country ||
            markAsInvalid.ContentType ||
            markAsInvalid.ContentStatus
        ) {
            isValid = false;
        }

        return isValid;
    }

    return {
        ContentStatus,
        ContentType,
        Country,
        showEngTitleInputField,
        showOriginTitleInputField,
        additionalImagesInputRef,
        additionalImages,
        mainImageUrl,
        title,
        engTitle,
        originalTitle,
        description,
        country,
        contentType,
        contentStatus,
        genres,
        duration,
        releasedAt,
        plannedSeries,
        minAge,
        isMarkAsInvalidRequiredProperties,
        genreInput,
        genreSelectableValues,
        isGenresMenuDropped,
        onChangeGenreInput,
        onEnterGenreInput,
        deleteSelectedGenre,
        removeAdditionalImage,
        onClickInsertContent,
        updateImage,
        openAdditionalImagesDialog,
        onAdditionalImagesSelected,
    };
}
