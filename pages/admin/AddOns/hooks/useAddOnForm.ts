import { useState } from 'react';
import { AddOnFormData, AddOn } from '../types';

const INITIAL_FORM_STATE: AddOnFormData = {
  slug: '',
  name: '',
  description: '',
  price: '',
};

export const useAddOnForm = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<AddOnFormData>(INITIAL_FORM_STATE);

  const handleOpenDialog = (addOn?: AddOn) => {
    if (addOn) {
      setFormData({
        id: addOn.id,
        slug: addOn.slug,
        name: addOn.name,
        description: addOn.description || '',
        price: addOn.price.toString(),
      });
    } else {
      setFormData(INITIAL_FORM_STATE);
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setFormData(INITIAL_FORM_STATE);
  };

  return {
    isDialogOpen,
    formData,
    setFormData,
    handleOpenDialog,
    handleCloseDialog,
  };
};
