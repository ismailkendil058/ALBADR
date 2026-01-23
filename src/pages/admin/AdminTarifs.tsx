import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';


import { Save, Search, Store, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTariffs, useBulkUpdateTariffs, Tariff } from '@/hooks/useTariffs';

import { UseMutationResult } from '@tanstack/react-query'; // Import UseMutationResult

interface TariffTableProps {
  tariffs: Tariff[];
  search: string;
  setSearch: (s: string) => void;
  store: 'laghouat' | 'aflou';
  storeName: string;
  storeColor: string;
  saveTariffs: () => Promise<void>;
  bulkUpdate: UseMutationResult<any, Error, { id: string; home_price: number; bureau_price: number; retour: number }[], unknown>;
  getLocalValue: (tariff: Tariff, field: 'home_price' | 'bureau_price' | 'retour') => string;
  updateLocalPrice: (tariffId: string, tariff: Tariff, field: 'home_price' | 'bureau_price' | 'retour', value: string) => void;
  updateLocalIsActive: (tariffId: string, tariff: Tariff, value: boolean) => void;
  getLocalIsActive: (tariff: Tariff) => boolean;
  hasChanges: boolean;
}

const TariffTable: React.FC<TariffTableProps> = ({
  tariffs,
  search,
  setSearch,
  store,
  storeName,
  storeColor,
  saveTariffs,
  bulkUpdate,
  getLocalValue,
  updateLocalPrice,
  updateLocalIsActive,
  getLocalIsActive,
  hasChanges
}) => (
  <Card>
    <CardHeader className="pb-4">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 ${storeColor} rounded-full flex items-center justify-center`}>
            <Store className="w-5 h-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-lg">{storeName} Tariffs</CardTitle>
            <p className="text-sm text-muted-foreground">{tariffs.length} wilayas</p>
          </div>
        </div>
        <Button onClick={saveTariffs} disabled={bulkUpdate.isPending || !hasChanges}>
          {bulkUpdate.isPending ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Save Tariffs
        </Button>
      </div>
      <div className="relative mt-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search wilaya..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>
    </CardHeader>
    <CardContent>
      <div className="overflow-x-auto">
        <table className="w-full table-fixed">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="w-2/6 text-left py-3 px-2 font-medium">Wilaya</th>
              <th className="w-1/6 text-center py-3 px-2 font-medium">Home</th>
              <th className="w-1/6 text-center py-3 px-2 font-medium">Bureau</th>
              <th className="w-1/6 text-center py-3 px-2 font-medium">Return</th>
              <th className="w-1/6 text-center py-3 px-2 font-medium">Active</th>
            </tr>
          </thead>
          <tbody>
            {tariffs.map((tariff, index) => (
              <tr key={tariff.id} className={index % 2 === 0 ? 'bg-muted/20' : ''}>
                <td className="py-2 px-2 font-medium" dir="rtl">
                  {tariff.wilaya_code} - {tariff.wilaya_name}
                </td>
                <td className="py-2 px-2">
                  <Input
                    type="text"
                    pattern="[0-9]*"
                    value={getLocalValue(tariff, 'home_price')}
                    onChange={(e) => {
                      updateLocalPrice(tariff.id, tariff, 'home_price', e.target.value);
                    }}
                    className="w-full mx-auto text-center"
                  />
                </td>
                <td className="py-2 px-2">
                  <Input
                    type="text"
                    pattern="[0-9]*"
                    value={getLocalValue(tariff, 'bureau_price')}
                    onChange={(e) => {
                      updateLocalPrice(tariff.id, tariff, 'bureau_price', e.target.value);
                    }}
                    className="w-full mx-auto text-center"
                  />
                </td>
                <td className="py-2 px-2">
                  <Input
                    type="text"
                    pattern="[0-9]*"
                    value={getLocalValue(tariff, 'retour')}
                    onChange={(e) => {
                      updateLocalPrice(tariff.id, tariff, 'retour', e.target.value);
                    }}
                    className="w-full mx-auto text-center"
                  />
                </td>
                <td className="py-2 px-2 text-center">
                  <div
                    className={`h-4 w-4 rounded-full mx-auto cursor-pointer transition-colors duration-200 ${
                      getLocalIsActive(tariff) ? 'bg-gray-400' : 'bg-deep-red'
                    }`}
                    onClick={() => updateLocalIsActive(tariff.id, tariff, !getLocalIsActive(tariff))}
                  ></div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </CardContent>
  </Card>
);

const AdminTarifs: React.FC = () => {
  const { data: allTariffs = [], isLoading } = useTariffs();
  const bulkUpdate = useBulkUpdateTariffs();
  const { toast } = useToast();

  const [searchLaghouat, setSearchLaghouat] = useState('');
  const [searchAflou, setSearchAflou] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  
  // Local state for editing
  const [localTariffs, setLocalTariffs] = useState<Record<string, { home_price?: string | number; bureau_price?: string | number; retour?: string | number; is_active?: boolean }>>({});

  const laghouatTariffs = allTariffs.filter(t => t.store === 'laghouat');
  const aflouTariffs = allTariffs.filter(t => t.store === 'aflou');

  const getLocalValue = (tariff: Tariff, field: 'home_price' | 'bureau_price' | 'retour') => {
    const value = localTariffs[tariff.id]?.[field] ?? tariff[field];
    return String(value);
  };

  const getLocalIsActive = (tariff: Tariff) => {
    return (localTariffs[tariff.id]?.is_active ?? tariff.is_active) ?? true;
  };

  const updateLocalPrice = (tariffId: string, tariff: Tariff, field: 'home_price' | 'bureau_price' | 'retour', value: string) => {
    setHasChanges(true);
    setLocalTariffs(prev => {
      const existingTariff = prev[tariffId] || { 
        home_price: tariff.home_price, 
        bureau_price: tariff.bureau_price,
        retour: tariff.retour,
        is_active: tariff.is_active 
      };
      return {
        ...prev,
        [tariffId]: {
          ...existingTariff,
          [field]: value,
        }
      };
    });
  };

  const updateLocalIsActive = (tariffId: string, tariff: Tariff, value: boolean) => {
    setHasChanges(true);
    setLocalTariffs(prev => {
      // Update the current tariff
      const updatedPrev = { ...prev };
      const existingTariff = updatedPrev[tariffId] || { 
        home_price: tariff.home_price, 
        bureau_price: tariff.bureau_price,
        retour: tariff.retour,
        is_active: tariff.is_active 
      };
      updatedPrev[tariffId] = {
        ...existingTariff,
        is_active: value,
      };

      // Find the corresponding tariff in the other store and update it
      const otherStore = tariff.store === 'laghouat' ? 'aflou' : 'laghouat';
      const correspondingTariff = allTariffs.find(t => t.wilaya_code === tariff.wilaya_code && t.store === otherStore);

      if (correspondingTariff) {
        const existingOtherTariff = updatedPrev[correspondingTariff.id] || {
          home_price: correspondingTariff.home_price,
          bureau_price: correspondingTariff.bureau_price,
          retour: correspondingTariff.retour,
          is_active: correspondingTariff.is_active,
        };
        updatedPrev[correspondingTariff.id] = {
          ...existingOtherTariff,
          is_active: value,
        };
      }
      return updatedPrev;
    });
  };

  const saveTariffs = async () => {
    const updates = allTariffs
      .filter(t => localTariffs[t.id] && (
        (localTariffs[t.id]?.home_price ?? t.home_price) !== t.home_price ||
        (localTariffs[t.id]?.bureau_price ?? t.bureau_price) !== t.bureau_price ||
        (localTariffs[t.id]?.retour ?? t.retour) !== t.retour ||
        (localTariffs[t.id]?.is_active ?? t.is_active) !== t.is_active
      ))
      .map(t => ({
        id: t.id,
        home_price: parseFloat(String(localTariffs[t.id]?.home_price ?? t.home_price)) || undefined,
        bureau_price: parseFloat(String(localTariffs[t.id]?.bureau_price ?? t.bureau_price)) || undefined,
        retour: parseFloat(String(localTariffs[t.id]?.retour ?? t.retour)) || undefined,
        is_active: (localTariffs[t.id]?.is_active === undefined ? t.is_active : localTariffs[t.id]?.is_active) ?? undefined
      }));

    if (updates.length === 0) {
      toast({
        title: 'No changes',
        description: 'No tariffs were modified',
      });
      return;
    }

    try {
      await bulkUpdate.mutateAsync(updates);
      setHasChanges(false); // Reset hasChanges after successful save
      // Clear local state for saved tariffs
      setLocalTariffs(prev => {
        const newState = { ...prev };
        updates.forEach(u => delete newState[u.id]);
        return newState;
      });
      toast({
        title: 'Saved',
        description: `All tariffs saved successfully`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save tariffs',
        variant: 'destructive',
      });
    }
  };

  const filteredLaghouat = React.useMemo(() => {
    return laghouatTariffs.filter(t => 
      t.wilaya_name.toLowerCase().includes(searchLaghouat.toLowerCase()) || 
      String(t.wilaya_code).includes(searchLaghouat)
    );
  }, [laghouatTariffs, searchLaghouat]);

  const filteredAflou = React.useMemo(() => {
    return aflouTariffs.filter(t => 
      t.wilaya_name.toLowerCase().includes(searchAflou.toLowerCase()) || 
      String(t.wilaya_code).includes(searchAflou)
    );
  }, [aflouTariffs, searchAflou]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }



  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Tariffs</h1>
        <p className="text-muted-foreground">Manage delivery prices for each wilaya per store</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> The store with the lowest delivery price is automatically selected at checkout. If prices are equal, Laghouat is selected by default.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <TariffTable
          tariffs={filteredLaghouat}
          search={searchLaghouat}
          setSearch={setSearchLaghouat}
          store="laghouat"
          storeName="Laghouat"
          storeColor="bg-primary"
          saveTariffs={saveTariffs}
          bulkUpdate={bulkUpdate}
          getLocalValue={getLocalValue}
          updateLocalPrice={updateLocalPrice}
          updateLocalIsActive={updateLocalIsActive}
          getLocalIsActive={getLocalIsActive}
          hasChanges={hasChanges}
        />

        <TariffTable
          tariffs={filteredAflou}
          search={searchAflou}
          setSearch={setSearchAflou}
          store="aflou"
          storeName="Aflou"
          storeColor="bg-orange-500"
          saveTariffs={saveTariffs}
          bulkUpdate={bulkUpdate}
          getLocalValue={getLocalValue}
          updateLocalPrice={updateLocalPrice}
          updateLocalIsActive={updateLocalIsActive}
          getLocalIsActive={getLocalIsActive}
          hasChanges={hasChanges}
        />
      </div>
    </div>
  );
};

export default AdminTarifs;