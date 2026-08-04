import { ChangesHistoryService } from '@/api/ChangesHistoryService';
import { ImageService } from '@/api/ImageService';
import { PersonGender, type PersonGenderValue } from '@/api/Enums/PersonGender';
import { V1PersonChangeableFields } from '@/api/Requests/V1CreatePersonRequest';
import { personEditorDirty } from '@/composables/edits/editsFormDirty';
import { useFormDirtyState } from '@/composables/edits/useFormDirtyState';
import type { AdditionalImage } from '@/composables/edits/useContentEditor';
import { generateBigIntId } from '@/helpers/generateId';
import { ClientEventStore, EventTypes } from '@/store/ClientEventStore';
import { userStore } from '@/store/UserStore';
import { computed, inject, ref, watch, type Ref } from 'vue';
import { useRouter } from 'vue-router';

function todayIsoDate(): string {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${now.getFullYear()}-${month}-${day}`;
}

export function usePersonEditor(personId: Ref<string | null>) {
    const injectedImageService = inject<ImageService>('image-service');
    const injectedChangesHistoryService = inject<ChangesHistoryService>('changes-history-service');
    if (!injectedImageService || !injectedChangesHistoryService) {
        throw new Error('Edits: провайдеры image-service или changes-history-service не найдены');
    }

    const imageService = injectedImageService;
    const changesHistoryService = injectedChangesHistoryService;
    const currentUserStore = userStore();
    const clientEventStore = ClientEventStore();
    const router = useRouter();

    let currentImage: File | undefined;
    const currentImageUrl = ref<string | null>(null);
    const imageName = ref<string | null>(null);
    const imageUrl = ref<string | null>(null);
    const mainImageUrl = computed(() => currentImageUrl.value ?? imageUrl.value);

    const additionalImagesInputRef = ref<HTMLInputElement | null>(null);
    const additionalImages = ref<AdditionalImage[]>([]);

    const name = ref<string | null>(null);
    const description = ref<string | null>(null);
    const gender = ref<PersonGenderValue | null>(null);
    const birthDate = ref<string | null>(null);
    const isBirthDateInvalid = ref(false);
    const maxBirthDate = todayIsoDate();

    const genderOptions = [
        PersonGender.Unspecified,
        PersonGender.Male,
        PersonGender.Female,
    ];

    const genderLabels: Record<PersonGenderValue, string> = {
        Unspecified: 'Не указан',
        Male: 'Мужской',
        Female: 'Женский',
    };

    const genderSelectableValues = genderOptions.map(option => genderLabels[option]);

    const isMarkAsInvalidRequiredProperties = ref({
        Name: false,
        Description: false,
        Image: false,
    });

    let localImageIdSequence = 0;

    const { isDirty, pauseTracking, resumeTracking, clearDirty } = useFormDirtyState([
        name,
        description,
        gender,
        birthDate,
        currentImageUrl,
        additionalImages,
    ]);

    watch(isDirty, (value) => {
        personEditorDirty.value = value;
    });

    function clearValidationFlags() {
        isMarkAsInvalidRequiredProperties.value = {
            Name: false,
            Description: false,
            Image: false,
        };
        isBirthDateInvalid.value = false;
    }

    function clearCreateForm() {
        currentImage = undefined;
        currentImageUrl.value = null;
        imageName.value = null;
        imageUrl.value = null;
        additionalImages.value = [];
        name.value = null;
        description.value = null;
        gender.value = null;
        birthDate.value = null;
        clearValidationFlags();
    }

    async function resetForm() {
        pauseTracking();
        clearCreateForm();
        resumeTracking();
    }

    function removeAdditionalImage(localId: number) {
        additionalImages.value = additionalImages.value.filter(i => i.LocalId !== localId);
    }

    function resolveGenderValue(): PersonGenderValue | null {
        return gender.value;
    }

    function onGenderLabelSelected(label: string | null) {
        if (!label) {
            gender.value = null;
            return;
        }

        const entry = Object.entries(genderLabels).find(([, value]) => value === label);
        gender.value = (entry?.[0] as PersonGenderValue | undefined) ?? null;
    }

    const selectedGenderLabel = computed(() => {
        if (!gender.value) {
            return '';
        }
        return genderLabels[gender.value];
    });

    function isBirthDateValid(value: string | null): boolean {
        if (!value || value.trim() === '') {
            return true;
        }

        if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
            return false;
        }

        return value <= maxBirthDate;
    }

    async function onClickInsertPerson() {
        const request: V1PersonChangeableFields = {
            ImageName: imageName.value,
            AdditionalImageNames: [],
            Name: name.value?.trim() ?? null,
            Description: description.value?.trim() ?? null,
            Gender: resolveGenderValue(),
            BirthDate: birthDate.value?.trim() || null,
        };

        if (!isAllRequiredPropertiesValid(request)) {
            clientEventStore.push('Ошибка! Заполните обязательные поля.', EventTypes.Error);
            return;
        }

        if (!isBirthDateValid(request.BirthDate)) {
            isBirthDateInvalid.value = true;
            clientEventStore.push('Ошибка! Дата рождения не может быть в будущем.', EventTypes.Error);
            return;
        }

        try {
            const generatedId = generateBigIntId();
            const existingPersonId = getExistingPersonId();
            const hasExistingPersonId = existingPersonId !== null;
            const personIdForImages = hasExistingPersonId ? existingPersonId : generatedId;

            if (personIdForImages <= 0n) {
                clientEventStore.push('Ошибка! Не удалось получить идентификатор персоны.', EventTypes.Error);
                return;
            }

            if (currentImageUrl.value && currentImage) {
                const image = await imageService.insertImage(personIdForImages, currentImage);
                request.ImageName = image.ImageName;
            }

            for (const image of additionalImages.value) {
                if (image.IsUploaded && image.ImageName) {
                    request.AdditionalImageNames?.push(image.ImageName);
                }
            }

            const pendingUploads = additionalImages.value.filter(image => !image.IsUploaded && image.File != null);
            for (const image of pendingUploads) {
                const imageData = await imageService.insertImage(personIdForImages, image.File as File);
                image.ImageName = imageData.ImageName;
                image.IsUploaded = true;
                if (request.AdditionalImageNames) {
                    request.AdditionalImageNames.push(imageData.ImageName);
                }
            }

            await changesHistoryService.createPersonChange({
                ChangeableFields: request,
                GeneratedId: generatedId,
                PersonId: hasExistingPersonId ? existingPersonId : null,
                CreatedBy: currentUserStore.loggedIn ? currentUserStore.userId : 0,
            });

            clientEventStore.push('Успех! Заявка на добавление персоны создана.', EventTypes.Success);
            clearDirty();
            await router.push({ name: 'edit-list' });
        } catch {
            clientEventStore.push('Ошибка! Неизвестная ошибка сервера.', EventTypes.Error);
        }
    }

    function getExistingPersonId(): bigint | null {
        if (!personId.value) {
            return null;
        }

        try {
            const parsedId = BigInt(personId.value);
            return parsedId > 0n ? parsedId : null;
        } catch {
            return null;
        }
    }

    async function updateImage(image: File, imageUrlValue: string) {
        currentImage = image;
        currentImageUrl.value = imageUrlValue;
        imageName.value = null;
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
                ImageName: null,
                File: file,
                IsUploaded: false,
            });
        }

        input.value = '';
    }

    function generateLocalId(): number {
        return ++localImageIdSequence;
    }

    function isAllRequiredPropertiesValid(request: V1PersonChangeableFields): boolean {
        const isValidString = (value: string | null | undefined) => value != null && value.trim() !== '';
        const markAsInvalid = isMarkAsInvalidRequiredProperties.value;

        markAsInvalid.Name = !isValidString(request.Name);
        markAsInvalid.Description = !isValidString(request.Description);
        markAsInvalid.Image = !isValidString(request.ImageName) && !(currentImageUrl.value && currentImage);

        return !markAsInvalid.Name && !markAsInvalid.Description && !markAsInvalid.Image;
    }

    return {
        additionalImagesInputRef,
        additionalImages,
        mainImageUrl,
        name,
        description,
        gender,
        birthDate,
        isBirthDateInvalid,
        maxBirthDate,
        genderSelectableValues,
        selectedGenderLabel,
        onGenderLabelSelected,
        isMarkAsInvalidRequiredProperties,
        removeAdditionalImage,
        onClickInsertPerson,
        resetForm,
        updateImage,
        openAdditionalImagesDialog,
        onAdditionalImagesSelected,
    };
}
