import { useState } from 'react';
import { CruiseLineFormData, CruiseLine } from '../types';

const INITIAL_FORM_STATE: CruiseLineFormData = {
  name: '',
  ships: [''],
};

export const useCruiseLineForm = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<CruiseLineFormData>(INITIAL_FORM_STATE);

  const handleOpenDialog = (cruiseLine?: CruiseLine) => {
    if (cruiseLine) {
      setFormData({
        id: cruiseLine.id,
        name: cruiseLine.name,
        ships: cruiseLine.ships.length > 0 ? cruiseLine.ships : [''],
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

  const handleAddShip = () => {
    setFormData(prev => ({
      ...prev,
      ships: [...prev.ships, ''],
    }));
  };

  const handleRemoveShip = (index: number) => {
    setFormData(prev => ({
      ...prev,
      ships: prev.ships.filter((_, i) => i !== index),
    }));
  };

  const handleShipChange = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      ships: prev.ships.map((ship, i) => (i === index ? value : ship)),
    }));
  };

  return {
    isDialogOpen,
    formData,
    setFormData,
    handleOpenDialog,
    handleCloseDialog,
    handleAddShip,
    handleRemoveShip,
    handleShipChange,
  };
};
