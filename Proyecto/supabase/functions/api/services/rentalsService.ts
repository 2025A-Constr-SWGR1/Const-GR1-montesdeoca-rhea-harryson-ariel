
import { supabase } from '../index.ts';
import { consolesService } from './consolesService.ts';

export const rentalsService = {
  async getUserRentals(userId: string) {
    const { data, error } = await supabase
      .from('rentals')
      .select(`
        *,
        consoles (
          id,
          name,
          model,
          image_url
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error fetching rentals: ${error.message}`);
    }

    return data;
  },

  async getRentalById(id: string, userId: string) {
    const { data, error } = await supabase
      .from('rentals')
      .select(`
        *,
        consoles (
          id,
          name,
          model,
          image_url
        )
      `)
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) {
      throw new Error(`Rental not found: ${error.message}`);
    }

    return data;
  },

  async createRental(rentalData: any) {
    // Check if console is available
    const console = await consolesService.getConsoleById(rentalData.console_id);
    if (console.status !== 'available') {
      throw new Error('Console is not available for rental');
    }

    // Calculate total amount
    const rentalDays = Math.ceil(
      (new Date(rentalData.expected_return_date) - new Date(rentalData.rental_date)) / (1000 * 60 * 60 * 24)
    );
    const totalAmount = rentalDays * rentalData.daily_rate;

    rentalData.total_amount = totalAmount;

    // Create rental
    const { data, error } = await supabase
      .from('rentals')
      .insert([rentalData])
      .select(`
        *,
        consoles (
          id,
          name,
          model,
          image_url
        )
      `)
      .single();

    if (error) {
      throw new Error(`Error creating rental: ${error.message}`);
    }

    // Update console status to 'rented'
    await consolesService.updateConsoleStatus(rentalData.console_id, 'rented');

    return data;
  },

  async updateRental(id: string, updateData: any, userId: string) {
    const { data, error } = await supabase
      .from('rentals')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select(`
        *,
        consoles (
          id,
          name,
          model,
          image_url
        )
      `)
      .single();

    if (error) {
      throw new Error(`Error updating rental: ${error.message}`);
    }

    return data;
  },

  async returnRental(id: string, userId: string) {
    // Get the rental
    const rental = await this.getRentalById(id, userId);
    
    if (rental.status === 'returned') {
      throw new Error('Rental has already been returned');
    }

    // Update rental status and return date
    const { data, error } = await supabase
      .from('rentals')
      .update({
        status: 'returned',
        return_date: new Date().toISOString().split('T')[0]
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select(`
        *,
        consoles (
          id,
          name,
          model,
          image_url
        )
      `)
      .single();

    if (error) {
      throw new Error(`Error returning rental: ${error.message}`);
    }

    // Update console status back to 'available'
    await consolesService.updateConsoleStatus(rental.console_id, 'available');

    return data;
  }
};
