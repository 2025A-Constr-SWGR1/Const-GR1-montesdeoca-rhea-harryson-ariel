
import { supabase } from '../index.ts';

export const consolesService = {
  async getAllConsoles() {
    const { data, error } = await supabase
      .from('consoles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error fetching consoles: ${error.message}`);
    }

    return data;
  },

  async getConsoleById(id: string) {
    const { data, error } = await supabase
      .from('consoles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`Console not found: ${error.message}`);
    }

    return data;
  },

  async createConsole(consoleData: any) {
    const { data, error } = await supabase
      .from('consoles')
      .insert([consoleData])
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating console: ${error.message}`);
    }

    return data;
  },

  async updateConsole(id: string, updateData: any) {
    const { data, error } = await supabase
      .from('consoles')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating console: ${error.message}`);
    }

    return data;
  },

  async deleteConsole(id: string) {
    const { error } = await supabase
      .from('consoles')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Error deleting console: ${error.message}`);
    }

    return true;
  },

  async updateConsoleStatus(id: string, status: string) {
    const { data, error } = await supabase
      .from('consoles')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating console status: ${error.message}`);
    }

    return data;
  }
};
