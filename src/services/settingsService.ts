import { supabase } from "@/integrations/supabase/client";

export interface SiteSetting {
    id: number;
    key: string;
    value: string;
    description?: string;
}

export const settingsService = {
    async getSettings() {
        const { data, error } = await supabase
            .from('site_settings' as any)
            .select('*');

        if (error) {
            console.error('Error fetching settings:', JSON.stringify(error, null, 2));
            // Gracefully handle missing table by returning empty array
            // This prevents the entire app from crashing if the SQL hasn't been run yet
            if (error.code === '42P01') { // undefined_table
                console.warn('The "site_settings" table does not exist. Please run the setup_analytics.sql script in your Supabase SQL Editor.');
                return [];
            }
            throw error;
        }

        return data as SiteSetting[];
    },

    async getSettingByKey(key: string) {
        const { data, error } = await supabase
            .from('site_settings' as any)
            .select('*')
            .eq('key', key)
            .single();

        if (error) {
            console.error(`Error fetching setting ${key}:`, error);
            return null;
        }

        return data as SiteSetting;
    },

    async updateSetting(key: string, value: string) {
        const { data, error } = await supabase
            .from('site_settings' as any)
            .update({ value })
            .eq('key', key)
            .select()
            .single();

        if (error) {
            console.error(`Error updating setting ${key}:`, error);
            throw error;
        }

        return data as SiteSetting;
    },

    async updateSettings(settings: { key: string; value: string }[]) {
        const updates = settings.map(setting =>
            this.updateSetting(setting.key, setting.value)
        );
        return Promise.all(updates);
    }
};
