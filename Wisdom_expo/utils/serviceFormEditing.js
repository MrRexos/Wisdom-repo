import { useCallback, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import api from './api';

const isObject = (value) => value !== null && typeof value === 'object';

const deepEqual = (a, b) => {
  if (a === b) return true;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i += 1) {
      if (!deepEqual(a[i], b[i])) return false;
    }
    return true;
  }
  if (isObject(a) && isObject(b)) {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;
    for (const key of keysA) {
      if (!Object.prototype.hasOwnProperty.call(b, key)) return false;
      if (!deepEqual(a[key], b[key])) return false;
    }
    return true;
  }
  return false;
};

const toNumberOrNull = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

const toBoolean = (value, fallback = false) => {
  if (value === null || value === undefined) return fallback;
  return value === true || value === 1 || value === '1';
};

const normalizeString = (value) => {
  if (value === null || value === undefined) return '';
  return String(value);
};

const normalizeArrayOfStrings = (array = []) => {
  if (!Array.isArray(array)) return [];
  return array.map((item) => normalizeString(item)).filter((item) => item.length > 0).sort((a, b) => a.localeCompare(b));
};

export const normalizeFormValues = (values = {}) => {
  const categoryId =
    values.category?.service_category_id ??
    values.category?.id ??
    values.categoryId ??
    null;
  const familyId =
    values.family?.id ??
    values.family?.service_family_id ??
    values.familyId ??
    null;
  const priceType = values.priceType || 'hour';

  const location = values.location && typeof values.location === 'object'
    ? {
        lat: toNumberOrNull(values.location.lat),
        lng: toNumberOrNull(values.location.lng),
      }
    : null;

  const experiences = Array.isArray(values.experiences)
    ? values.experiences.map((exp) => ({
        position: normalizeString(exp?.position),
        place: normalizeString(exp?.place),
        startDate: toNumberOrNull(exp?.startDate),
        endDate: toNumberOrNull(exp?.endDate),
      }))
    : [];

  const images = Array.isArray(values.serviceImages)
    ? values.serviceImages
        .map((img) => {
          if (!img) return null;
          if (typeof img === 'string') return img;
          if (img.remoteUrl) return img.remoteUrl;
          if (img.url) return img.url;
          if (img.image_url) return img.image_url;
          if (img.uri) return img.uri;
          return null;
        })
        .filter((uri) => typeof uri === 'string' && uri.length > 0)
    : [];

  const normalized = {
    title: normalizeString(values.title).trim(),
    familyId,
    categoryId,
    description: normalizeString(values.description),
    selectedLanguages: normalizeArrayOfStrings(values.selectedLanguages),
    isIndividual: toBoolean(values.isIndividual, true),
    hobbies: normalizeString(values.hobbies),
    tags: normalizeArrayOfStrings(values.tags),
    location,
    actionRate: toNumberOrNull(values.actionRate),
    direction: normalizeString(values.direction),
    country: normalizeString(values.country),
    street: normalizeString(values.street),
    city: normalizeString(values.city),
    state: normalizeString(values.state),
    postalCode: normalizeString(values.postalCode),
    streetNumber: normalizeString(values.streetNumber),
    address2: normalizeString(values.address2),
    isUnlocated: toBoolean(values.isUnlocated, false),
    serviceImages: images,
    priceType,
    priceValue: priceType === 'budget' ? null : toNumberOrNull(values.priceValue),
    allowDiscounts: toBoolean(values.allowDiscounts, true),
    discountRate: toNumberOrNull(values.discountRate),
    allowAsk: toBoolean(values.allowAsk, true),
    allowConsults: toBoolean(values.allowConsults, true),
    consultPrice: toNumberOrNull(values.consultPrice),
    consultVia: normalizeString(values.consultVia),
    consultProvider: normalizeString(values.consultProvider),
    consultUsername: normalizeString(values.consultUsername),
    consultUrl: normalizeString(values.consultUrl),
    experiences,
  };

  return normalized;
};

const mapExperienceFromService = (experience, index) => {
  if (!experience || typeof experience !== 'object') {
    return {
      id: index + 1,
      position: '',
      place: '',
      startDate: null,
      endDate: null,
    };
  }

  const start = experience.experience_started_date ? new Date(experience.experience_started_date).getTime() : null;
  const end = experience.experience_end_date ? new Date(experience.experience_end_date).getTime() : null;

  return {
    id: experience.id ?? index + 1,
    position: experience.experience_title || '',
    place: experience.place_name || '',
    startDate: Number.isFinite(start) ? start : null,
    endDate: Number.isFinite(end) ? end : null,
  };
};

const mapImageFromService = (image, index) => {
  if (!image || typeof image !== 'object') return null;
  const url = image.image_url || image.url;
  if (!url) return null;
  return {
    id: image.id ?? index,
    uri: url,
    remoteUrl: url,
    order: image.order ?? index,
  };
};

export const mapServiceToFormValues = (service = {}) => {
  const serviceId = service.service_id ?? service.id ?? null;
  const categoryData = service.category || service.service_category || null;
  const familyData = service.family || categoryData?.family || null;

  const categoryId =
    service.service_category_id ??
    service.category_id ??
    categoryData?.service_category_id ??
    categoryData?.id ??
    null;
  const categoryName =
    service.service_category_name ||
    service.category_name ||
    categoryData?.service_category_name ||
    categoryData?.name ||
    '';

  const familyId =
    service.service_family_id ??
    service.family_id ??
    familyData?.service_family_id ??
    familyData?.id ??
    null;
  const familyName =
    service.service_family ||
    service.family_name ||
    familyData?.service_family ||
    familyData?.name ||
    '';
  const priceType = service.price_type || service.current_price_type || 'hour';
  const priceValue = priceType === 'budget' ? null : toNumberOrNull(service.price ?? service.current_price);
  const latitude = toNumberOrNull(service.latitude);
  const longitude = toNumberOrNull(service.longitude);
  const location = latitude !== null && longitude !== null ? { lat: latitude, lng: longitude } : null;

  const experiences = Array.isArray(service.experiences)
    ? service.experiences.map(mapExperienceFromService)
    : [];

  const images = Array.isArray(service.images)
    ? service.images
        .map(mapImageFromService)
        .filter(Boolean)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    : [];

    const familyValue =
    familyId !== null
      ? {
          ...(isObject(familyData) ? familyData : {}),
          id: familyId,
          service_family: familyName || familyData?.service_family || familyData?.name || '',
          name: familyName || familyData?.name || familyData?.service_family || '',
        }
      : null;

  const categoryValue =
    categoryId !== null
      ? {
          ...(isObject(categoryData) ? categoryData : {}),
          id: categoryId,
          service_category_id: categoryId,
          service_category_name:
            categoryName || categoryData?.service_category_name || categoryData?.name || '',
          name: categoryName || categoryData?.name || categoryData?.service_category_name || '',
          family: categoryData?.family ?? familyValue ?? null,
        }
      : null;

  const formValues = {
    serviceId,
    title: service.service_title || '',
    familyId,
    family: familyValue,
    categoryId,
    category: categoryValue,
    description: service.description || '',
    selectedLanguages: Array.isArray(service.languages) ? service.languages : [],
    isIndividual: toBoolean(service.is_individual, true),
    hobbies: service.hobbies || '',
    tags: Array.isArray(service.tags) ? service.tags : [],
    location,
    actionRate: toNumberOrNull(service.action_rate) ?? 1,
    direction: service.direction || service.formatted_address || '',
    country: service.country || '',
    street: service.street || '',
    city: service.city || '',
    state: service.state || '',
    postalCode: service.postal_code || '',
    streetNumber: service.street_number || '',
    address2: service.address_2 || '',
    isUnlocated: !(latitude !== null && longitude !== null),
    serviceImages: images,
    priceType,
    priceValue,
    allowDiscounts: toBoolean(service.allow_discounts, true),
    discountRate: toNumberOrNull(service.discount_rate),
    allowAsk: toBoolean(service.user_can_ask, true),
    allowConsults: toBoolean(service.user_can_consult, true),
    consultPrice: toNumberOrNull(service.price_consult),
    consultVia:
      service.consult_provider || service.consult_username || service.consult_url || service.consult_via || '',
    consultProvider: service.consult_provider || '',
    consultUsername: service.consult_username || '',
    consultUrl: service.consult_url || '',
    experiences,
  };

  const normalized = normalizeFormValues(formValues);

  return { formValues, normalized };
};

const uploadLocalImages = async (images) => {
  if (!images.length) return [];
  const formData = new FormData();
  images.forEach((image, index) => {
    if (!image || !image.uri) return;
    const name = image.fileName || image.name || `image${index + 1}.jpg`;
    const type = image.type || 'image/jpeg';
    formData.append('files', {
      uri: image.uri,
      name,
      type,
    });
  });

  const response = await api.post('/api/upload-images', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  console.log(response.data);
  return Array.isArray(response.data) ? response.data : [];
};

const prepareImagesForUpdate = async (serviceImages = []) => {
  if (!Array.isArray(serviceImages)) return [];

  const persisted = [];
  const localImages = [];
  const localIndexes = [];

  serviceImages.forEach((image, index) => {
    if (!image) return;
    const remoteUrl = image.remoteUrl || image.url || image.image_url;
    const uri = image.uri;

    if (remoteUrl && typeof remoteUrl === 'string') {
      persisted.push({ url: remoteUrl, order: index });
      return;
    }

    if (uri && typeof uri === 'string' && /^https?:/i.test(uri)) {
      persisted.push({ url: uri, order: index });
      return;
    }

    if (uri) {
      localImages.push(image);
      localIndexes.push(index);
    }
  });

  if (localImages.length > 0) {
    const uploadedUrls = await uploadLocalImages(localImages);
    uploadedUrls.forEach((url, idx) => {
      const order = localIndexes[idx] ?? persisted.length + idx;
      if (url) {
        persisted.push({ url, order });
      }
    });
  }

  return persisted
    .filter((img) => img && typeof img.url === 'string')
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((img, idx) => ({ url: img.url, order: idx }));
};

export const saveServiceEdits = async (serviceId, values = {}) => {
  if (!serviceId) throw new Error('Missing service id');

  const normalized = normalizeFormValues(values);
  const images = await prepareImagesForUpdate(values.serviceImages);

  const experiencesPayload = Array.isArray(values.experiences)
    ? values.experiences.map((exp) => ({
        experience_title: exp?.position || '',
        place_name: exp?.place || '',
        experience_started_date: exp?.startDate ? new Date(exp.startDate).toISOString() : null,
        experience_end_date: exp?.endDate ? new Date(exp.endDate).toISOString() : null,
      }))
    : [];

  const categoryId = normalized.categoryId;

  const payload = {
    service_title: normalized.title,
    description: normalized.description ? normalized.description : null,
    service_category_id: categoryId,
    price: normalized.priceType === 'budget' ? null : normalized.priceValue,
    price_type: normalized.priceType,
    latitude: normalized.isUnlocated || !normalized.location ? null : normalized.location?.lat ?? null,
    longitude: normalized.isUnlocated || !normalized.location ? null : normalized.location?.lng ?? null,
    action_rate: normalized.actionRate ?? null,
    user_can_ask: normalized.allowAsk,
    user_can_consult: normalized.allowConsults,
    price_consult: normalized.allowConsults ? normalized.consultPrice : null,
    consult_via_provide: normalized.allowConsults ? (values.consultVia || null) : null,
    consult_via_username: normalized.allowConsults ? (values.consultUsername || null) : null,
    consult_via_url: normalized.allowConsults ? (values.consultUrl || null) : null,
    is_individual: normalized.isIndividual,
    allow_discounts: normalized.allowDiscounts,
    discount_rate: normalized.allowDiscounts ? normalized.discountRate : null,
    hobbies: normalized.hobbies ? normalized.hobbies : null,
    languages: normalized.selectedLanguages,
    tags: normalized.tags,
    experiences: experiencesPayload,
    images,
  };

  await api.put(`/api/services/${serviceId}`, payload);
};

export const buildEditPrevParams = (service, extras = {}) => {
  const { formValues, normalized } = mapServiceToFormValues(service);
  const serviceId = extras.serviceId ?? formValues.serviceId ?? service?.service_id ?? service?.id;

  return {
    ...formValues,
    ...extras,
    serviceId,
    mode: 'edit',
    originalNormalized: normalized,
  };
};

export const useServiceFormEditing = ({ prevParams = {}, currentValues = {}, t }) => {
  const navigation = useNavigation();
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  const serviceId = prevParams.serviceId;
  const originScreen = prevParams.originScreen;
  const originParams = prevParams.originParams;
  const mode = prevParams.mode;
  const originalNormalized = prevParams.originalNormalized;

  const isEditing = mode === 'edit' && Boolean(serviceId);

  const combinedValues = useMemo(
    () => ({
      ...prevParams,
      ...currentValues,
    }),
    [prevParams, currentValues]
  );

  const normalized = useMemo(() => normalizeFormValues(combinedValues), [combinedValues]);

  const hasChanges = useMemo(() => {
    if (!isEditing || !originalNormalized) return false;
    return !deepEqual(normalized, originalNormalized);
  }, [isEditing, normalized, originalNormalized]);

  const goToOrigin = useCallback(() => {
    if (originScreen) {
      navigation.navigate(originScreen, originParams || {});
    } else {
      navigation.goBack();
    }
  }, [navigation, originScreen, originParams]);

  const handleSave = useCallback(async () => {
    if (!isEditing || saving) return;
    if (!hasChanges) {
      goToOrigin();
      return;
    }

    try {
      setSaving(true);
      await saveServiceEdits(serviceId, combinedValues);
      goToOrigin();
    } catch (error) {
      console.error('Error saving service edition', error);
      if (t) {
        Alert.alert(t('service_edit_save_error'));
      } else {
        Alert.alert('Error', 'Failed to save service');
      }
    } finally {
      setSaving(false);
    }
  }, [isEditing, saving, hasChanges, goToOrigin, serviceId, combinedValues, t]);

  const requestBack = useCallback(() => {
    if (!isEditing) {
      navigation.goBack();
      return;
    }

    if (!hasChanges) {
      goToOrigin();
      return;
    }

    setConfirmVisible(true);
  }, [isEditing, hasChanges, navigation, goToOrigin]);

  const handleConfirmSave = useCallback(() => {
    setConfirmVisible(false);
    handleSave();
  }, [handleSave]);

  const handleDiscardChanges = useCallback(() => {
    setConfirmVisible(false);
    goToOrigin();
  }, [goToOrigin]);

  const handleDismissConfirm = useCallback(() => {
    setConfirmVisible(false);
  }, []);

  return {
    isEditing,
    hasChanges,
    saving,
    requestBack,
    handleSave,
    confirmVisible,
    handleConfirmSave,
    handleDiscardChanges,
    handleDismissConfirm,
  };
};
