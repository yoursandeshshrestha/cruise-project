import { useState } from 'react';
import { TerminalFormData, Terminal } from '../types';

const defaultFormData: TerminalFormData = {
  name: '',
  location: 'Southampton',
  description: '',
};

export const useTerminalForm = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<TerminalFormData>(defaultFormData);

  const handleOpenDialog = (terminal?: Terminal) => {
    if (terminal) {
      setFormData({
        id: terminal.id,
        name: terminal.name,
        location: terminal.location || 'Southampton',
        description: terminal.description || '',
      });
    } else {
      setFormData(defaultFormData);
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setFormData(defaultFormData);
  };

  return {
    isDialogOpen,
    formData,
    setFormData,
    handleOpenDialog,
    handleCloseDialog,
  };
};
