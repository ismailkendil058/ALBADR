import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label'; // Added Label import


import { Save, Search, Store, Loader2, Upload } from 'lucide-react'; // Added Upload icon
import { useToast } from '@/hooks/use-toast';
import { useTariffs, useBulkUpdateTariffs, useBulkImportTariffs, Tariff } from '@/hooks/useTariffs';

import { UseMutationResult } from '@tanstack/react-query'; // Import UseMutationResult

import * as XLSX from 'xlsx'; // Import xlsx library
import { saveAs } from 'file-saver'; // Import file-saver

interface ImportedTariffData {
  wilaya_code: number;
  wilaya_name: string;
  home_price: number;
  bureau_price: number;
  retour: number;
  store: 'laghouat' | 'aflou';
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
              <th className="w-2/6 text-center py-3 px-2 font-medium">Wilaya</th>
              <th className="w-1/6 text-center py-3 px-2 font-medium">Home</th>
              <th className="w-1/6 text-center py-3 px-2 font-medium">Bureau</th>
              <th className="w-1/6 text-center py-3 px-2 font-medium">Return</th>
              <th className="w-1/6 text-center py-3 px-2 font-medium">Active</th>
            </tr>
          </thead>
          <tbody>
            {tariffs.map((tariff, index) => (
              <tr key={tariff.id} className={index % 2 === 0 ? 'bg-muted/20' : ''}>
                <td className="py-2 px-2 font-medium text-center">
                  {tariff.wilaya_code} - {tariff.wilaya_name}
                </td>
                <td className="py-2 px-2 text-center">
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
                <td className="py-2 px-2 text-center">
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
                <td className="py-2 px-2 text-center">
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
  const bulkImport = useBulkImportTariffs(); // Use the new hook
  const { toast } = useToast();

  const [searchLaghouat, setSearchLaghouat] = useState('');
  const [searchAflou, setSearchAflou] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [file, setFile] = useState<File | null>(null); // State for uploaded file
  const [parsedData, setParsedData] = useState<ImportedTariffData[]>([]); // State for parsed data, now typed

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

  const handleDownloadTemplate = () => {
    const headers = ['wilaya_code', 'wilaya_name', 'home_price', 'bureau_price', 'retour', 'store'];
    const data = [
      headers,
      // Example row
      ['16', 'Algiers', '300', '250', '50', 'laghouat'],
      ['16', 'Algiers', '350', '300', '60', 'aflou'],
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Tariffs');
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const dataBlob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(dataBlob, 'tariffs_template.xlsx');
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (!uploadedFile) {
      setFile(null);
      setParsedData([]);
      return;
    }

    setFile(uploadedFile);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const binaryStr = e.target?.result;
        const workbook = XLSX.read(binaryStr, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json: any[] = XLSX.utils.sheet_to_json(worksheet);

        const validatedData: ImportedTariffData[] = [];
        const errors: string[] = [];

        json.forEach((row, index) => {
          const rowNum = index + 2; // +1 for 0-indexed, +1 for header row (excel row numbers)
          const newTariff: Partial<ImportedTariffData> = {};
          let isValidRow = true;

          // Validate wilaya_code
          if (typeof row.wilaya_code === 'number' && !isNaN(row.wilaya_code)) {
            newTariff.wilaya_code = row.wilaya_code;
          } else {
            errors.push(`Row ${rowNum}: 'wilaya_code' is missing or invalid.`);
            isValidRow = false;
          }

          // Validate wilaya_name
          if (typeof row.wilaya_name === 'string' && row.wilaya_name.trim() !== '') {
            newTariff.wilaya_name = row.wilaya_name.trim();
          } else {
            errors.push(`Row ${rowNum}: 'wilaya_name' is missing or invalid.`);
            isValidRow = false;
          }

          // Validate home_price, bureau_price, retour
          ['home_price', 'bureau_price', 'retour'].forEach(field => {
            const value = parseFloat(row[field]);
            if (!isNaN(value) && value >= 0) {
              (newTariff as any)[field] = value;
            } else {
              errors.push(`Row ${rowNum}: '${field}' is missing or invalid (must be a non-negative number).`);
              isValidRow = false;
            }
          });

          // Validate store
          if (typeof row.store === 'string' && ['laghouat', 'aflou'].includes(row.store.toLowerCase())) {
            newTariff.store = row.store.toLowerCase() as 'laghouat' | 'aflou';
          } else {
            errors.push(`Row ${rowNum}: 'store' is missing or invalid (must be 'laghouat' or 'aflou').`);
            isValidRow = false;
          }

          if (isValidRow) {
            validatedData.push(newTariff as ImportedTariffData);
          }
        });

        setParsedData(validatedData);

        if (errors.length > 0) {
          toast({
            title: 'File Uploaded with Warnings/Errors',
            description: (
              <div>
                <p>{uploadedFile.name} parsed. Some rows have issues:</p>
                <ul className="list-disc pl-5">
                  {errors.slice(0, 5).map((err, i) => <li key={i}>{err}</li>)}
                  {errors.length > 5 && <li>And {errors.length - 5} more errors...</li>}
                </ul>
              </div>
            ),
            variant: 'destructive',
            duration: 9000,
          });
        } else {
          toast({
            title: 'File Uploaded Successfully',
            description: `${uploadedFile.name} parsed. ${validatedData.length} valid rows found.`,
          });
        }

      } catch (error: any) {
        toast({
          title: 'Error reading file',
          description: error.message || 'Could not parse the uploaded file. Ensure it\'s a valid CSV/Excel format.',
          variant: 'destructive',
          duration: 9000,
        });
        setFile(null);
        setParsedData([]);
      }
    };

    reader.onerror = () => {
      toast({
        title: 'Error',
        description: 'Failed to read file.',
        variant: 'destructive',
      });
      setFile(null);
      setParsedData([]);
    };

    reader.readAsBinaryString(uploadedFile);
  };

  const handleBulkImport = async () => {
    if (parsedData.length === 0) {
      toast({
        title: 'No data to import',
        description: 'Please upload a valid file with tariff data.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const results = await bulkImport.mutateAsync(parsedData);
      
      let description = '';
      if (results.successfulInserts > 0) {
        description += `${results.successfulInserts} new tariffs inserted. `;
      }
      if (results.successfulUpdates > 0) {
        description += `${results.successfulUpdates} existing tariffs updated. `;
      }
      if (results.failedImports.length > 0) {
        description += `${results.failedImports.length} tariffs failed to import.`;
        toast({
          title: 'Bulk Import Completed with Errors',
          description: (
            <div>
              <p>{description}</p>
              <ul className="list-disc pl-5">
                {results.failedImports.slice(0, 3).map((item, i) => (
                  <li key={i}>Wilaya {item.tariff.wilaya_code} ({item.tariff.store}): {item.error}</li>
                ))}
                {results.failedImports.length > 3 && <li>And {results.failedImports.length - 3} more failures...</li>}
              </ul>
            </div>
          ),
          variant: 'destructive',
          duration: 9000,
        });
      } else {
        toast({
          title: 'Bulk Import Successful',
          description: description || 'All tariffs imported successfully.',
        });
      }

      setFile(null);
      setParsedData([]); // Clear parsed data after import
    } catch (error: any) {
      toast({
        title: 'Bulk Import Failed',
        description: error.message || 'An unexpected error occurred during import.',
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

      {/* Bulk Import Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Bulk Import Tariffs</CardTitle>
          <p className="text-sm text-muted-foreground">Upload a CSV or Excel file to update tariffs.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Button onClick={handleDownloadTemplate} className="w-full sm:w-auto">
              Download Template
            </Button>
            <div className="relative w-full sm:w-auto flex-grow">
              <Label htmlFor="tariff-upload" className="flex items-center justify-center h-10 w-full sm:w-auto cursor-pointer rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground">
                  {file ? file.name : "Choose file..."}
              </Label>
              <Input
                id="tariff-upload"
                type="file"
                accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                onChange={handleFileUpload}
                className="sr-only" // Hide the native input visually but keep it accessible
              />
            </div>
            <Button 
                onClick={handleBulkImport} 
                disabled={parsedData.length === 0 || bulkImport.isPending} 
                className="w-full sm:w-auto"
            >
              {bulkImport.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Upload className="w-4 h-4 mr-2" />
              )}
              Import Tariffs ({parsedData.length} rows)
            </Button>
          </div>
          {parsedData.length > 0 && (
            <div className="border rounded-md p-4 max-h-60 overflow-y-auto">
              <h3 className="text-md font-semibold mb-2">Preview Data ({parsedData.length} rows)</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50">
                    {Object.keys(parsedData[0]).map((key) => (
                      <th key={key} className="py-2 px-3 text-center font-medium">{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {parsedData.slice(0, 5).map((row, rowIndex) => ( // Show first 5 rows for preview
                    <tr key={rowIndex} className="border-t">
                      {Object.values(row).map((value: any, colIndex) => (
                        <td key={colIndex} className="py-2 px-3 text-center">{String(value)}</td>
                      ))}
                    </tr>
                  ))}
                  {parsedData.length > 5 && (
                    <tr>
                      <td colSpan={Object.keys(parsedData[0]).length} className="text-center py-2 text-muted-foreground">
                        ... {parsedData.length - 5} more rows
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>


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