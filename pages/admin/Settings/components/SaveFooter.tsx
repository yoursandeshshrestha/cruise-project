import React from 'react';
import { Save } from 'lucide-react';
import { Button } from '../../../../components/admin/ui/button';
import { Spinner } from '../../../../components/admin/ui/spinner';

interface SaveFooterProps {
  hasChanges: boolean;
  changeCount: number;
  isSaving: boolean;
  onSave: () => void;
  isCollapsed: boolean;
}

export const SaveFooter: React.FC<SaveFooterProps> = ({
  hasChanges,
  changeCount,
  isSaving,
  onSave,
  isCollapsed,
}) => {
  return (
    <div className={`fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-10 ${
      isCollapsed ? 'lg:left-16' : 'lg:left-64'
    }`}>
      <div className="p-4 flex items-center justify-between">
        <div className="text-sm">
          {hasChanges ? (
            <span className="text-orange-600 font-medium">
              {changeCount} unsaved {changeCount === 1 ? 'change' : 'changes'} - Click save to apply
            </span>
          ) : (
            <span className="text-muted-foreground">All changes saved</span>
          )}
        </div>
        <Button onClick={onSave} disabled={isSaving || !hasChanges} className="cursor-pointer">
          {isSaving ? (
            <>
              <Spinner className="w-4 h-4 mr-2" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
